import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import './Dues.css';

const API =
  process.env.REACT_APP_API_URL ||
  'https://svs-jewellery-works-backend.onrender.com';

const money = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(n || 0));

const dateTime = (value) =>
  value
    ? new Date(value).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '—';

const balance = (due) =>
  Math.max(0, Number(due.totalAmount || 0) - Number(due.amountPaid || 0));

const getPhone = (value) => String(value || '').trim();

export default function Dues() {
  const [tab, setTab] = useState('list');
  const [dues, setDues] = useState([]);
  const [summary, setSummary] = useState({
    totalOutstanding: 0,
    overdueAmount: 0,
    collectedThisMonth: 0,
    customersWithDue: 0,
  });
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('pending');
  const [selectedPhone, setSelectedPhone] = useState('');
  const [modal, setModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState('Cash');
  const [confirmCollectionOpen, setConfirmCollectionOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [lookupDone, setLookupDone] = useState(false);
  const [customerInvoices, setCustomerInvoices] = useState([]);
  const paymentRef = useRef(null);
  const mobileRef = useRef(null);

  const [customer, setCustomer] = useState({
    customerName: '',
    teluguCustomerName: '',
    phoneNumber: '',
  });

  const [invoice, setInvoice] = useState({
    invoiceNumber: '',
    totalAmount: '',
    amountPaid: '',
    dueDate: '',
  });

  const load = useCallback(async () => {
    try {
      const [duesResponse, summaryResponse] = await Promise.all([
        axios.get(`${API}/api/dues`),
        axios.get(`${API}/api/dues/reports/summary`),
      ]);

      setDues(duesResponse.data.dues || []);
      setSummary(summaryResponse.data.summary || {});
      setError('');
    } catch (e) {
      setError(
        e.response?.data?.message ||
          'Could not load dues. Check the backend route and server status.'
      );
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const customerGroups = useMemo(() => {
    const groups = new Map();

    dues.forEach((due) => {
      const phone = getPhone(due.phoneNumber);
      const key = phone || `due-${due.dueId}`;

      if (!groups.has(key)) {
        groups.set(key, {
          phoneNumber: phone,
          customerName: due.customerName || '',
          teluguCustomerName: due.teluguCustomerName || '',
          invoices: [],
        });
      }

      const group = groups.get(key);

      if (!group.customerName && due.customerName) {
        group.customerName = due.customerName;
      }

      if (!group.teluguCustomerName && due.teluguCustomerName) {
        group.teluguCustomerName = due.teluguCustomerName;
      }

      group.invoices.push(due);
    });

    return Array.from(groups.values()).map((group) => ({
      ...group,

      invoices: group.invoices.sort(
        (a, b) =>
          new Date(a.startDate || 0) - new Date(b.startDate || 0)
      ),

      totalAmount: group.invoices.reduce(
        (sum, due) => sum + Number(due.totalAmount || 0),
        0
      ),

      totalPaid: group.invoices.reduce(
        (sum, due) => sum + Number(due.amountPaid || 0),
        0
      ),

      totalDue: group.invoices.reduce(
        (sum, due) => sum + balance(due),
        0
      ),
    }));
  }, [dues]);

  const selectedCustomer = useMemo(
    () =>
      customerGroups.find(
        (group) => group.phoneNumber === selectedPhone
      ),
    [customerGroups, selectedPhone]
  );

  const selected = selectedCustomer?.invoices || [];

  const customerTotal = selected.reduce(
    (sum, due) => sum + Number(due.totalAmount || 0),
    0
  );

  const customerPaid = selected.reduce(
    (sum, due) => sum + Number(due.amountPaid || 0),
    0
  );

  const customerDue = selected.reduce(
    (sum, due) => sum + balance(due),
    0
  );

  const filteredCustomers = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();

    return customerGroups
      .filter((group) => {
        const invoiceNumbers = group.invoices
          .map((due) => due.invoiceNumber)
          .join(' ');

        const invoiceIds = group.invoices
          .map((due) => due.dueId)
          .join(' ');

        const historyAmounts = group.invoices
          .flatMap((due) => [
            due.totalAmount,
            due.amountPaid,
            balance(due),
            ...(due.paidHistory || []).map(
              (payment) => payment.amount
            ),
          ])
          .join(' ');

        const haystack = [
          group.phoneNumber,
          group.customerName,
          group.teluguCustomerName,
          invoiceNumbers,
          invoiceIds,
          historyAmounts,
          group.totalAmount,
          group.totalPaid,
          group.totalDue,
          ...group.invoices.map((due) => due.status),
        ]
          .join(' ')
          .toLocaleLowerCase();

        const matchesQuery = !term || haystack.includes(term);

        const matchesFilter =
          filter === 'all' ||
          (filter === 'pending' && group.totalDue > 0) ||
          (filter === 'paid' && group.totalDue === 0);

        return matchesQuery && matchesFilter;
      })
      .sort((a, b) => b.totalDue - a.totalDue);
  }, [customerGroups, query, filter]);

  const openCustomer = (phone) => {
    setSelectedPhone(phone);
    setPayAmount('');
    setError('');
    setConfirmCollectionOpen(false);
    setModal(true);
  };

  useEffect(() => {
    if (modal) {
      setTimeout(() => paymentRef.current?.focus(), 100);
    }
  }, [modal, selectedPhone]);

  useEffect(() => {
    if (addOpen) {
      setTimeout(() => mobileRef.current?.focus(), 100);
    }
  }, [addOpen]);

  const collectCustomerPayment = async (event) => {
    event.preventDefault();

    const amount = Number(payAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Enter a payment amount greater than zero.');
      return;
    }

    if (amount > customerDue) {
      setError(
        `Collected amount cannot exceed the total due of ${money(customerDue)}.`
      );
      return;
    }

    setConfirmCollectionOpen(true);
    setError('');
  };

  const confirmCollection = async () => {
    let remaining = Number(payAmount);

    if (
      !Number.isFinite(remaining) ||
      remaining <= 0 ||
      remaining > customerDue
    ) {
      setError('Enter a valid collection amount.');
      setConfirmCollectionOpen(false);
      return;
    }

    try {
      setBusy(true);
      setError('');

      // Allocate the collection across oldest unpaid invoices first.
      // Each allocation is recorded in that invoice's payment history.
      for (const due of selected) {
        if (remaining <= 0) break;

        const invoiceBalance = balance(due);

        if (invoiceBalance <= 0) continue;

        const allocation = Math.min(remaining, invoiceBalance);

        await axios.post(
          `${API}/api/dues/${due.dueId}/payments`,
          {
            amount: Number(allocation.toFixed(2)),
            mode: payMode,
          }
        );

        remaining = Number(
          (remaining - allocation).toFixed(2)
        );
      }

      setPayAmount('');
      setConfirmCollectionOpen(false);

      await load();
    } catch (e) {
      setError(
        e.response?.data?.message ||
          'Collection could not be fully saved. Refresh the account and verify payment history before retrying.'
      );

      await load();
    } finally {
      setBusy(false);
    }
  };

  const lookupCustomer = async () => {
    const phone = customer.phoneNumber.trim();

    if (!/^\d{10,15}$/.test(phone)) {
      setError('Enter a valid mobile number (10–15 digits).');
      return;
    }

    setBusy(true);
    setError('');
    setLookupDone(false);
    setCustomerInvoices([]);

    try {
      const existing = await axios.get(
        `${API}/api/dues/customer/${encodeURIComponent(phone)}`
      );

      if (existing.data.dues?.length) {
        const first = existing.data.dues[0];

        setCustomer({
          customerName: first.customerName || '',
          teluguCustomerName:
            first.teluguCustomerName || '',
          phoneNumber: phone,
        });

        setCustomerInvoices(existing.data.dues);
        setLookupDone(true);
        setBusy(false);
        return;
      }
    } catch (e) {
      if (e.response?.status !== 404) {
        // Continue with the customer directory lookup.
      }
    }

    try {
      const result = await axios.get(
        `${API}/api/customers/mobile/${encodeURIComponent(phone)}`
      );

      const found = result.data.customer || result.data;

      setCustomer({
        customerName:
          found.customer_name ||
          found.customerName ||
          found.name ||
          '',

        teluguCustomerName:
          found.telugu_name ||
          found.telugu_customer_name ||
          found.teluguCustomerName ||
          '',

        phoneNumber: phone,
      });

      setLookupDone(true);

      if (
        !(
          found.customer_name ||
          found.customerName ||
          found.name ||
          found.telugu_name ||
          found.teluguCustomerName
        )
      ) {
        setError(
          'Customer was not found. Enter a name below to continue.'
        );
      }
    } catch (e) {
      setCustomer((value) => ({
        ...value,
        phoneNumber: phone,
      }));

      setLookupDone(true);

      setError(
        'Customer not found in existing dues or customers. Enter the customer name manually.'
      );
    } finally {
      setBusy(false);
    }
  };

  const addDue = async (event) => {
    event.preventDefault();
    setError('');

    if (
      !customer.phoneNumber ||
      !(
        customer.customerName.trim() ||
        customer.teluguCustomerName.trim()
      ) ||
      !invoice.invoiceNumber.trim() ||
      invoice.totalAmount === ''
    ) {
      setError(
        'Mobile, at least one name, invoice number and total amount are required.'
      );
      return;
    }

    const total = Number(invoice.totalAmount);

    const paid =
      invoice.amountPaid === ''
        ? 0
        : Number(invoice.amountPaid);

    if (
      !Number.isFinite(total) ||
      total <= 0 ||
      !Number.isFinite(paid) ||
      paid < 0 ||
      paid > total
    ) {
      setError(
        'Enter a valid total amount and an amount paid between zero and the total.'
      );
      return;
    }

    try {
      setBusy(true);

      await axios.post(`${API}/api/dues`, {
        ...customer,
        ...invoice,
        totalAmount: total,
        amountPaid: paid,
        dueDate: invoice.dueDate || null,
      });

      await load();

      setInvoice({
        invoiceNumber: '',
        totalAmount: '',
        amountPaid: '',
        dueDate: '',
      });

      setAddOpen(false);
      setLookupDone(false);

      setCustomer({
        customerName: '',
        teluguCustomerName: '',
        phoneNumber: '',
      });

      setCustomerInvoices([]);
    } catch (e) {
      setError(
        e.response?.data?.message ||
          'Could not add invoice due.'
      );
    } finally {
      setBusy(false);
    }
  };

  const closeAdd = () => {
    setAddOpen(false);
    setError('');
    setLookupDone(false);
    setCustomerInvoices([]);
  };

  return (
    <main className="dues-page">
      <nav className="dues-tabs" aria-label="Dues sections">
        <button
          className={tab === 'list' ? 'active' : ''}
          onClick={() => setTab('list')}
        >
          Due List
        </button>

        <button
          className={tab === 'reports' ? 'active' : ''}
          onClick={() => setTab('reports')}
        >
          Reports &amp; Collection
        </button>

        <button
          className="dues-tab-add"
          onClick={() => {
            setError('');
            setAddOpen(true);
          }}
        >
          + Add Due
        </button>
      </nav>

      {error && !modal && !addOpen && (
        <div className="dues-alert">
          {error}
          <button
            onClick={() => setError('')}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {tab === 'reports' ? (
        <section className="dues-report-grid">
          <article className="dues-stat stat-gold">
            <span>Total outstanding</span>
            <strong>{money(summary.totalOutstanding)}</strong>
          </article>

          <article className="dues-stat stat-rose">
            <span>Overdue amount</span>
            <strong>{money(summary.overdueAmount)}</strong>
          </article>

          <article className="dues-stat stat-green">
            <span>Collected this month</span>
            <strong>{money(summary.collectedThisMonth)}</strong>
          </article>

          <article className="dues-stat stat-violet">
            <span>Customers with dues</span>
            <strong>{summary.customersWithDue || 0}</strong>
          </article>
        </section>
      ) : (
        <section className="dues-list-panel">
          <div className="dues-tools">
            <label className="dues-search">
              <span>⌕</span>
              <input
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Search name, Telugu name, phone, invoice or amount"
              />
            </label>

            <select
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value)
              }
              aria-label="Filter dues"
            >
              <option value="pending">Pending</option>
              <option value="all">All customers</option>
              <option value="paid">Paid</option>
            </select>

            <button className="dues-outline" onClick={load}>
              Refresh
            </button>
          </div>

          <div className="dues-customer-list">
            {filteredCustomers.map((group) => (
              <button
                type="button"
                className="dues-customer-row"
                key={
                  group.phoneNumber ||
                  group.invoices[0]?.dueId
                }
                onClick={() => openCustomer(group.phoneNumber)}
              >
                <span className="dues-customer-name">
                  {group.teluguCustomerName ||
                    group.customerName ||
                    group.phoneNumber ||
                    'Customer'}
                </span>

                <strong
                  className={
                    group.totalDue > 0
                      ? 'amount-cell'
                      : 'amount-paid'
                  }
                >
                  {money(group.totalDue)}
                </strong>
              </button>
            ))}

            {!filteredCustomers.length && (
              <div className="dues-empty">
                No dues match your search.
              </div>
            )}
          </div>
        </section>
      )}

      {modal && (
        <div
          className="dues-overlay"
          onMouseDown={(event) =>
            event.target === event.currentTarget &&
            setModal(false)
          }
        >
          <section
            className="dues-modal dues-customer-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Customer due details"
          >
            <button
              className="dues-close"
              onClick={() => setModal(false)}
              aria-label="Close"
            >
              ×
            </button>

            <h2>
              {selectedCustomer?.teluguCustomerName ||
                selectedCustomer?.customerName ||
                'Customer'}
            </h2>

            {selectedCustomer?.teluguCustomerName &&
              selectedCustomer?.customerName && (
                <p className="dues-modal-sub">
                  {selectedCustomer.customerName}
                </p>
              )}

            <p className="dues-modal-phone">
              ☎ {selectedPhone}
            </p>

            <div className="dues-total-strip">
              <div>
                <small>Invoices</small>
                <strong>{selected.length}</strong>
              </div>

              <div>
                <small>Total billed</small>
                <strong>{money(customerTotal)}</strong>
              </div>

              <div>
                <small>Total paid</small>
                <strong>{money(customerPaid)}</strong>
              </div>

              <div>
                <small>Total due</small>
                <strong className="due-highlight">
                  {money(customerDue)}
                </strong>
              </div>
            </div>

            <h3>Invoice details</h3>

            <div className="dues-invoice-stack">
              {selected.map((due) => (
                <article
                  className="dues-invoice-card"
                  key={due.dueId}
                >
                  <div className="dues-invoice-top">
                    <div>
                      <b>
                        Invoice {due.invoiceNumber || due.dueId}
                      </b>
                      <small>{dateTime(due.startDate)}</small>
                    </div>

                    <span
                      className={`dues-status ${
                        balance(due) > 0 ? 'pending' : 'paid'
                      }`}
                    >
                      {balance(due) > 0 ? 'Pending' : 'Paid'}
                    </span>
                  </div>

                  <div className="dues-invoice-numbers">
                    <span>
                      Invoice amount
                      <strong>{money(due.totalAmount)}</strong>
                    </span>

                    <span>
                      Paid
                      <strong>{money(due.amountPaid)}</strong>
                    </span>

                    <span>
                      Balance
                      <strong className="due-highlight">
                        {money(balance(due))}
                      </strong>
                    </span>
                  </div>

                  <div className="dues-history">
                    <b>Collection history</b>

                    {due.paidHistory?.length ? (
                      [...due.paidHistory]
                        .reverse()
                        .map((payment, index) => (
                          <div
                            className="dues-history-row"
                            key={`${
                              payment.paidAt || 'payment'
                            }-${index}`}
                          >
                            <span>
                              {dateTime(payment.paidAt)}
                              <small>
                                {payment.mode || 'Payment'}
                              </small>
                            </span>

                            <b>{money(payment.amount)}</b>
                          </div>
                        ))
                    ) : (
                      <p>No collections recorded.</p>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {customerDue > 0 && (
              <form
                className="dues-collect-form"
                onSubmit={collectCustomerPayment}
              >
                <label htmlFor="dues-payment-amount">
                  Collect amount from total due
                </label>

                <div className="dues-collect-row">
                  <input
                    id="dues-payment-amount"
                    ref={paymentRef}
                    type="number"
                    inputMode="decimal"
                    min="0.01"
                    max={customerDue}
                    step="0.01"
                    value={payAmount}
                    onChange={(event) => {
                      setPayAmount(event.target.value);
                      setConfirmCollectionOpen(false);
                    }}
                    placeholder={`Up to ${money(customerDue)}`}
                    required
                  />

                  <select
                    value={payMode}
                    onChange={(event) =>
                      setPayMode(event.target.value)
                    }
                    aria-label="Payment mode"
                  >
                    <option>Cash</option>
                    <option>UPI</option>
                    <option>PhonePe</option>
                    <option>Google Pay</option>
                    <option>Bank transfer</option>
                    <option>Other</option>
                  </select>

                  <button
                    className="dues-primary"
                    disabled={busy}
                  >
                    Collect
                  </button>
                </div>

                <small>
                  Amount is deducted from the oldest unpaid invoice
                  first. Each allocation is saved in that invoice’s
                  collection history.
                </small>
              </form>
            )}

            {confirmCollectionOpen && (
              <div className="dues-confirm">
                <p>
                  Collect <b>{money(payAmount)}</b> from the
                  customer’s total balance of{' '}
                  <b>{money(customerDue)}</b>?
                </p>

                <div>
                  <button
                    className="dues-outline"
                    onClick={() =>
                      setConfirmCollectionOpen(false)
                    }
                  >
                    Cancel
                  </button>

                  <button
                    className="dues-primary"
                    disabled={busy}
                    onClick={confirmCollection}
                  >
                    {busy ? 'Saving…' : 'Confirm collection'}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="dues-alert">
                {error}
                <button onClick={() => setError('')}>×</button>
              </div>
            )}
          </section>
        </div>
      )}

      {addOpen && (
        <div
          className="dues-overlay"
          onMouseDown={(event) =>
            event.target === event.currentTarget && closeAdd()
          }
        >
          <section
            className="dues-modal dues-add-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Add invoice due"
          >
            <button
              className="dues-close"
              onClick={closeAdd}
              aria-label="Close"
            >
              ×
            </button>

            <h2>Add invoice due</h2>

            <div className="dues-lookup-row">
              <label>
                Mobile number
                <input
                  ref={mobileRef}
                  value={customer.phoneNumber}
                  maxLength="15"
                  inputMode="numeric"
                  onChange={(event) => {
                    setCustomer((value) => ({
                      ...value,
                      phoneNumber: event.target.value.replace(
                        /\D/g,
                        ''
                      ),
                    }));
                    setLookupDone(false);
                  }}
                  placeholder="Enter mobile number"
                />
              </label>

              <button
                className="dues-primary"
                disabled={busy}
                onClick={lookupCustomer}
              >
                Fetch details
              </button>
            </div>

            {customerInvoices.length > 0 && (
              <div className="dues-existing-box">
                <b>
                  Existing customer · {customerInvoices.length}{' '}
                  invoice(s)
                </b>

                <span>
                  Current total due:{' '}
                  {money(
                    customerInvoices.reduce(
                      (sum, due) => sum + balance(due),
                      0
                    )
                  )}
                </span>
              </div>
            )}

            {lookupDone && (
              <form
                className="dues-add-form"
                onSubmit={addDue}
              >
                <div className="dues-form-grid">
                  <label>
                    English customer name
                    <input
                      value={customer.customerName}
                      onChange={(event) =>
                        setCustomer((value) => ({
                          ...value,
                          customerName: event.target.value,
                        }))
                      }
                      placeholder="English name"
                    />
                  </label>

                  <label>
                    Telugu customer name
                    <input
                      value={customer.teluguCustomerName}
                      onChange={(event) =>
                        setCustomer((value) => ({
                          ...value,
                          teluguCustomerName: event.target.value,
                        }))
                      }
                      placeholder="తెలుగు పేరు"
                    />
                  </label>

                  <label>
                    Invoice number
                    <input
                      required
                      value={invoice.invoiceNumber}
                      onChange={(event) =>
                        setInvoice((value) => ({
                          ...value,
                          invoiceNumber: event.target.value,
                        }))
                      }
                      placeholder="e.g. INV-1024"
                    />
                  </label>

                  <label>
                    Total amount
                    <input
                      required
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={invoice.totalAmount}
                      onChange={(event) =>
                        setInvoice((value) => ({
                          ...value,
                          totalAmount: event.target.value,
                        }))
                      }
                      placeholder="₹ 0.00"
                    />
                  </label>

                  <label>
                    Amount already paid
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={invoice.amountPaid}
                      onChange={(event) =>
                        setInvoice((value) => ({
                          ...value,
                          amountPaid: event.target.value,
                        }))
                      }
                      placeholder="Default ₹0"
                    />
                  </label>

                  <label>
                    Due date
                    <input
                      type="date"
                      value={invoice.dueDate}
                      onChange={(event) =>
                        setInvoice((value) => ({
                          ...value,
                          dueDate: event.target.value,
                        }))
                      }
                    />
                  </label>
                </div>

                {error && (
                  <div className="dues-alert">{error}</div>
                )}

                <button
                  className="dues-primary dues-save-button"
                  disabled={busy}
                >
                  {busy ? 'Saving…' : 'Save invoice'}
                </button>
              </form>
            )}

            {error && !lookupDone && (
              <div className="dues-alert">{error}</div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}