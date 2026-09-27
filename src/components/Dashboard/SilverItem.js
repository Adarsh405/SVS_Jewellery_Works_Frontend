import React, {
  useState,
  useRef,
  useEffect,
} from 'react'

import './SilverItem.css'

const API_URL =
  'https://svs-jewellery-works-backend.onrender.com'


// ============================================================
// BILL COPY
// ============================================================

const BillCopy = ({
  side,
  item,
  customerName,
  customerPhone,
  weight,
  makingCost,
  price,
}) => {

  const today = new Date()

  const billDate =
    today.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })

  const billNumber =
    item?.id
      ? `SVS-${item.id}`
      : 'SVS-0000'

  const itemName =
    item?.name || 'Silver Item'

  const money =
    Number(price || 0).toLocaleString(
      'en-IN',
      {
        maximumFractionDigits: 0,
      }
    )

  const charges =
    Number(makingCost || 0).toLocaleString(
      'en-IN',
      {
        maximumFractionDigits: 0,
      }
    )

  return (
    <div
      className={`bill-copy ${
        side === 'right'
          ? 'bill-copy-right'
          : 'bill-copy-left'
      }`}
    >

      {/* BILL NUMBER */}

      <span className="bill-print-field bill-no-value">
        {billNumber}
      </span>


      {/* DATE */}

      <span className="bill-print-field bill-date-value">
        {billDate}
      </span>


      {/* CUSTOMER NAME */}

      <span className="bill-print-field bill-customer-name">
        {customerName || ''}
      </span>


      {/* MOBILE */}

      <span className="bill-print-field bill-customer-mobile">
        {customerPhone || ''}
      </span>


      {/* ITEM */}

      <span className="bill-print-field bill-row bill-row-item">
        {itemName}
      </span>


      {/* CATEGORY */}

      <span className="bill-print-field bill-row bill-row-category">
        SILVER
      </span>


      {/* WEIGHT */}

      <span className="bill-print-field bill-row bill-row-weight">
        {Number(weight || 0).toFixed(3)}
      </span>


      {/* CHARGES */}

      <span className="bill-print-field bill-row bill-row-charges">
        ₹{charges}
      </span>


      {/* PRICE */}

      <span className="bill-print-field bill-row bill-row-price">
        ₹{money}
      </span>


      {/* GRAND TOTAL */}

      <span className="bill-print-field bill-grand-total">
        ₹ {money}
      </span>

    </div>
  )
}


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
}) => {

  // ==========================================================
  // MAIN STATES
  // ==========================================================

  const [selling, setSelling] =
    useState(false)

  const [printing, setPrinting] =
    useState(false)

  const [status, setStatus] =
    useState(
      item.status?.toLowerCase() ||
      'available'
    )


  // ==========================================================
  // CUSTOMER POPUP
  // ==========================================================

  const [showCustomerPopup, setShowCustomerPopup] =
    useState(false)


  // Telugu name
  const [teluguName, setTeluguName] =
    useState('')


  // English/customer name
  const [customerName, setCustomerName] =
    useState('')


  const [customerPhone, setCustomerPhone] =
    useState('')


  const mobileInputRef =
    useRef(null)


  // ==========================================================
  // CUSTOMER SEARCH
  // ==========================================================

  const [customerLookupLoading, setCustomerLookupLoading] =
    useState(false)

  const [customerLookupMessage, setCustomerLookupMessage] =
    useState('')


  // ==========================================================
  // LOADER
  // ==========================================================

  const [loaderText, setLoaderText] =
    useState('Please wait...')


  // ==========================================================
  // VALUES
  // ==========================================================

  const weight =
    Number(item.weight) || 0

  const makingCost =
    Number(item.makingCost) || 0

  const silverRate =
    Number(SilverRate) || 0

  const price =
    (weight * silverRate) +
    makingCost

  const isSold =
    status === 'sold'


  // ==========================================================
  // CUSTOMER LOOKUP
  // ==========================================================

  const fetchCustomerByMobile =
    async (mobile) => {

      if (mobile.length !== 10) {
        setCustomerLookupMessage('')
        return
      }

      setCustomerLookupLoading(true)
      setCustomerLookupMessage('')

      try {

        const response =
          await fetch(
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
            data.customer.customer_name ||
            ''

          const teluguCustomerName =
            data.customer.telugu_name ||
            ''


          // Keep BOTH names separately

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


  // ==========================================================
  // AUTO FOCUS MOBILE
  // ==========================================================

  useEffect(() => {

    if (!showCustomerPopup) {
      return
    }

    const timer =
      setTimeout(() => {

        mobileInputRef.current?.focus()

      }, 150)

    return () => {
      clearTimeout(timer)
    }

  }, [showCustomerPopup])


  // ==========================================================
  // SOLD SOUND
  // ==========================================================

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
  // OPEN SALE POPUP
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

    setShowCustomerPopup(true)

  }


  // ==========================================================
  // ACTUAL SALE API
  // ==========================================================

  const saveSale = async () => {

    if (selling) {
      return false
    }


    setLoaderText(
      'Processing sale...'
    )

    setSelling(true)


    try {

      const finalCustomerPhone =
        customerPhone.trim()


      /*
        For a new customer:
        whatever is typed becomes the
        fallback for both copies.
      */

      const finalEnglishName =
        customerName.trim()


      const finalTeluguName =
        teluguName.trim() ||
        finalEnglishName


      // ======================================================
      // STEP 1
      // MARK SILVER SOLD
      // ======================================================

      setLoaderText(
        'Updating item status...'
      )


      const response =
        await fetch(
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


      const data =
        await response.json()


      if (!response.ok) {

        throw new Error(
          data.message ||
          'Failed to mark silver item as sold'
        )

      }


      // ======================================================
      // STEP 2
      // SAVE SOLD ITEM
      // ======================================================

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

              itemId:
                item.id,

              itemType:
                'Silver',

              itemName:
                item.name,

              grossWeight:
                weight,

              makingCost:
                makingCost,

              soldPrice:
                price,

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


      // ======================================================
      // UPDATE UI
      // ======================================================

      setStatus('sold')

      setShowCustomerPopup(false)


      playSoldSound()


      // ======================================================
      // UPDATE PARENT
      // ======================================================

      if (onSold) {

        onSold(
          item,
          {
            itemId:
              item.id,

            itemName:
              item.name,

            itemType:
              'Silver',

            grossWeight:
              weight,

            makingCost:
              makingCost,

            soldPrice:
              price,

            customerName:
              finalEnglishName,

            customerPhone:
              finalCustomerPhone,

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
      }

    } finally {

      setSelling(false)

    }

  }


  // ==========================================================
  // PRINT AFTER SALE
  // ==========================================================

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

      /*
        Save sale first.
      */

      const saleResult =
        await saveSale()


      if (
        !saleResult ||
        !saleResult.success
      ) {

        setPrinting(false)

        return

      }


      /*
        Keep the names available for the
        printable bill.
      */

      setCustomerName(
        saleResult.customerName || ''
      )

      setTeluguName(
        saleResult.teluguName || ''
      )

      setCustomerPhone(
        saleResult.customerPhone || ''
      )


      setLoaderText(
        'Preparing bill for printing...'
      )


      /*
        Give React time to render
        updated customer details.
      */

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
        'Print sale error:',
        error
      )

      setPrinting(false)

    }

  }


  // ==========================================================
  // NORMAL SALE BUTTON
  // ==========================================================

  const confirmMarkAsSold = async () => {

    if (
      selling ||
      printing
    ) {
      return
    }

    await saveSale()

  }


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
  // POPUP KEYBOARD
  //
  // ENTER = PRINT BUTTON
  // ESC   = CANCEL
  // ==========================================================

  const handlePopupKeyDown =
    (e) => {

      if (
        e.key === 'Escape'
      ) {

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


      /*
        ENTER now performs:
        SALE + PRINT
      */

      if (
        e.key === 'Enter'
      ) {

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
  // ADD ITEM
  // ==========================================================

  // const handleAdd = () => {

  //   if (
  //     selling ||
  //     printing
  //   ) {
  //     return
  //   }


  //   onAdd?.(
  //     item,
  //     price
  //   )


  //   setTimeout(() => {

  //     document
  //       .getElementById(
  //         'item-id-input'
  //       )
  //       ?.focus()

  //   }, 0)

  // }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>

      {/* ====================================================
          SILVER ITEM CARD
      ==================================================== */}

      <div
          className={`silver-item-card ${
            isSold ? 'item-sold' : ''
          }`}
        >
          {/* ==================================================
              TOP
          ================================================== */}

          <div className="silver-card-top">

            {/* TYPE */}
            <div
              className={`item-type ${
                isSold
                  ? 'sold-type'
                  : 'silver-type'
              }`}
            >
              {isSold
                ? '✓ SOLD'
                : '⚪ SILVER ITEM'}
            </div>


            {/* AVAILABLE / ACTION BUTTONS */}
            {!isSold && (
              <div className="item-actions">

                {/* SALE */}
                <button
                  type="button"
                  className="available-button"
                  onClick={() => {
                    markAsSold();

                    setTimeout(() => {
                      focusItemId?.();
                    }, 0);
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


                {/* ADD */}
                <button
                  type="button"
                  className="add-button"
                  onClick={() => {
                    onAdd(
                      item,
                      price
                    );

                    setTimeout(() => {
                      document
                        .getElementById(
                          'item-id-input'
                        )
                        ?.focus();
                    }, 0);
                  }}
                  disabled={
                    selling ||
                    printing
                  }
                >
                  + ADD
                </button>

              </div>
            )}


            {/* SOLD */}
            {isSold && (
              <div className="sold-status-badge">
                ✓ SOLD
              </div>
            )}

          </div>


          {/* ==================================================
              ITEM CONTENT
          ================================================== */}

          <div className="item-content">

            {/* IMAGE */}
            <img
              src="https://res.cloudinary.com/dhuby3rax/image/upload/v1787657531/silver_model_klpdob.png"
              alt={item.name}
              className="item-image"
            />


            {/* DETAILS */}
            <div className="item-details">

              {/* ITEM NAME */}
              <h2>
                {item.name}
              </h2>


              {/* ITEM ID */}
              <div className="silver-id">
                ID:
                <span>
                  {item.id}
                </span>
              </div>


              {/* DETAILS */}
              <div className="silver-details">

                {/* WEIGHT */}
                <div className="silver-weight-box">

                  <p>
                    Weight
                  </p>

                  <strong>
                    {weight.toFixed(3)} g
                  </strong>

                </div>


                {/* MAKING COST */}
                <div className="silver-making-box">

                  <p>
                    Making Cost
                  </p>

                  <strong>
                    ₹
                    {makingCost.toLocaleString(
                      'en-IN'
                    )}
                  </strong>

                </div>


                {/* PRICE */}
                <div className="silver-price">

                  <p>
                    {isSold
                      ? 'SOLD PRICE'
                      : 'PRICE'}
                  </p>

                  <strong>
                    {price.toLocaleString(
                      'en-IN',
                      {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0
                      }
                    )}
                  </strong>

                </div>

              </div>

            </div>

          </div>


          {/* ==================================================
              SOLD MESSAGE
          ================================================== */}

          {isSold && (
            <div className="sold-message">
              🎉 Silver jewellery item
              successfully sold!
            </div>
          )}

        </div>


      {/* ====================================================
          CUSTOMER POPUP
      ==================================================== */}

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

            {/* HEADER */}

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


                  setCustomerPhone(
                    value
                  )


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
                value={customerName}

                onChange={(e) => {

                  const value =
                    e.target.value

                  setCustomerName(
                    value
                  )

                  /*
                    For a manually entered new
                    customer, use same name
                    as Telugu fallback.
                  */

                  if (!teluguName) {

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

                Original:
                {' '}
                {customerName || '—'}

                {'  •  '}

                Duplicate:
                {' '}
                {teluguName || customerName || '—'}

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
                  Weight
                </span>

                <strong>
                  {weight.toFixed(3)} g
                </strong>

              </div>


              <div>

                <span>
                  Total
                </span>

                <strong>
                  ₹
                  {price.toLocaleString(
                    'en-IN'
                  )}
                </strong>

              </div>

            </div>


            {/* =================================================
                BUTTON ORDER

                CANCEL
                SALE
                PRINT
            ================================================= */}

            <div
              className="customer-popup-actions"
              onMouseDown={(e) => {
                e.stopPropagation()
              }}
              onClick={(e) => {
                e.stopPropagation()
              }}
            >

              {/* CANCEL */}

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


              {/* SALE - MIDDLE */}

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

                  <>
                    ✓ Sale
                  </>

                )}

              </button>


              {/* PRINT - LAST */}

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

                  <>
                    🖨 Print
                  </>

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


      {/* ====================================================
          PRINTABLE BILL

          NO BACKGROUND IMAGE
      ==================================================== */}

      <div
        className="print-bill-root"
        aria-hidden="true"
      >

        <div className="print-bill-page">

          {/* ORIGINAL = ENGLISH CUSTOMER NAME */}

          <BillCopy
            side="left"
            item={item}
            customerName={
              customerName ||
              teluguName
            }
            customerPhone={
              customerPhone
            }
            weight={weight}
            makingCost={makingCost}
            price={price}
          />


          {/* DUPLICATE = TELUGU CUSTOMER NAME */}

          <BillCopy
            side="right"
            item={item}
            customerName={
              teluguName ||
              customerName
            }
            customerPhone={
              customerPhone
            }
            weight={weight}
            makingCost={makingCost}
            price={price}
          />

        </div>

      </div>

    </>
  )
}


export default SilverItem