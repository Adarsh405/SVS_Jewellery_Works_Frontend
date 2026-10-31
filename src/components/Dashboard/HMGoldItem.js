import React, {
  useState,
  useEffect,
  useRef,
} from 'react'

import './goldItem.css'
import BillCopy from './BillCopy.js'

const API_URL =
  'https://svs-jewellery-works-backend.onrender.com'

const HMGoldItem = ({
  item,
  HMGoldrate,
  onSold,
  onAdd,
  focusItemId,
  sellRequest,
}) => {
  const [selling, setSelling] = useState(false)
  const [printing, setPrinting] = useState(false)

  const [status, setStatus] = useState(
    item.status?.toLowerCase() || 'available'
  )

  // ============================================================
  // DISCOUNT POPUP
  // ============================================================

  const [showDiscountPopup, setShowDiscountPopup] =
    useState(false)

  const [discountInput, setDiscountInput] =
    useState('')

  // ============================================================
  // CUSTOMER POPUP
  // ============================================================

  const [showCustomerPopup, setShowCustomerPopup] =
    useState(false)

  const [teluguName, setTeluguName] =
    useState('')

  const [customerName, setCustomerName] =
    useState('')

  const [customerPhone, setCustomerPhone] =
    useState('')

  const mobileInputRef = useRef(null)

  const discountInputRef = useRef(null)

  const [customerLookupLoading, setCustomerLookupLoading] =
    useState(false)

  const [customerLookupMessage, setCustomerLookupMessage] =
    useState('')

  const [invoiceNumber, setInvoiceNumber] =
    useState(null)

  const [loaderText, setLoaderText] =
    useState('Please wait...')

  // ============================================================
  // CALCULATIONS
  // ============================================================

  const netWeight =
    Number(item.netWeight) || 0

  const charges =
    Number(item.charges) || 0

  const makingCost =
    Number(item.makingCost) || 0

  const goldRate =
    Number(HMGoldrate) || 0

  const totalWeight =
    netWeight + charges

  const originalPrice =
    (totalWeight * goldRate) + makingCost

  const discount = Math.min(
    Math.max(Number(discountInput) || 0, 0),
    originalPrice
  )

  const finalPrice =
    Math.max(
      originalPrice - discount,
      0
    )

  const isSold =
    status === 'sold'

  // ============================================================
  // FORMAT MONEY
  // ============================================================

  const formatMoney = (value) =>
    Number(value || 0).toLocaleString(
      'en-IN',
      {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }
    )

  // ============================================================
  // CUSTOMER LOOKUP
  // ============================================================

  const fetchCustomerByMobile = async (
    mobile
  ) => {
    if (mobile.length !== 10) {
      setCustomerLookupMessage('')
      return
    }

    setCustomerLookupLoading(true)
    setCustomerLookupMessage('')

    try {
      const response = await fetch(
        `${API_URL}/api/customers/mobile/${mobile}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      )

      const data =
        await response.json()

      if (
        response.ok &&
        data.success &&
        data.customer
      ) {
        const englishName =
          data.customer.customer_name || ''

        const teluguCustomerName =
          data.customer.telugu_name || ''

        setCustomerName(
          englishName
        )

        setTeluguName(
          teluguCustomerName
        )

        if (
          englishName ||
          teluguCustomerName
        ) {
          setCustomerLookupMessage(
            '✓ Customer found'
          )
        } else {
          setCustomerLookupMessage('')
        }
      } else {
        setCustomerName('')
        setTeluguName('')

        setCustomerLookupMessage(
          'New customer'
        )
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

  // ============================================================
  // DISCOUNT POPUP FOCUS
  // ============================================================

  useEffect(() => {
    if (!showDiscountPopup) {
      return
    }

    const timer =
      setTimeout(() => {
        discountInputRef.current?.focus()
        discountInputRef.current?.select()
      }, 150)

    return () =>
      clearTimeout(timer)
  }, [showDiscountPopup])

  // ============================================================
  // CUSTOMER POPUP FOCUS
  // ============================================================

  useEffect(() => {
    if (!showCustomerPopup) {
      return
    }

    const timer =
      setTimeout(() => {
        mobileInputRef.current?.focus()
      }, 150)

    return () =>
      clearTimeout(timer)
  }, [showCustomerPopup])

  // ============================================================
  // SOLD SOUND
  // ============================================================

  const playSoldSound = () => {
    try {
      const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext

      if (!AudioContext) {
        return
      }

      const audioContext =
        new AudioContext()

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

        oscillator.connect(
          gainNode
        )

        gainNode.connect(
          audioContext.destination
        )

        oscillator.type =
          'sine'

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

        oscillator.start(
          startTime
        )

        oscillator.stop(
          startTime + duration
        )
      }

      const now =
        audioContext.currentTime

      playNote(
        392,
        now,
        0.30,
        0.20
      )

      playNote(
        523.25,
        now + 0.12,
        0.35,
        0.20
      )

      playNote(
        659.25,
        now + 0.24,
        0.40,
        0.20
      )

      playNote(
        783.99,
        now + 0.36,
        0.50,
        0.18
      )

      playNote(
        1046.50,
        now + 0.48,
        0.80,
        0.15
      )

      setTimeout(() => {
        try {
          audioContext.close()
        } catch (error) {
          console.log(error)
        }
      }, 1800)
    } catch (error) {
      console.log(
        'HallMark sold sound unavailable',
        error
      )
    }
  }

  // ============================================================
  // RESET CUSTOMER
  // ============================================================

  const resetCustomerFields = () => {
    setCustomerName('')
    setTeluguName('')
    setCustomerPhone('')
    setCustomerLookupMessage('')
    setCustomerLookupLoading(false)
  }

  // ============================================================
  // OPEN DISCOUNT POPUP
  // ============================================================

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

  // ============================================================
  // CONTINUE FROM DISCOUNT
  // ============================================================

  const continueWithDiscount = () => {
    const enteredDiscount =
      Number(discountInput) || 0

    if (enteredDiscount < 0) {
      alert(
        'Discount cannot be negative.'
      )

      return
    }

    if (
      enteredDiscount >
      originalPrice
    ) {
      alert(
        `Discount cannot be more than ${formatMoney(
          originalPrice
        )}.`
      )

      return
    }

    setShowDiscountPopup(false)

    setShowCustomerPopup(true)
  }

  // ============================================================
  // SAVE SALE
  // ============================================================

  const saveSale = async () => {
    if (selling) {
      return {
        success: false,
        message:
          'Sale is already processing.',
      }
    }

    setLoaderText(
      'Processing sale...'
    )

    setSelling(true)

    try {
      const finalCustomerPhone =
        customerPhone.trim()

      const finalEnglishName =
        customerName.trim()

      const finalTeluguName =
        teluguName.trim() ||
        finalEnglishName

      // ========================================================
      // MARK HALLMARK ITEM SOLD
      // ========================================================

      setLoaderText(
        'Updating item status...'
      )

      const response =
        await fetch(
          `${API_URL}/api/hallmark/${item.id}/sold`,
          {
            method: 'PATCH',
            credentials: 'include',
            headers: {
              'Content-Type':
                'application/json',
            },
          }
        )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to mark HallMark item as sold'
        )
      }

      // ========================================================
      // SAVE SOLD ITEM
      // ========================================================

      setLoaderText(
        'Saving sale details...'
      )

      const soldResponse =
        await fetch(
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

              itemType: 'HallMark',

              itemName: item.name,

              netWeight:
                netWeight,

              charges:
                charges,

              makingCost:
                makingCost,

              soldPrice:
                finalPrice,

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

      // ========================================================
      // CREATE INVOICE
      // ========================================================

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
                finalEnglishName ||
                null,

              customer_mobile:
                finalCustomerPhone ||
                null,

              customer_address:
                'Telangana',

              items: [
                {
                  ...item,

                  item_type:
                    'HallMark',

                  item_id:
                    item.id,

                  item_name:
                    item.name,

                  net_weight:
                    netWeight,

                  charges:
                    charges,

                  total_weight:
                    totalWeight,

                  making_cost:
                    makingCost,

                  gold_rate:
                    goldRate,

                  original_amount:
                    originalPrice,

                  discount:
                    discount,

                  amount:
                    finalPrice,

                  sold_price:
                    finalPrice,

                  status:
                    'sold',
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
        invoiceData?.invoice
          ?.invoice_number

      if (!generatedInvoiceNumber) {
        throw new Error(
          'Invoice was created but invoice number was not returned.'
        )
      }

      setInvoiceNumber(
        generatedInvoiceNumber
      )

      setStatus('sold')

      setShowCustomerPopup(false)

      setShowDiscountPopup(false)

      playSoldSound()

      // ========================================================
      // UPDATE PARENT
      // ========================================================

      if (onSold) {
        onSold(item.id)
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
        'HallMark sale error:',
        error
      )

      alert(
        `Failed to complete sale.\n\n${error.message}`
      )

      return {
        success: false,
        message:
          error.message,
      }
    } finally {
      setSelling(false)
    }
  }

  // ============================================================
  // PRINT AFTER SALE
  // ============================================================

  const printAfterSale = async () => {
    if (
      printing ||
      selling ||
      isSold
    ) {
      return
    }

    setLoaderText(
      'Saving sale and preparing bill...'
    )

    setPrinting(true)

    try {
      const saleResult =
        await saveSale()

      if (
        !saleResult ||
        !saleResult.success
      ) {
        setPrinting(false)
        return
      }

      setCustomerName(
        saleResult.customerName ||
          ''
      )

      setTeluguName(
        saleResult.teluguName ||
          ''
      )

      setCustomerPhone(
        saleResult.customerPhone ||
          ''
      )

      setInvoiceNumber(
        saleResult.invoiceNumber
      )

      setLoaderText(
        'Preparing bill for printing...'
      )

      setTimeout(() => {
        window.print()

        setTimeout(() => {
          setPrinting(false)
          setLoaderText(
            'Please wait...'
          )
        }, 1000)
      }, 500)
    } catch (error) {
      console.error(
        'Print HallMark sale error:',
        error
      )

      setPrinting(false)
    }
  }

  // ============================================================
  // SALE WITHOUT PRINT
  // ============================================================

  const confirmMarkAsSold =
    async () => {
      if (
        selling ||
        printing
      ) {
        return
      }

      await saveSale()
    }

  // ============================================================
  // SELL REQUEST SUPPORT
  // ============================================================

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

  // ============================================================
  // DISCOUNT KEYBOARD
  // ============================================================

  const handleDiscountKeyDown =
    (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()

        if (
          !selling &&
          !printing
        ) {
          setShowDiscountPopup(
            false
          )
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

  // ============================================================
  // CUSTOMER POPUP KEYBOARD
  // ============================================================

  const handlePopupKeyDown =
    (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()

        if (
          !selling &&
          !printing
        ) {
          setShowCustomerPopup(
            false
          )
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

  // ============================================================
  // UI
  // ============================================================

  return (
    <>
      <div
        className={
          `gold-item-card ${
            isSold
              ? 'item-sold'
              : ''
          }`
        }
      >
        {isSold && (
          <div className="sold-confetti">
            {Array.from({
              length: 45,
            }).map(
              (_, index) => (
                <span
                  key={index}
                  className="confetti-piece"
                  style={{
                    '--i':
                      index,
                  }}
                />
              )
            )}
          </div>
        )}

        {/* =====================================================
            TOP
        ===================================================== */}

        <div className="gold-card-top">
          <div
            className={
              `item-type ${
                isSold
                  ? 'sold-type'
                  : 'gold-type'
              }`
            }
          >
            {isSold
              ? '✓ SOLD'
              : '💛 HALLMARK GOLD'}
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

        {/* =====================================================
            ITEM CONTENT
        ===================================================== */}

        <div className="item-content">
          <img
            src="https://res.cloudinary.com/dhuby3rax/image/upload/v1787657006/gold_model_dzewrc.png"
            alt={item.name}
            className="item-image"
          />

          <div className="item-details">
            <h2>
              {item.name}
            </h2>

            <div className="item-id">
              ID:
              <span>
                {item.id}
              </span>
            </div>

            <div className="gold-details-grid">
              <div className="gold-weight-box">
                <p>
                  Net Weight
                </p>

                <strong>
                  {netWeight.toFixed(
                    3
                  )}{' '}
                  g
                </strong>
              </div>

              <div className="gold-charges-box">
                <p>
                  Charges
                </p>

                <strong>
                  {charges.toFixed(
                    3
                  )}{' '}
                  g
                </strong>
              </div>

              <div className="gold-total-weight-box">
                <p>
                  Total Weight
                </p>

                <strong>
                  {totalWeight.toFixed(
                    3
                  )}{' '}
                  g
                </strong>
              </div>

              <div className="price-box">
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
            🎉 HallMark jewellery item successfully sold!
          </div>
        )}
      </div>

      {/* =======================================================
          DISCOUNT POPUP
      ======================================================= */}

      {showDiscountPopup && (
        <div
          className="discount-popup-overlay"
          onMouseDown={(e) => {
            if (
              e.target ===
                e.currentTarget &&
              !selling &&
              !printing
            ) {
              setShowDiscountPopup(
                false
              )
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
                  <h2>
                    Apply Discount
                  </h2>

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
                    setShowDiscountPopup(
                      false
                    )
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

            <div className="discount-price-summary">
              <div>
                <span>
                  Total Price
                </span>

                <strong>
                  {formatMoney(
                    originalPrice
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Total Weight
                </span>

                <strong>
                  {totalWeight.toFixed(
                    3
                  )}{' '}
                  g
                </strong>
              </div>
            </div>

            <div className="discount-field">
              <label>
                Discount Amount (₹)
              </label>

              <input
                ref={
                  discountInputRef
                }
                type="number"
                inputMode="decimal"
                min="0"
                max={
                  originalPrice
                }
                step="1"
                value={
                  discountInput
                }
                onChange={(e) => {
                  const value =
                    e.target.value

                  if (
                    value === '' ||
                    /^\d*\.?\d*$/.test(
                      value
                    )
                  ) {
                    setDiscountInput(
                      value
                    )
                  }
                }}
                placeholder="Enter discount in rupees"
                disabled={
                  selling ||
                  printing
                }
              />

              <span className="discount-hint">
                Maximum discount:{' '}
                {formatMoney(
                  originalPrice
                )}
              </span>
            </div>

            <div className="discount-result">
              <div>
                <span>
                  Original Price
                </span>

                <strong>
                  {formatMoney(
                    originalPrice
                  )}
                </strong>
              </div>

              <div className="discount-result-minus">
                <span>
                  Discount
                </span>

                <strong>
                  −{' '}
                  {formatMoney(
                    discount
                  )}
                </strong>
              </div>

              <div className="discount-result-total">
                <span>
                  Final Bill Amount
                </span>

                <strong>
                  {formatMoney(
                    finalPrice
                  )}
                </strong>
              </div>
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
                    setShowDiscountPopup(
                      false
                    )
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
      )}

      {/* =======================================================
          CUSTOMER POPUP
      ======================================================= */}

      {showCustomerPopup && (
        <div
          className="customer-popup-overlay"
          onMouseDown={(e) => {
            if (
              e.target ===
                e.currentTarget &&
              !selling &&
              !printing
            ) {
              setShowCustomerPopup(
                false
              )
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
                    setShowCustomerPopup(
                      false
                    )
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

            {/* MOBILE */}

            <div className="customer-field mobile-field">
              <label>
                Mobile Number
              </label>

              <input
                ref={
                  mobileInputRef
                }
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={
                  customerPhone
                }
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
                      .replace(
                        /\D/g,
                        ''
                      )
                      .slice(
                        0,
                        10
                      )

                  setCustomerPhone(
                    value
                  )

                  if (
                    value.length ===
                    10
                  ) {
                    fetchCustomerByMobile(
                      value
                    )
                  } else {
                    setCustomerName(
                      ''
                    )

                    setTeluguName(
                      ''
                    )

                    setCustomerLookupMessage(
                      ''
                    )

                    setCustomerLookupLoading(
                      false
                    )
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

            {/* CUSTOMER NAME */}

            <div className="customer-field name-field">
              <label>
                Customer Name
              </label>

              <input
                type="text"
                value={
                  customerName
                }
                onChange={(e) => {
                  const value =
                    e.target.value

                  setCustomerName(
                    value
                  )

                  if (
                    !teluguName
                  ) {
                    setTeluguName(
                      value
                    )
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
                Original:{' '}
                {customerName ||
                  '—'}
                {'  •  '}
                Duplicate:{' '}
                {teluguName ||
                  customerName ||
                  '—'}
              </span>
            </div>

            {/* SALE PREVIEW */}

            <div className="sale-preview">
              <div>
                <span>
                  Item
                </span>

                <strong>
                  {item.name}
                </strong>
              </div>

              <div>
                <span>
                  Total Weight
                </span>

                <strong>
                  {totalWeight.toFixed(
                    3
                  )}{' '}
                  g
                </strong>
              </div>

              <div>
                <span>
                  Discount
                </span>

                <strong>
                  −{' '}
                  {formatMoney(
                    discount
                  )}
                </strong>
              </div>

              <div className="sale-preview-total">
                <span>
                  Total
                </span>

                <strong>
                  {formatMoney(
                    finalPrice
                  )}
                </strong>
              </div>
            </div>

            {/* ACTIONS */}

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
                    setShowCustomerPopup(
                      false
                    )
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

            {/* SALE LOADER */}

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

            {/* PRINT LOADER */}

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
      )}

      {/* =======================================================
          PRINT BILL
      ======================================================= */}

      <div
        className="print-bill-root"
        aria-hidden="true"
      >
        <div className="print-bill-page">

          {/* ORIGINAL */}

          <BillCopy
            side="left"
            customerName={
              customerName ||
              teluguName
            }
            customerPhone={
              customerPhone
            }
            address="Telangana"
            billNumber={
              invoiceNumber
                ? `SVS-${invoiceNumber}`
                : 'SVS-1000'
            }
            items={[
              {
                ...item,

                item_type:
                  'HallMark',

                item_id:
                  item.id,

                item_name:
                  item.name,

                netWeight:
                  netWeight,

                net_weight:
                  netWeight,

                making_charges:
                  charges,

                makingCost:
                  makingCost,

                making_cost:
                  makingCost,

                totalWeight:
                  totalWeight,

                total_weight:
                  totalWeight,

                goldRate:
                  goldRate,

                gold_rate:
                  goldRate,

                amount:
                  finalPrice,

                price:
                  finalPrice,

                discount:
                  discount,

                original_amount:
                  originalPrice,
              },
            ]}
            subtotal={
              originalPrice
            }
            discount={
              discount
            }
            total={
              finalPrice
            }
          />

          {/* SHOP COPY */}

          <BillCopy
            side="right"
            customerName={
              teluguName ||
              customerName
            }
            customerPhone={
              customerPhone
            }
            address="Telangana"
            billNumber={
              invoiceNumber
                ? `SVS-${invoiceNumber}`
                : 'SVS-1000'
            }
            items={[
              {
                ...item,

                item_type:
                  'HallMark',

                item_id:
                  item.id,

                item_name:
                  item.name,

                netWeight:
                  netWeight,

                net_weight:
                  netWeight,

                making_charges:
                  charges,

                makingCost:
                  makingCost,

                making_cost:
                  makingCost,

                totalWeight:
                  totalWeight,

                total_weight:
                  totalWeight,

                goldRate:
                  goldRate,

                gold_rate:
                  goldRate,

                amount:
                  finalPrice,

                price:
                  finalPrice,

                discount:
                  discount,

                original_amount:
                  originalPrice,
              },
            ]}
            subtotal={
              originalPrice
            }
            discount={
              discount
            }
            total={
              finalPrice
            }
          />

        </div>
      </div>
    </>
  )
}

export default HMGoldItem