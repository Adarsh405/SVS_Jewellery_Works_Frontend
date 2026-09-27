import React, {
  useState,
  useRef,
  useEffect
} from 'react'

import JewelleryBill from '../JewelleryBill/JewelleryBill'

const API_URL =
  'https://svs-jewellery-works-backend.onrender.com'


const SilverItem = ({
  item,
  SilverRate,
  onSold,
  onAdd,
  focusItemId,
  sellRequest
}) => {

  /* =========================================================
     STATE
  ========================================================= */

  const [selling, setSelling] =
    useState(false)

  const [status, setStatus] =
    useState(
      item.status?.toLowerCase() ||
      'available'
    )


  /* =========================================================
     CUSTOMER POPUP
  ========================================================= */

  const [showCustomerPopup, setShowCustomerPopup] =
    useState(false)

  const [customerName, setCustomerName] =
    useState('')

  const [customerPhone, setCustomerPhone] =
    useState('')


  /* =========================================================
     CUSTOMER SEARCH
  ========================================================= */

  const [customerLoading, setCustomerLoading] =
    useState(false)

  const [customerFound, setCustomerFound] =
    useState(false)


  /* =========================================================
     BILL PREVIEW
  ========================================================= */

  const [showBill, setShowBill] =
    useState(false)

  const [billCustomerName, setBillCustomerName] =
    useState('')

  const [billCustomerPhone, setBillCustomerPhone] =
    useState('')


  const mobileInputRef =
    useRef(null)


  /* =========================================================
     AUTO FOCUS MOBILE INPUT
  ========================================================= */

  useEffect(() => {

    if (!showCustomerPopup) {
      return
    }

    const timer =
      setTimeout(() => {

        mobileInputRef.current?.focus()

      }, 100)

    return () => {
      clearTimeout(timer)
    }

  }, [showCustomerPopup])


  /* =========================================================
     FIND CUSTOMER BY MOBILE
  ========================================================= */

  useEffect(() => {

    let cancelled = false

    const fetchCustomer = async () => {

      if (customerPhone.length !== 10) {

        setCustomerFound(false)
        setCustomerLoading(false)

        return
      }


      setCustomerLoading(true)
      setCustomerFound(false)


      try {

        const response =
          await fetch(
            `${API_URL}/api/customers/mobile/${customerPhone}`,
            {
              method: 'GET',
              credentials: 'include'
            }
          )


        const data =
          await response.json()


        if (cancelled) {
          return
        }


        if (
          response.ok &&
          data.success &&
          data.customer
        ) {

          setCustomerName(
            data.customer.customer_name || ''
          )

          setCustomerFound(true)

        } else {

          setCustomerName('')
          setCustomerFound(false)

        }

      } catch (error) {

        if (!cancelled) {

          console.error(
            'Customer lookup error:',
            error
          )

          setCustomerName('')
          setCustomerFound(false)

        }

      } finally {

        if (!cancelled) {
          setCustomerLoading(false)
        }

      }

    }


    fetchCustomer()


    return () => {
      cancelled = true
    }

  }, [customerPhone])


  /* =========================================================
     ITEM CALCULATION
  ========================================================= */

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


  /* =========================================================
     SOLD SOUND
  ========================================================= */

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

    } catch (error) {

      console.log(
        'Sold sound unavailable',
        error
      )

    }

  }


  /* =========================================================
     OPEN CUSTOMER POPUP
  ========================================================= */

  const markAsSold = () => {

    if (selling || isSold) {
      return
    }


    setCustomerName('')
    setCustomerPhone('')

    setCustomerFound(false)
    setCustomerLoading(false)

    setShowCustomerPopup(true)

  }


  /* =========================================================
     COMPLETE SALE
     
     shouldPrint = true
       → mark sold
       → save sold record
       → open bill preview

     shouldPrint = false
       → mark sold
       → save sold record
       → no bill
  ========================================================= */

  const completeSale = async (
    shouldPrint = false
  ) => {

    if (selling) {
      return
    }


    /* =======================================================
       VALIDATE MOBILE
    ======================================================= */

    if (
      customerPhone.length !== 10
    ) {

      alert(
        'Please enter a valid 10-digit mobile number.'
      )

      mobileInputRef.current?.focus()

      return
    }


    /* =======================================================
       WAIT FOR CUSTOMER SEARCH
    ======================================================= */

    if (customerLoading) {
      return
    }


    setSelling(true)


    try {

      /* =====================================================
         CUSTOMER DETAILS
      ===================================================== */

      const billName =
        customerName.trim()


      const billPhone =
        customerPhone.trim()


      const finalCustomerName =
        billName || 'Customer'


      const finalCustomerPhone =
        billPhone


      console.log(
        'Selling silver item:',
        {
          itemId: item.id,
          itemName: item.name,
          customerName:
            finalCustomerName,
          customerPhone:
            finalCustomerPhone,
          printBill:
            shouldPrint
        }
      )


      /* =====================================================
         STEP 1
         MARK SILVER ITEM AS SOLD
      ===================================================== */

      const response =
        await fetch(
          `${API_URL}/api/silver/${item.id}/sold`,
          {
            method: 'PATCH',

            credentials: 'include',

            headers: {
              'Content-Type':
                'application/json'
            }
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


      console.log(
        'Silver item marked as sold:',
        data
      )


      /* =====================================================
         STEP 2
         SAVE SOLD ITEM
      ===================================================== */

      const soldResponse =
        await fetch(
          `${API_URL}/api/sold-items`,
          {
            method: 'POST',

            credentials: 'include',

            headers: {
              'Content-Type':
                'application/json'
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
                finalCustomerName,

              customerPhone:
                finalCustomerPhone

            })
          }
        )


      const soldData =
        await soldResponse.json()


      if (!soldResponse.ok) {

        throw new Error(
          soldData.message ||
          'Item was marked sold, but sold record could not be saved'
        )

      }


      console.log(
        'Sold item saved:',
        soldData
      )


      /* =====================================================
         STEP 3
         UPDATE ITEM CARD
      ===================================================== */

      setStatus('sold')


      /* =====================================================
         STEP 4
         SAVE BILL CUSTOMER DETAILS
      ===================================================== */

      setBillCustomerName(
        finalCustomerName
      )

      setBillCustomerPhone(
        finalCustomerPhone
      )


      /* =====================================================
         STEP 5
         CLOSE CUSTOMER POPUP
      ===================================================== */

      setShowCustomerPopup(false)


      /* =====================================================
         STEP 6
         OPEN BILL ONLY IF PRINT WAS SELECTED
      ===================================================== */

      if (shouldPrint) {

        setShowBill(true)

      }


      /* =====================================================
         STEP 7
         RESET CUSTOMER FORM
      ===================================================== */

      setCustomerName('')
      setCustomerPhone('')

      setCustomerFound(false)
      setCustomerLoading(false)


      /* =====================================================
         STEP 8
         SUCCESS SOUND
      ===================================================== */

      playSoldSound()


      /* =====================================================
         STEP 9
         UPDATE PARENT
      ===================================================== */

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
              finalCustomerName,

            customerPhone:
              finalCustomerPhone
          }
        )

      }

    } catch (error) {

      console.error(
        'Mark silver item sold error:',
        error
      )


      alert(
        'Failed to mark item as sold.\n\n' +
        error.message
      )

    } finally {

      setSelling(false)

    }

  }


  /* =========================================================
     PRINT BILL
  ========================================================= */

  const handlePrintBill = () => {

    if (
      selling ||
      customerLoading
    ) {
      return
    }


    completeSale(true)

  }


  /* =========================================================
     MARK SOLD WITHOUT PRINTING
  ========================================================= */

  const handleMarkAsSold = () => {

    if (
      selling ||
      customerLoading
    ) {
      return
    }


    completeSale(false)

  }


  /* =========================================================
     SELL REQUEST
  ========================================================= */

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
    status
  ])


  /* =========================================================
     CUSTOMER POPUP KEYBOARD
  ========================================================= */

  const handlePopupKeyDown = (event) => {

    /* ESC = CANCEL */

    if (
      event.key === 'Escape'
    ) {

      event.preventDefault()


      if (!selling) {

        setShowCustomerPopup(
          false
        )

      }


      return
    }


    /* ENTER = PRINT BILL */

    if (
      event.key === 'Enter'
    ) {

      event.preventDefault()

      handlePrintBill()

    }

  }


  /* =========================================================
     CLOSE BILL
  ========================================================= */

  const closeBill = () => {

    setShowBill(false)

  }


  /* =========================================================
     RENDER
  ========================================================= */

  return (

    <>

      {/* =====================================================
          SILVER ITEM CARD
      ===================================================== */}

      <div
        className={
          `silver-item-card ${
            isSold
              ? 'item-sold'
              : ''
          }`
        }
      >

        {/* ===================================================
            CONFETTI
        =================================================== */}

        {isSold && (

          <div className="sold-confetti">

            {Array.from({
              length: 45
            }).map(
              (_, index) => (

                <span
                  key={index}
                  className="confetti-piece"
                  style={{
                    '--i': index
                  }}
                />

              )
            )}

          </div>

        )}


        {/* ===================================================
            TOP
        =================================================== */}

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

              {/* AVAILABLE / SELL */}

              <button
                type="button"
                className="available-button"

                onClick={() => {

                  markAsSold()


                  setTimeout(() => {

                    focusItemId?.()

                  }, 0)

                }}

                disabled={selling}
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


        {/* ===================================================
            ITEM CONTENT
        =================================================== */}

        <div className="item-content">

          <img
            src="https://res.cloudinary.com/dhuby3rax/image/upload/v1787657531/silver_model_klpdob.png"
            alt={item.name}
            className="item-image"
          />


          <div className="item-details">

            <h2>
              {item.name}
            </h2>


            <div className="silver-id">

              ID:

              <span>
                {item.id}
              </span>

            </div>


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


        {/* ===================================================
            SOLD MESSAGE
        =================================================== */}

        {isSold && (

          <div className="sold-message">

            🎉 Silver jewellery item
            successfully sold!

          </div>

        )}

      </div>


      {/* =====================================================
          CUSTOMER DETAILS POPUP
      ===================================================== */}

      {showCustomerPopup && (

        <div
          className="customer-popup-overlay"

          onMouseDown={(event) => {

            if (
              event.target ===
                event.currentTarget &&
              !selling
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

            tabIndex={-1}
          >

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="customer-popup-header">

              <div>

                <h2>
                  Customer Details
                </h2>

                <p>
                  Enter customer information
                </p>

              </div>


              <button
                type="button"
                className="customer-popup-close"

                onClick={() => {

                  if (!selling) {

                    setShowCustomerPopup(
                      false
                    )

                  }

                }}

                disabled={selling}
              >

                ×

              </button>

            </div>


            {/* =================================================
                MOBILE NUMBER
            ================================================= */}

            <div
              className={
                'customer-field mobile-field'
              }
            >

              <label>
                Mobile Number
              </label>


              <div className="customer-input-wrapper">

                <input
                  ref={mobileInputRef}

                  type="tel"

                  inputMode="numeric"

                  maxLength={10}

                  value={customerPhone}

                  onChange={(event) => {

                    const value =
                      event.target.value
                        .replace(/\D/g, '')


                    setCustomerPhone(
                      value
                    )

                  }}

                  placeholder="Enter mobile number"

                  autoComplete="tel"

                  disabled={selling}

                />


                {/* LOADING */}

                {customerLoading && (

                  <span className="customer-loading">

                    <span className="customer-spinner" />

                  </span>

                )}

              </div>


              {/* SEARCHING */}

              {customerLoading && (

                <span
                  className={
                    'customer-hint ' +
                    'customer-searching'
                  }
                >

                  Searching customer...

                </span>

              )}


              {/* FOUND */}

              {!customerLoading &&
                customerFound && (

                  <span
                    className={
                      'customer-hint ' +
                      'customer-found'
                    }
                  >

                    ✓ Customer found

                  </span>

                )}


              {/* NOT FOUND */}

              {!customerLoading &&
                customerPhone.length === 10 &&
                !customerFound && (

                  <span className="customer-hint">

                    Customer not found — enter name

                  </span>

                )}

            </div>


            {/* =================================================
                CUSTOMER NAME
            ================================================= */}

            <div
              className={
                'customer-field name-field'
              }
            >

              <label>
                Name
              </label>


              <input
                type="text"

                value={customerName}

                onChange={(event) => {

                  setCustomerName(
                    event.target.value
                  )

                }}

                placeholder={
                  customerLoading
                    ? 'Finding customer...'
                    : 'Customer name'
                }

                autoComplete="name"

                disabled={
                  selling ||
                  customerLoading
                }

              />


              <span className="customer-hint">

                {customerFound
                  ? '✓ Name loaded from customer database'
                  : 'Enter customer name'}

              </span>

            </div>


            {/* =================================================
                ACTIONS
            ================================================= */}

            <div className="customer-popup-actions">


              {/* =================================================
                  PRINT BILL
              ================================================= */}

              <button
                type="button"
                className="customer-print-btn"

                onClick={
                  handlePrintBill
                }

                disabled={
                  selling ||
                  customerLoading ||
                  customerPhone.length !== 10
                }
              >

                <span className="customer-action-icon">
                  🖨️
                </span>


                <span>

                  <strong>
                    Print Bill
                  </strong>

                  <small>
                    Mark sold & print
                  </small>

                </span>

              </button>


              {/* =================================================
                  MARK AS SOLD
              ================================================= */}

              <button
                type="button"
                className="customer-sold-btn"

                onClick={
                  handleMarkAsSold
                }

                disabled={
                  selling ||
                  customerLoading ||
                  customerPhone.length !== 10
                }
              >

                <span className="customer-action-icon">
                  ✓
                </span>


                <span>

                  <strong>
                    Mark as Sold
                  </strong>

                  <small>
                    Sold without printing
                  </small>

                </span>

              </button>


              {/* =================================================
                  CANCEL
              ================================================= */}

              <button
                type="button"
                className="customer-cancel-btn"

                onClick={() => {

                  if (!selling) {

                    setShowCustomerPopup(
                      false
                    )

                  }

                }}

                disabled={selling}
              >

                <span className="customer-action-icon">
                  ×
                </span>


                <span>

                  <strong>
                    Cancel
                  </strong>

                  <small>
                    Go back
                  </small>

                </span>

              </button>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          BILL PREVIEW

          IMPORTANT:
          JewelleryBill already contains the
          bill-modal-overlay and bill-modal.

          DO NOT wrap it in another modal here.
      ===================================================== */}

      {showBill && (

        <JewelleryBill

          billNo={
            item.id
          }

          date={
            new Date().toLocaleDateString(
              'en-IN'
            )
          }

          customerName={
            billCustomerName
          }

          customerMobile={
            billCustomerPhone
          }

          paymentMode=""

          items={[
            {
              itemName:
                item.name,

              category:
                'SILVER',

              weight:
                weight.toFixed(3),

              charges:
                makingCost,

              totalPrice:
                price
            }
          ]}

          onClose={
            closeBill
          }

        />

      )}

    </>

  )

}


export default SilverItem