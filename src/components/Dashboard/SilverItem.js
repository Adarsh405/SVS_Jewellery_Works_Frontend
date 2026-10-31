import React, {
  useState,
  useRef,
  useEffect,
} from 'react'

import { createPortal } from "react-dom";
import './SilverItem.css'
import BillCopy from './BillCopy.js'

const API_URL =
  "https://svs-jewellery-works-backend.onrender.com"

// ============================================================
// SILVER ITEM
// ============================================================

const SilverItem = ({
  item,
  SilverRate,
  onSold,
  onAdd,
  focusItemId,
  sellRequest,
  onRefresh,
}) => {
  // ==========================================================
  // MAIN STATES
  // ==========================================================

  const [selling, setSelling] = useState(false)
  const [printing, setPrinting] = useState(false)

  const [status, setStatus] = useState(
    item.status?.toLowerCase() || 'available'
  )

  // ==========================================================
  // DISCOUNT POPUP
  // Available -> Discount -> Continue -> Customer Details
  // ==========================================================

  const [showDiscountPopup, setShowDiscountPopup] = useState(false)
  const [discountInput, setDiscountInput] = useState('')

  // ==========================================================
  // CUSTOMER POPUP
  // ==========================================================

  const [showCustomerPopup, setShowCustomerPopup] = useState(false)

  const [teluguName, setTeluguName] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')

  const mobileInputRef = useRef(null)
  const discountInputRef = useRef(null)
  const autoPrintLookupRef = useRef(false)

  // ==========================================================
  // CUSTOMER SEARCH
  // ==========================================================

  const [customerLookupLoading, setCustomerLookupLoading] =
    useState(false)

  const [customerLookupMessage, setCustomerLookupMessage] =
    useState('')

  // ==========================================================
  // BILL / INVOICE
  // ==========================================================

  const [invoiceNumber, setInvoiceNumber] = useState(null)

  // ==========================================================
  // LOADER
  // ==========================================================

  const [loaderText, setLoaderText] =
    useState('Please wait...')

  // ==========================================================
  // VALUES
  // ==========================================================

  const weight = Number(item.weight) || 0
  const makingCost = Number(item.makingCost) || 0
  const silverRate = Number(SilverRate) || 0

  const originalPrice =
    (weight * silverRate) + makingCost

  const discount = Math.min(
    Math.max(Number(discountInput) || 0, 0),
    500,
    originalPrice
  )

  const finalPrice =
    Math.max(originalPrice - discount, 0)

  const isSold = status === 'sold'

  // ==========================================================
  // MONEY FORMAT
  // ==========================================================

  const formatMoney = (value) =>
    Number(value || 0).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    })

  // ==========================================================
  // CUSTOMER LOOKUP
  // ==========================================================

  const fetchCustomerByMobile = async (mobile) => {
    if (mobile.length !== 10) {
      setCustomerLookupMessage('')
      return
    }

    setCustomerLookupLoading(true)
    setCustomerLookupMessage('')
    autoPrintLookupRef.current = false

    try {
      const response = await fetch(
        `${API_URL}/api/customers/mobile/${mobile}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      )

      const data = await response.json()

      if (
        response.ok &&
        data.success &&
        data.customer
      ) {
        const englishName =
          data.customer.customer_name || ''

        const teluguCustomerName =
          data.customer.telugu_name || ''

        setCustomerName(englishName)
        setTeluguName(teluguCustomerName)

        if (englishName || teluguCustomerName) {
          setCustomerLookupMessage('✓ Customer found')
          autoPrintLookupRef.current = true
        } else {
          setCustomerLookupMessage('')
        }
      } else {
        setCustomerName('')
        setTeluguName('')
        setCustomerLookupMessage('New customer')
      }
    } catch (error) {
      console.error(
        'Customer lookup error:',
        error
      )

      setCustomerName('')
      setTeluguName('')
      setCustomerLookupMessage(
        'Customer not found'
      )
    } finally {
      setCustomerLookupLoading(false)
    }
  }

  // ==========================================================
  // AUTO FOCUS DISCOUNT
  // ==========================================================

  useEffect(() => {
    if (!showDiscountPopup) return

    const timer = setTimeout(() => {
      discountInputRef.current?.focus()
      discountInputRef.current?.select()
    }, 150)

    return () => clearTimeout(timer)
  }, [showDiscountPopup])

  // ==========================================================
  // AUTO FOCUS MOBILE
  // ==========================================================

  useEffect(() => {
    if (!showCustomerPopup) return

    const timer = setTimeout(() => {
      mobileInputRef.current?.focus()
    }, 150)

    return () => clearTimeout(timer)
  }, [showCustomerPopup])

    // Automatically start billing when an existing customer is found.
  useEffect(() => {
    if (
      showCustomerPopup &&
      customerPhone.length === 10 &&
      customerLookupMessage === "✓ Customer found" &&
      !customerLookupLoading &&
      autoPrintLookupRef.current &&
      !selling &&
      !printing
    ) {
      autoPrintLookupRef.current = false;
      printAfterSale();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    customerLookupMessage,
    customerLookupLoading,
    customerPhone,
    showCustomerPopup,
    selling,
    printing,
  ]);

  // ==========================================================
  // SOLD SOUND
  // ==========================================================

  const playSoldSound = () => {
    try {
      const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext

      if (!AudioContext) return

      const audioContext = new AudioContext()

      const playNote = (
        frequency,
        startTime,
        duration,
        volume
      ) => {
        const oscillator =
          audioContext.createOscillator()

        const gainNode =
          audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(
          audioContext.destination
        )

        oscillator.type = 'sine'

        oscillator.frequency.setValueAtTime(
          frequency,
          startTime
        )

        gainNode.gain.setValueAtTime(
          0.001,
          startTime
        )

        gainNode.gain.exponentialRampToValueAtTime(
          volume,
          startTime + 0.025
        )

        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          startTime + duration
        )

        oscillator.start(startTime)
        oscillator.stop(
          startTime + duration
        )
      }

      const now =
        audioContext.currentTime

      playNote(392, now, 0.30, 0.20)
      playNote(523.25, now + 0.12, 0.35, 0.20)
      playNote(659.25, now + 0.24, 0.40, 0.20)
      playNote(783.99, now + 0.36, 0.50, 0.18)
      playNote(1046.50, now + 0.48, 0.80, 0.15)

      setTimeout(() => {
        try {
          audioContext.close()
        } catch (error) {
          console.log(error)
        }
      }, 1800)
    } catch (error) {
      console.log(
        'Sold sound unavailable',
        error
      )
    }
  }

  // ==========================================================
  // RESET CUSTOMER
  // ==========================================================

  const resetCustomerFields = () => {
    setCustomerName('')
    setTeluguName('')
    setCustomerPhone('')
    setCustomerLookupMessage('')
    setCustomerLookupLoading(false)
  }

  // ==========================================================
  // RESET SALE FLOW
  // ==========================================================

  // const resetSaleFlow = () => {
  //   setShowDiscountPopup(false)
  //   setShowCustomerPopup(false)
  //   setDiscountInput('')
  //   resetCustomerFields()
  // }

  // ==========================================================
  // OPEN DISCOUNT POPUP
  // ==========================================================

  const markAsSold = () => {
    if (
      selling ||
      printing ||
      isSold
    ) {
      return
    }

    resetCustomerFields()
    setDiscountInput('')
    setShowDiscountPopup(true)
  }

  // ==========================================================
  // CONTINUE AFTER DISCOUNT
  // ==========================================================

  const continueWithDiscount = () => {
    const enteredDiscount =
      Number(discountInput) || 0

    if (enteredDiscount > 500) {
      alert('Maximum discount allowed is ₹500.');
      return;
    }

    if (enteredDiscount < 0) {
      alert('Discount cannot be negative.')
      return
    }

    if (enteredDiscount > originalPrice) {
      alert(
        `Discount cannot be more than ${formatMoney(originalPrice)}.`
      )
      return
    }

    setShowDiscountPopup(false)
    setShowCustomerPopup(true)
  }

  // ==========================================================
  // ACTUAL SALE + INVOICE API
  // ==========================================================

  const saveSale = async () => {
    if (selling) {
      return {
        success: false,
        message: 'Sale is already processing.',
      }
    }

    setLoaderText('Processing sale...')
    setSelling(true)

    try {
      const finalCustomerPhone =
        customerPhone.trim()

      const finalEnglishName =
        customerName.trim()

      const finalTeluguName =
        teluguName.trim() ||
        finalEnglishName

      // Quick-create a new customer when a valid mobile and name are supplied.
      if (
        finalCustomerPhone.length === 10 &&
        finalEnglishName &&
        customerLookupMessage === 'New customer'
      ) {
        const customerResponse = await fetch(`${API_URL}/api/customers`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_name: finalEnglishName,
            telugu_name: finalTeluguName,
            mobile_number: finalCustomerPhone,
          }),
        });
        const customerData = await customerResponse.json().catch(() => ({}));
        if (!customerResponse.ok) {
          throw new Error(customerData.message || 'Unable to create customer');
        }
      }

      // ------------------------------------------------------
      // STEP 1: MARK SILVER SOLD
      // ------------------------------------------------------

      setLoaderText(
        'Updating item status...'
      )

      const response = await fetch(
        `${API_URL}/api/silver/${item.id}/sold`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type':
              'application/json',
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
          'Failed to mark silver item as sold'
        )
      }

      // ------------------------------------------------------
      // STEP 2: SAVE SOLD ITEM
      // Discounted amount is saved as soldPrice.
      // ------------------------------------------------------

      setLoaderText(
        'Saving sale details...'
      )

      const soldResponse = await fetch(
        `${API_URL}/api/sold-items`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            itemId: item.id,
            itemType: 'Silver',
            itemName: item.name,

            grossWeight: weight,

            makingCost: makingCost,

            soldPrice: finalPrice,

            customerName:
              finalEnglishName,

            customerPhone:
              finalCustomerPhone,
          }),
        }
      )

      const soldData =
        await soldResponse.json()

      if (!soldResponse.ok) {
        throw new Error(
          soldData.message ||
          'Sale record could not be saved'
        )
      }

      // ------------------------------------------------------
      // STEP 3: CREATE INVOICE
      // PostgreSQL generates invoice_number.
      //
      // `amount` is deliberately the DISCOUNTED amount,
      // so invoices.total_amount becomes the final bill value.
      // ------------------------------------------------------

      setLoaderText(
        'Creating invoice...'
      )

      const invoiceResponse =
        await fetch(
          `${API_URL}/api/invoices`,
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              customer_name:
                finalEnglishName || null,

              customer_mobile:
                finalCustomerPhone || null,

              customer_address:
                'Telangana',

              items: [
                {
                  ...item,

                  item_type: 'Silver',

                  item_id: item.id,

                  item_name: item.name,

                  weight: weight,

                  making_cost: makingCost,

                  silver_rate: silverRate,

                  original_amount:
                    originalPrice,

                  discount: discount,

                  amount: finalPrice,

                  sold_price: finalPrice,

                  status: 'sold',
                },
              ],
            }),
          }
        )

      const invoiceData =
        await invoiceResponse.json()

      if (!invoiceResponse.ok) {
        throw new Error(
          invoiceData.message ||
          'Sale completed, but invoice could not be created'
        )
      }

      const generatedInvoiceNumber =
        invoiceData?.invoice?.invoice_number

      if (!generatedInvoiceNumber) {
        throw new Error(
          'Invoice was created but invoice number was not returned.'
        )
      }

      setInvoiceNumber(
        generatedInvoiceNumber
      )

      // ------------------------------------------------------
      // UPDATE UI
      // ------------------------------------------------------

      setStatus('sold')
      setShowCustomerPopup(false)
      setShowDiscountPopup(false)

      playSoldSound()

      // ------------------------------------------------------
      // UPDATE PARENT
      // ------------------------------------------------------

      if (onSold) {
        onSold(
          item,
          {
            itemId: item.id,
            itemName: item.name,
            itemType: 'Silver',
            grossWeight: weight,
            makingCost: makingCost,

            originalPrice:
              originalPrice,

            discount:
              discount,

            soldPrice:
              finalPrice,

            customerName:
              finalEnglishName,

            customerPhone:
              finalCustomerPhone,

            invoiceNumber:
              generatedInvoiceNumber,
          }
        )
      }

      return {
        success: true,

        customerName:
          finalEnglishName,

        teluguName:
          finalTeluguName,

        customerPhone:
          finalCustomerPhone,

        invoiceNumber:
          generatedInvoiceNumber,

        originalPrice:
          originalPrice,

        discount:
          discount,

        finalPrice:
          finalPrice,
      }
    } catch (error) {
      console.error(
        'Silver sale error:',
        error
      )

      alert(
        `Failed to complete sale.\n\n${error.message}`
      )

      return {
        success: false,
        message: error.message,
      }
    } finally {
      setSelling(false)
    }
  }

  // ==========================================================
  // PRINT AFTER SALE
  // ==========================================================

  const printAfterSale = async () => {
    if (printing || selling || isSold) return;

    setLoaderText("Saving sale and preparing bill...");
    setPrinting(true);

    try {
      const saleResult = await saveSale();

      if (!saleResult || !saleResult.success) {
        setPrinting(false);
        return;
      }

      setCustomerName(saleResult.customerName || "");
      setTeluguName(saleResult.teluguName || "");
      setCustomerPhone(saleResult.customerPhone || "");
      setInvoiceNumber(saleResult.invoiceNumber);

      setLoaderText("Preparing bill for printing...");

      const handleAfterPrint = async () => {
        setPrinting(false);
        setLoaderText("Please wait...");

        try {
          // Reload all inventory and rate data after printing.
          await onRefresh?.();
        } catch (error) {
          console.error("Dashboard refresh failed:", error);
        } finally {
          // Focus search only after refreshed data is loaded.
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

      setTimeout(() => {
        window.print();
      }, 500);

    } catch (error) {
      console.error("Print sale error:", error);
      setPrinting(false);
    }
  };

  // ==========================================================
  // NORMAL SALE BUTTON
  // ==========================================================

  const confirmMarkAsSold = async () => {
    if (selling || printing) return;

    const result = await saveSale();

    if (result?.success) {
      try {
        await onRefresh?.();
      } catch (error) {
        console.error("Dashboard refresh failed:", error);
      }

      setTimeout(() => {
        focusItemId?.();
        document.getElementById("item-id-input")?.focus();
      }, 150);
    }
  };

  // ==========================================================
  // SELL REQUEST SHORTCUT
  // ==========================================================

  const sellRequestRef =
    useRef(sellRequest)

  const markAsSoldRef =
    useRef(markAsSold)

  markAsSoldRef.current =
    markAsSold

  useEffect(() => {
    if (
      sellRequestRef.current ===
      sellRequest
    ) {
      return
    }

    sellRequestRef.current =
      sellRequest

    if (!sellRequest) {
      return
    }

    if (
      item.status?.toLowerCase() ===
        'sold' ||
      status === 'sold'
    ) {
      return
    }

    markAsSoldRef.current()
  }, [
    sellRequest,
    item.status,
    status,
  ])

  // ==========================================================
  // DISCOUNT POPUP KEYBOARD
  //
  // ENTER = CONTINUE
  // ESC   = CANCEL
  // ==========================================================

  const handleDiscountKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()

      if (
        !selling &&
        !printing
      ) {
        setShowDiscountPopup(false)
      }

      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()

      if (
        !selling &&
        !printing
      ) {
        continueWithDiscount()
      }
    }
  }

  // ==========================================================
  // CUSTOMER POPUP KEYBOARD
  //
  // ENTER = PRINT
  // ESC   = CANCEL
  // ==========================================================

  const handlePopupKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()

      if (
        !selling &&
        !printing
      ) {
        setShowCustomerPopup(false)
      }

      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()

      if (
        !selling &&
        !printing
      ) {
        printAfterSale()
      }
    }
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      {/* ====================================================
          SILVER ITEM CARD
      \==================================================== */}

      <div
        className={
          `silver-item-card ${
            isSold
              ? 'item-sold'
              : ''
          }`
        }
      >
        {isSold && (
          <div className="sold-confetti">
            {Array.from({
              length: 45
            }).map((_, index) => (
              <span
                key={index}
                className="confetti-piece"
                style={{
                  '--i': index
                }}
              />
            ))}
          </div>
        )}

        <div className="gold-card-top">
          <div
            className={
              `item-type ${
                isSold
                  ? 'sold-type'
                  : 'silver-type'
              }`
            }
          >
            {isSold
              ? '✓ SOLD'
              : '⚪ SILVER ITEM'}
          </div>

          {!isSold && (
            <div className="item-actions">
              <button
                type="button"
                className="available-button"
                onClick={() => {
                  markAsSold()
                  setTimeout(() => {
                    focusItemId?.()
                  }, 0)
                }}
                disabled={
                  selling ||
                  printing
                }
              >
                {selling
                  ? 'UPDATING...'
                  : '✓ AVAILABLE'}
              </button>

              <button
                type="button"
                className="add-button"
                onClick={() => {
                  onAdd?.(
                    item,
                    originalPrice
                  )

                  setTimeout(() => {
                    document
                      .getElementById(
                        'item-id-input'
                      )
                      ?.focus()
                  }, 0)
                }}
              >
                + ADD
              </button>
            </div>
          )}

          {isSold && (
            <div className="sold-status-badge">
              ✓ SOLD
            </div>
          )}
        </div>

        <div className="item-content">
          <img
            src="https://res.cloudinary.com/dhuby3rax/image/upload/v1787657531/silver_model_klpdob.png"
            alt={item.name}
            className="item-image"
          />

          <div className="item-details">
            <h2>{item.name}</h2>

            <div className="silver-id">
              ID:
              <span>{item.id}</span>
            </div>

            <div className="silver-details">
              <div className="silver-weight-box">
                <p>Weight</p>
                <strong>
                  {weight.toFixed(3)} g
                </strong>
              </div>

              <div className="silver-making-box">
                <p>Making Cost</p>
                <strong>
                  ₹
                  {makingCost.toLocaleString(
                    'en-IN'
                  )}
                </strong>
              </div>

              <div className="silver-price">
                <p>
                  {isSold
                    ? 'SOLD PRICE'
                    : 'PRICE'}
                </p>

                <strong>
                  {formatMoney(
                    isSold
                      ? finalPrice
                      : originalPrice
                  )}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {isSold && (
          <div className="sold-message">
            🎉 Silver jewellery item
            successfully sold!
          </div>
        )}
      </div>

      {/* ====================================================
          DISCOUNT POPUP
      \==================================================== */}

      {showDiscountPopup && createPortal( 
        (
        <div
          className="discount-popup-overlay"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              !selling &&
              !printing
            ) {
              setShowDiscountPopup(false)
            }
          }}
        >
          <div
            className="discount-popup"
            onKeyDown={
              handleDiscountKeyDown
            }
          >
            <div className="discount-popup-header">
              <div>
                <div className="discount-popup-icon">
                  ₹
                </div>

                <div>
                  <h2>Apply Discount</h2>
                  <p>
                    Enter discount before customer details
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="discount-popup-close"
                onClick={() => {
                  if (
                    !selling &&
                    !printing
                  ) {
                    setShowDiscountPopup(false)
                  }
                }}
                disabled={
                  selling ||
                  printing
                }
              >
                ×
              </button>
            </div>

            <div className="silver-discount-summary">
              <div className="silver-discount-metric silver-discount-items">
                <span>Total Items</span>
                <strong>1</strong>
              </div>
              <div className="silver-discount-metric silver-discount-total">
                <span>Total Price</span>
                <strong>{formatMoney(originalPrice)}</strong>
              </div>
            </div>

            <div className="discount-field silver-discount-field">
              <label>Discount Amount (₹)</label>
              <input
                ref={discountInputRef}
                type="number"
                inputMode="numeric"
                min="0"
                max={Math.min(originalPrice, 500)}
                step="1"
                value={discountInput}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (/^\d*$/.test(value) && Number(value) <= 500)) {
                    setDiscountInput(value);
                  }
                }}
                placeholder="Enter discount (max ₹500)"
                disabled={selling || printing}
              />
              <span className="discount-hint">Maximum discount: ₹500</span>
            </div>

            <div className="silver-after-discount">
              <span>After Discount Price</span>
              <strong>{formatMoney(finalPrice)}</strong>
            </div>

            <div className="discount-popup-actions">
              <button
                type="button"
                className="discount-cancel-btn"
                onClick={() => {
                  if (
                    !selling &&
                    !printing
                  ) {
                    setShowDiscountPopup(false)
                  }
                }}
                disabled={
                  selling ||
                  printing
                }
              >
                ✕ Cancel
              </button>

              <button
                type="button"
                className="discount-continue-btn"
                onClick={
                  continueWithDiscount
                }
                disabled={
                  selling ||
                  printing
                }
              >
                Continue →
              </button>
            </div>
          </div>
        </div>
        ),
        document.body
      )}

      {/* ====================================================
          CUSTOMER POPUP
      \==================================================== */}

      {showCustomerPopup && createPortal(
        (
        <div
          className="customer-popup-overlay"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              !selling &&
              !printing
            ) {
              setShowCustomerPopup(false)
            }
          }}
        >
          <div
            className="customer-popup"
            onKeyDown={
              handlePopupKeyDown
            }
          >
            <div className="customer-popup-header">
              <div>
                <div className="popup-icon">
                  ✨
                </div>

                <div>
                  <h2>
                    Customer Details
                  </h2>

                  <p>
                    Enter customer information
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="customer-popup-close"
                onClick={() => {
                  if (
                    !selling &&
                    !printing
                  ) {
                    setShowCustomerPopup(false)
                  }
                }}
                disabled={
                  selling ||
                  printing
                }
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
                onKeyDown={(e) => {
                  e.stopPropagation()

                  if (
                    e.key === 'Enter'
                  ) {
                    e.preventDefault()

                    if (
                      !selling &&
                      !printing
                    ) {
                      printAfterSale()
                    }
                  }
                }}
                onChange={(e) => {
                  const value =
                    e.target.value
                      .replace(/\D/g, '')
                      .slice(0, 10)

                  setCustomerPhone(value)

                  if (
                    value.length === 10
                  ) {
                    fetchCustomerByMobile(
                      value
                    )
                  } else {
                    setCustomerName('')
                    setTeluguName('')
                    setCustomerLookupMessage('')
                    setCustomerLookupLoading(false)
                  }
                }}
                placeholder="Enter mobile number"
                autoComplete="tel"
                disabled={
                  selling ||
                  printing
                }
              />

              <span className="customer-hint">
                {customerLookupLoading ? (
                  <span className="lookup-loading">
                    <span className="mini-spinner" />
                    Searching customer...
                  </span>
                ) : (
                  customerLookupMessage ||
                  'Optional • Enter 10 digits to find customer'
                )}
              </span>
            </div>

            <div className="customer-field name-field">
              <label>Customer Name</label>

              <input
                type="text"
                value={customerName}
                onChange={(e) => {
                  const value =
                    e.target.value

                  setCustomerName(value)

                  if (!teluguName) {
                    setTeluguName(value)
                  }
                }}
                placeholder="Customer name"
                autoComplete="name"
                disabled={
                  selling ||
                  printing
                }
              />

              <span className="customer-hint">
                Original:
                {' '}
                {customerName || '—'}
                {'  •  '}
                Duplicate:
                {' '}
                {teluguName ||
                  customerName ||
                  '—'}
              </span>
            </div>

            {/* DISCOUNTED SALE PREVIEW */}

            <div className="sale-preview">
              <div>
                <span>Item</span>
                <strong>
                  {item.name}
                </strong>
              </div>

              <div>
                <span>Weight</span>
                <strong>
                  {weight.toFixed(3)} g
                </strong>
              </div>

              <div>
                <span>Discount</span>
                <strong>
                  − {formatMoney(discount)}
                </strong>
              </div>

              <div className="sale-preview-total">
                <span>Total</span>
                <strong>
                  {formatMoney(finalPrice)}
                </strong>
              </div>
            </div>

            <div
              className="customer-popup-actions"
              onMouseDown={(e) => {
                e.stopPropagation()
              }}
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              <button
                type="button"
                className="customer-cancel-btn"
                onClick={() => {
                  if (
                    !selling &&
                    !printing
                  ) {
                    setShowCustomerPopup(false)
                  }
                }}
                disabled={
                  selling ||
                  printing
                }
              >
                ✕ Cancel
              </button>

              <button
                type="button"
                className="customer-sold-btn"
                onClick={
                  confirmMarkAsSold
                }
                disabled={
                  selling ||
                  printing
                }
              >
                {selling ? (
                  <span className="button-loading">
                    <span className="button-spinner" />
                    SAVING...
                  </span>
                ) : (
                  <>✓ Sale</>
                )}
              </button>

              <button
                type="button"
                className="customer-print-btn"
                onClick={
                  printAfterSale
                }
                disabled={
                  selling ||
                  printing
                }
              >
                {printing ? (
                  <span className="button-loading">
                    <span className="button-spinner" />
                    PRINTING...
                  </span>
                ) : (
                  <>🖨 Print</>
                )}
              </button>
            </div>

            {selling && (
              <div className="popup-loading-overlay">
                <div className="popup-loader-box">
                  <div className="main-spinner" />

                  <h3>
                    Processing Sale
                  </h3>

                  <p>
                    {loaderText}
                  </p>

                  <div className="loader-progress">
                    <span />
                  </div>

                  <small>
                    Please do not close this window
                  </small>
                </div>
              </div>
            )}

            {printing && (
              <div className="popup-loading-overlay">
                <div className="popup-loader-box">
                  <div className="print-spinner">
                    🖨
                  </div>

                  <h3>
                    Preparing Bill
                  </h3>

                  <p>
                    {loaderText}
                  </p>

                  <div className="loader-progress">
                    <span />
                  </div>

                  <small>
                    Opening print dialog...
                  </small>
                </div>
              </div>
            )}
          </div>
        </div>
        ),
        document.body
      )}

      {/* ====================================================
          PRINTABLE BILL
          LEFT  = ORIGINAL → English
          RIGHT = SHOP COPY → Telugu
          \==================================================== */}

      {/* SILVER ITEM PRINT BILL */}
      {printing && (
        <div
          className="silver-print-bill-root"
          aria-hidden="true"
        >
          <div className="print-bill-page">
            <BillCopy
              side="left"
              customerName={customerName || teluguName}
              customerPhone={customerPhone}
              address="Telangana"
              billNumber={
                invoiceNumber
                  ? `SVS-${invoiceNumber}`
                  : "SVS-1000"
              }
              items={[
                {
                  ...item,
                  amount: finalPrice,
                  price: finalPrice,
                  discount: discount,
                  original_amount: originalPrice,
                },
              ]}
              subtotal={originalPrice}
              discount={discount}
              total={finalPrice}
            />

            <BillCopy
              side="right"
              customerName={teluguName || customerName}
              customerPhone={customerPhone}
              address="Telangana"
              billNumber={
                invoiceNumber
                  ? `SVS-${invoiceNumber}`
                  : "SVS-1000"
              }
              items={[
                {
                  ...item,
                  amount: finalPrice,
                  price: finalPrice,
                  discount: discount,
                  original_amount: originalPrice,
                },
              ]}
              subtotal={originalPrice}
              discount={discount}
              total={finalPrice}
            />
          </div>
        </div>
      )}
    </>
  )
}

export default SilverItem