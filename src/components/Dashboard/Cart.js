import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./Cart.css";
import BillCopy from "./BillCopy.js";

const API_URL =
  "https://svs-jewellery-works-backend.onrender.com";

const MAX_CART_ITEMS = 4;

/* =====================================================
   HELPERS
\===================================================== */

const getItemType = (item = {}) => {
  const type = String(
    item.itemType || item.item_type || item.type || ""
  ).toLowerCase();

  if (type.includes("silver")) return "Silver";

  if (
    type.includes("hallmark") ||
    type === "hm" ||
    type.includes("hm gold")
  ) {
    return "HallMark";
  }

  if (type.includes("kdm") || type === "gold") {
    return "KDM";
  }

  return null;
};

const getItemKey = (item) =>
  `${getItemType(item) || "item"}-${item.id}`;

const getItemRate = (item) =>
  Number(
    item.rate ??
      item.price ??
      item.amount ??
      item.sold_price ??
      0
  ) || 0;

const getItemWeight = (item, type) => {
  if (type === "Silver") {
    return Number(
      item.weight ??
      item.gross_weight ??
      item.grossWeight ??
      item.net_weight ??
      item.netWeight ??
      0
    ) || 0;
  }

  return Number(
    item.netWeight ??
    item.net_weight ??
    item.weight ??
    0
  ) || 0;
};

const getGrossWeight = (item, type) => {
  if (type === "Silver") {
    return getItemWeight(item, type);
  }

  return Number(
    item.grossWeight ??
      item.gross_weight ??
      item.netWeight ??
      item.net_weight ??
      item.weight ??
      0
  ) || 0;
};

const formatMoney = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

const readResponse = async (response) => {
  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed (${response.status})`
    );
  }

  return data;
};

/* =====================================================
   CART COMPONENT
\===================================================== */

const Cart = ({
  cartItems = [],
  onClearCart,
  onSold,
  onRefresh,
  focusItemId,
}) => {
  /* ===================================================
     STATES
  \=================================================== */

  const [processing, setProcessing] = useState(false);

  const [showDiscountPopup, setShowDiscountPopup] =
    useState(false);

  const [showCustomerPopup, setShowCustomerPopup] =
    useState(false);

  const [discountInput, setDiscountInput] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerTeluguName, setCustomerTeluguName] =
    useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] =
    useState("");

  const [customerLookupLoading, setCustomerLookupLoading] =
    useState(false);

  const [customerLookupMessage, setCustomerLookupMessage] =
    useState("");

  const [printReady, setPrintReady] = useState(false);
  const [printItems, setPrintItems] = useState([]);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [printBillData, setPrintBillData] = useState(null);

  const processingRef = useRef(false);

  const discountInputRef = useRef(null);
  const mobileInputRef = useRef(null);

  const lookupRequestRef = useRef(0);
  const autoPrintLookupRef = useRef("");

  /* ===================================================
     UNIQUE CART ITEMS
  \=================================================== */

  const validCartItems = useMemo(() => {
    const unique = new Map();

    cartItems.forEach((item) => {
      if (!item || item.id === undefined || item.id === null) {
        return;
      }

      const key = getItemKey(item);

      if (!unique.has(key)) {
        unique.set(key, item);
      }
    });

    return Array.from(unique.values()).slice(
      0,
      MAX_CART_ITEMS
    );
  }, [cartItems]);

  /* ===================================================
     BILL ITEMS
  \=================================================== */

  const billItems = useMemo(() => {
    let remainingDiscount = Math.min(
      Math.max(Number(discountInput) || 0, 0),
      500,
      validCartItems.reduce((sum, item) => sum + getItemRate(item), 0)
    );

    return validCartItems.map((item) => {
      const originalAmount = getItemRate(item);
      const discount = Math.min(originalAmount, remainingDiscount);
      remainingDiscount = Math.max(remainingDiscount - discount, 0);
      const amount = Math.max(originalAmount - discount, 0);

      return {
        ...item,
        itemType: getItemType(item),
        original_amount: originalAmount,
        discount,
        amount,
        sold_price: amount,
      };
    });
  }, [validCartItems, discountInput]);

  /* ===================================================
     TOTAL CALCULATION
  \=================================================== */

  const subtotal = billItems.reduce(
    (sum, item) =>
      sum + Number(item.original_amount || 0),
    0
  );

  const totalDiscount = billItems.reduce(
    (sum, item) =>
      sum + Number(item.discount || 0),
    0
  );

  const total = billItems.reduce(
    (sum, item) =>
      sum + Number(item.amount || 0),
    0
  );

  /* ===================================================
     DISCOUNT POPUP FOCUS
  \=================================================== */

  useEffect(() => {
    if (!showDiscountPopup) return;

    const timer = setTimeout(() => {
      discountInputRef.current?.focus();
      discountInputRef.current?.select();
    }, 150);

    return () => clearTimeout(timer);
  }, [showDiscountPopup]);

  /* ===================================================
     CUSTOMER POPUP FOCUS
  \=================================================== */

  useEffect(() => {
    if (!showCustomerPopup) return;

    const timer = setTimeout(() => {
      mobileInputRef.current?.focus();
    }, 150);

    return () => clearTimeout(timer);
  }, [showCustomerPopup]);

  /* ===================================================
     CUSTOMER LOOKUP
  \=================================================== */

  const lookupCustomerByMobile = async (mobile) => {
    if (!/^\d{10}$/.test(mobile)) return;

    const requestId = ++lookupRequestRef.current;

    setCustomerLookupLoading(true);
    setCustomerLookupMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/customers/mobile/${mobile}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await readResponse(response);

      if (requestId !== lookupRequestRef.current) return;

      if (data?.success && data?.customer) {
        setCustomerName(
          data.customer.customer_name || ""
        );

        setCustomerTeluguName(
          data.customer.telugu_name || ""
        );

        setCustomerAddress(
          data.customer.address || ""
        );

        setCustomerLookupMessage("✓ Customer found");
      } else {
        setCustomerName("");
        setCustomerTeluguName("");
        setCustomerAddress("");
        setCustomerLookupMessage("New customer");
      }
    } catch (error) {
      if (requestId !== lookupRequestRef.current) return;

      console.error("Customer lookup error:", error);

      setCustomerLookupMessage("Customer lookup failed");
    } finally {
      if (requestId === lookupRequestRef.current) {
        setCustomerLookupLoading(false);
      }
    }
  };

  /* ===================================================
     OPEN DISCOUNT POPUP
  \=================================================== */

  const openDiscountPopup = () => {
    if (!validCartItems.length) {
      alert("Cart is empty.");
      return;
    }

    if (processing || processingRef.current) return;

    setDiscountInput("");
    setCustomerName("");
    setCustomerTeluguName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setCustomerLookupMessage("");
    autoPrintLookupRef.current = "";

    setShowDiscountPopup(true);
  };

  /* ===================================================
     DISCOUNT VALIDATION
  \=================================================== */

  const continueWithDiscount = () => {
    const enteredDiscount = Number(discountInput) || 0;

    if (enteredDiscount < 0) {
      alert("Discount cannot be negative.");
      return;
    }

    if (enteredDiscount > 500) {
      alert("Maximum discount allowed is ₹500.");
      return;
    }

    if (enteredDiscount > subtotal) {
      alert(`Discount cannot be more than ${formatMoney(subtotal)}.`);
      return;
    }

    setShowDiscountPopup(false);
    setShowCustomerPopup(true);
  };

  /* ===================================================
     DISCOUNT KEYBOARD
  \=================================================== */

  const handleDiscountKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setShowDiscountPopup(false);
    }

    if (event.key === "Enter") {
      event.preventDefault();
      continueWithDiscount();
    }
  };

  /* ===================================================
     CUSTOMER KEYBOARD
  \=================================================== */

  const handleCustomerKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setShowCustomerPopup(false);
    }

    if (event.key === "Enter") {
      event.preventDefault();
      proceedAndPrint();
    }
  };

  /* ===================================================
     SOLD ENDPOINT
  \=================================================== */

  const getSoldEndpoint = (item) => {
    const type = getItemType(item);

    if (type === "Silver") {
      return `${API_URL}/api/silver/${item.id}/sold`;
    }

    if (type === "KDM") {
      return `${API_URL}/api/kdm/${item.id}/sold`;
    }

    if (type === "HallMark") {
      return `${API_URL}/api/hallmark/${item.id}/sold`;
    }

    throw new Error(
      `Unknown item type for item ${item.name || item.id}.`
    );
  };

  /* ===================================================
     MARK ITEM SOLD
  \=================================================== */

  const markItemAsSold = async (item) => {
    const response = await fetch(
      getSoldEndpoint(item),
      {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return readResponse(response);
  };

  /* ===================================================
     SAVE SOLD ITEM
  \=================================================== */

  const saveSoldItem = async (item) => {
    const type = getItemType(item);

    const weight = getItemWeight(item, type);
    const grossWeight = getGrossWeight(item, type);

    const netWeight =
      type === "Silver" ? null : weight;

    const makingCost = Number(
      item.makingCost ??
        item.making_cost ??
        0
    ) || 0;

    const response = await fetch(
      `${API_URL}/api/sold-items`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemId: item.id,
          itemType: type,
          itemName: item.name ?? item.item_name ?? "",
          grossWeight,
          netWeight,
          charges: Number(item.charges || 0),
          makingCost,
          soldPrice: Number(item.amount || 0),
          customerName: customerName.trim(),
          customerTeluguName: customerTeluguName.trim(),
          customerPhone: customerPhone.trim(),
        }),
      }
    );

    return readResponse(response);
  };

  /* ===================================================
     CREATE INVOICE
  \=================================================== */

  const createInvoice = async (saleItems) => {
    const invoiceItems = saleItems.map((item) => {
      const type = getItemType(item);

      const weight = getItemWeight(item, type);

      const makingCost = Number(
        item.makingCost ??
          item.making_cost ??
          0
      ) || 0;

      return {
        ...item,

        item_id: item.id,
        item_type: type,
        item_name: item.name ?? item.item_name ?? "",

        weight,

        net_weight:
          type === "Silver" ? null : weight,

        making_cost: makingCost,

        charges: Number(item.charges || 0),

        original_amount: Number(
          item.original_amount || 0
        ),

        discount: Number(item.discount || 0),

        amount: Number(item.amount || 0),
        sold_price: Number(item.amount || 0),

        status: "sold",
      };
    });

    const response = await fetch(
      `${API_URL}/api/invoices`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_name: customerName.trim() || null,

          customer_mobile: customerPhone.trim() || null,

          customer_address: customerAddress.trim() || null,

          items: invoiceItems,

          total_amount: total,
        }),
      }
    );

    const data = await readResponse(response);

    const generatedNumber =
      data?.invoice?.invoice_number;

    if (!generatedNumber) {
      throw new Error(
        "Invoice was created, but invoice number was not returned."
      );
    }

    return {
      invoiceItems,
      invoiceNumber: generatedNumber,
    };
  };

  /* ===================================================
     PROCEED AND PRINT
  \=================================================== */

  const createCustomerIfNeeded = async () => {
    const mobile = customerPhone.trim();
    const name = customerName.trim();

    if (
      !/^\d{10}$/.test(mobile) ||
      !name ||
      customerLookupMessage !== "New customer"
    ) {
      return;
    }

    const response = await fetch(`${API_URL}/api/customers`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_name: name,
        mobile_number: mobile,
        telugu_name: customerTeluguName.trim() || name,
        address: customerAddress.trim(),
      }),
    });

    const data = await readResponse(response);
    if (data?.success === false) {
      throw new Error(data.message || "Could not create customer.");
    }
  };

  const proceedAndPrint = async () => {
    if (processingRef.current) return;

    if (!validCartItems.length) {
      alert("Cart is empty.");
      return;
    }

    if (
      customerPhone.trim() &&
      !/^\d{10}$/.test(customerPhone.trim())
    ) {
      alert("Enter a valid 10-digit mobile number.");
      return;
    }

    processingRef.current = true;
    setProcessing(true);

    try {
      await createCustomerIfNeeded();

      const saleItems = billItems.map((item) => ({
        ...item,
      }));

      /* Validate item types */

      saleItems.forEach((item) => {
        if (!getItemType(item)) {
          throw new Error(
            `Unknown item type for ${item.name || item.id}.`
          );
        }
      });

      /* STEP 1: MARK ITEMS SOLD */

      for (const item of saleItems) {
        await markItemAsSold(item);
      }

      /* STEP 2: SAVE SOLD ITEMS */

      for (const item of saleItems) {
        await saveSoldItem(item);
      }

      /* STEP 3: CREATE ONE INVOICE */

      const invoice = await createInvoice(saleItems);

      /* STEP 4: SAVE PRINT DATA */

      setPrintItems(invoice.invoiceItems);

      setInvoiceNumber(invoice.invoiceNumber);

      setPrintBillData({
        customerName: customerName.trim(),
        customerTeluguName:
          customerTeluguName.trim(),
        customerPhone: customerPhone.trim(),
        address: customerAddress.trim(),
        subtotal,
        discount: totalDiscount,
        total,
      });

      /* STEP 5: UPDATE INVENTORY */

      if (onSold) {
        saleItems.forEach((item) => {
          onSold(item);
        });
      }

      /* STEP 6: CLEAR CART */

      if (onClearCart) {
        onClearCart();
      }

      /* STEP 7: RESET POPUPS */

      setShowCustomerPopup(false);
      setShowDiscountPopup(false);

      setDiscountInput("");

      setCustomerName("");
      setCustomerTeluguName("");
      setCustomerPhone("");
      setCustomerAddress("");

      setCustomerLookupMessage("");

      /* STEP 8: ENABLE PRINT */

      setPrintReady(true);
    } catch (error) {
      console.error("Cart sale failed:", error);

      alert(
        `Could not complete the cart sale.\n\n${error.message}\n\nCheck sold-item and invoice records before retrying to avoid duplicate sales.`
      );

      processingRef.current = false;
      setProcessing(false);
    }
  };

  useEffect(() => {
    const mobile = customerPhone.trim();
    if (
      !showCustomerPopup ||
      customerLookupLoading ||
      customerLookupMessage !== "✓ Customer found" ||
      !/^\d{10}$/.test(mobile) ||
      autoPrintLookupRef.current === mobile
    ) {
      return;
    }

    autoPrintLookupRef.current = mobile;
    const timer = window.setTimeout(() => {
      proceedAndPrint();
    }, 250);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    showCustomerPopup,
    customerLookupLoading,
    customerLookupMessage,
    customerPhone,
  ]);

  /* ===================================================
     PRINT AFTER RENDER
  \=================================================== */

  useEffect(() => {
    if (!printReady || !printItems.length) {
      return undefined;
    }

    const handleAfterPrint = async () => {
      setPrintReady(false);
      setPrintItems([]);
      setInvoiceNumber("");
      setPrintBillData(null);

      setProcessing(false);
      processingRef.current = false;

      try {
        // Reload all Dashboard APIs after the bill is printed.
        await onRefresh?.();
      } catch (error) {
        console.error("Dashboard refresh failed:", error);
      } finally {
        // Focus the jewellery search input after refreshing.
        setTimeout(() => {
          focusItemId?.();
          document.getElementById("item-id-input")?.focus();
        }, 150);
      }
    };

    window.addEventListener(
      "afterprint",
      handleAfterPrint,
      { once: true }
    );

    const timer = window.setTimeout(() => {
      window.print();
    }, 500);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(
        "afterprint",
        handleAfterPrint
      );
    };
  }, [printReady, printItems, onRefresh, focusItemId]);

  /* ===================================================
     BILL NUMBER
  \=================================================== */

  const billNumber = String(
    invoiceNumber || ""
  ).startsWith("SVS-")
    ? String(invoiceNumber)
    : `SVS-${invoiceNumber || "1000"}`;

  /* ===================================================
     RENDER
  \=================================================== */

  
return (
  <>
    <div className="cart">

      {/* EMPTY CART */}
      {!validCartItems.length ? (
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <p>Cart is empty</p>
          <span>Add items to prepare a combined bill.</span>
        </div>
      ) : (
        <div className="cart-content">

          {/* ITEM LIST */}
          <div className="cart-items">

            <div className="cart-list-heading">
              <span>Sl. No.</span>
              <span>Item ID</span>
              <span>Price</span>
            </div>

            {billItems.map((item, index) => (
              <div
                className="cart-list-row"
                key={getItemKey(item)}
              >
                <span className="cart-sl-number">
                  {index + 1}
                </span>

                <span className="cart-list-id">
                  #{item.id}
                </span>

                <strong className="cart-list-price">
                  {formatMoney(item.amount)}
                </strong>
              </div>
            ))}

          </div>

          {/* GRAND TOTAL */}
          {/* <div className="cart-summary">
            <div className="cart-grand-total">
              <span>Grand Total</span>
              <strong>{formatMoney(total)}</strong>
            </div>
          </div> */}

          {/* BILL BUTTON */}
          <button
            type="button"
            className="cart-print-btn"
            onClick={openDiscountPopup}
            disabled={processing}
          >
            PROCEED & BILL <strong>{formatMoney(total)}</strong>
          </button>

        </div>
      )}
    </div>

    {/* DISCOUNT POPUP */}
    {showDiscountPopup && (
      <div
        className="discount-popup-overlay"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            setShowDiscountPopup(false);
          }
        }}
      >
        <div
          className="discount-popup"
          onKeyDown={handleDiscountKeyDown}
        >
          <div className="discount-popup-header">
            <div>
              <div className="discount-popup-icon">₹</div>
              <div>
                <h2>Apply Discount</h2>
                <p>Enter discount before customer details</p>
              </div>
            </div>

            <button
              type="button"
              className="discount-popup-close"
              onClick={() => setShowDiscountPopup(false)}
            >
              ×
            </button>
          </div>

          <div className="cart-discount-summary">
            <div className="cart-discount-metric cart-discount-items">
              <span>Total Items</span>
              <strong>{validCartItems.length}</strong>
            </div>
            <div className="cart-discount-metric cart-discount-price">
              <span>Total Price</span>
              <strong>{formatMoney(subtotal)}</strong>
            </div>
          </div>

          <div className="discount-field cart-discount-field">
            <label htmlFor="cart-discount-input">Discount Amount (₹)</label>
            <input
              id="cart-discount-input"
              ref={discountInputRef}
              type="number"
              inputMode="numeric"
              min="0"
              max={Math.min(500, subtotal)}
              step="1"
              value={discountInput}
              onChange={(event) => {
                const value = event.target.value;
                if (value === "" || /^\d+$/.test(value)) {
                  if (value === "" || Number(value) <= 500) {
                    setDiscountInput(value);
                  }
                }
              }}
              placeholder="0 - 500"
            />
            <span className="discount-hint">Maximum discount: ₹500</span>
          </div>

          <div className="cart-after-discount">
            <span>After Discount Price</span>
            <strong>{formatMoney(total)}</strong>
          </div>

          <div className="discount-popup-actions">
            <button
              type="button"
              className="discount-cancel-btn"
              onClick={() => setShowDiscountPopup(false)}
            >
              ✕ Cancel
            </button>

            <button
              type="button"
              className="discount-continue-btn"
              onClick={continueWithDiscount}
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    )}

    {/* CUSTOMER POPUP */}
    {showCustomerPopup && (
      <div
        className="customer-popup-overlay"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            setShowCustomerPopup(false);
          }
        }}
      >
        <div
          className="customer-popup"
          onKeyDown={handleCustomerKeyDown}
        >
          <div className="customer-popup-header">
            <div>
              <div className="popup-icon">✨</div>
              <div>
                <h2>Customer Details</h2>
                <p>Enter customer information</p>
              </div>
            </div>

            <button
              type="button"
              className="customer-popup-close"
              onClick={() => setShowCustomerPopup(false)}
            >
              ×
            </button>
          </div>

          <div className="customer-field mobile-field">
            <label>Mobile Number</label>
            <input
              ref={mobileInputRef}
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={customerPhone}
              onChange={(event) => {
                const value = event.target.value
                  .replace(/\D/g, "")
                  .slice(0, 10);

                setCustomerPhone(value);
                lookupRequestRef.current++;

                if (value.length === 10) {
                  lookupCustomerByMobile(value);
                } else {
                  autoPrintLookupRef.current = "";
                  setCustomerName("");
                  setCustomerTeluguName("");
                  setCustomerAddress("");
                  setCustomerLookupMessage("");
                  setCustomerLookupLoading(false);
                }
              }}
              placeholder="Enter mobile number"
              autoComplete="tel"
              disabled={processing}
            />

            <span className="customer-hint">
              {customerLookupLoading
                ? "Searching customer..."
                : customerLookupMessage ||
                  "Optional • Enter 10 digits to find customer"}
            </span>
          </div>

          <div className="customer-field name-field">
            <label>Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(event) => {
                const value = event.target.value;
                setCustomerName(value);

                if (!customerTeluguName) {
                  setCustomerTeluguName(value);
                }
              }}
              placeholder="Customer name"
              autoComplete="name"
              disabled={processing}
            />

            <span className="customer-hint">
              Original: {customerName || "—"}
              {" • "}
              Duplicate: {customerTeluguName || customerName || "—"}
            </span>
          </div>

          <div className="customer-field">
            <label>Telugu Name</label>
            <input
              type="text"
              value={customerTeluguName}
              onChange={(event) =>
                setCustomerTeluguName(event.target.value)
              }
              placeholder="తెలుగు పేరు"
              disabled={processing}
            />
          </div>

          <div className="customer-field">
            <label>Address</label>
            <input
              type="text"
              value={customerAddress}
              onChange={(event) =>
                setCustomerAddress(event.target.value)
              }
              placeholder="Enter address"
              disabled={processing}
            />
          </div>


          <div className="customer-popup-actions">
            <button
              type="button"
              className="customer-cancel-btn"
              onClick={() => setShowCustomerPopup(false)}
              disabled={processing}
            >
              ✕ Cancel
            </button>

            <button
              type="button"
              className="customer-print-btn"
              onClick={proceedAndPrint}
              disabled={processing}
            >
              {processing
                ? "PROCESSING..."
                : "🖨 PROCEED & PRINT"}
            </button>
          </div>

          {processing && (
            <div className="popup-loading-overlay">
              <div className="popup-loader-box">
                <div className="print-spinner">🖨</div>
                <h3>Processing Bill</h3>
                <p>Please wait while your invoice is created.</p>
                <div className="loader-progress">
                  <span />
                </div>
                <small>Please do not close this window</small>
              </div>
            </div>
          )}
        </div>
      </div>
    )}

    {/* PRINTABLE BILL */}
    {printReady && printItems.length > 0 && (
      <div
        className="cart-print-bill-root"
        aria-hidden="true"
      >
        <div className="print-bill-page">

          {/* CUSTOMER COPY */}
          <BillCopy
            side="left"
            customerName={printBillData?.customerName || ""}
            customerPhone={printBillData?.customerPhone || ""}
            address={printBillData?.address || ""}
            billNumber={billNumber}
            items={printItems}
            subtotal={printBillData?.subtotal || 0}
            discount={printBillData?.discount || 0}
            total={printBillData?.total || 0}
          />

          {/* SHOP COPY */}
          <BillCopy
            side="right"
            customerName={
              printBillData?.customerTeluguName ||
              printBillData?.customerName ||
              ""
            }
            customerPhone={printBillData?.customerPhone || ""}
            address={printBillData?.address || ""}
            billNumber={billNumber}
            items={printItems}
            subtotal={printBillData?.subtotal || 0}
            discount={printBillData?.discount || 0}
            total={printBillData?.total || 0}
          />

        </div>
        {console.log(printItems)}
      </div>
      
    )}
  </>
);

};

export default Cart;
