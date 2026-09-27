import React, {
  useState,
  useRef,
  useEffect
} from 'react'

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

  const [selling, setSelling] = useState(false)

  const [status, setStatus] = useState(
    item.status?.toLowerCase() || 'available'
  )

  // ==========================================
  // CUSTOMER POPUP
  // ==========================================

  const [showCustomerPopup, setShowCustomerPopup] =
    useState(false)

  const [customerName, setCustomerName] =
    useState('')

  const [customerPhone, setCustomerPhone] =
    useState('')

  const mobileInputRef = useRef(null)

  // ==========================================
  // CUSTOMER LOOKUP
  // ==========================================

  const [customerLookupLoading, setCustomerLookupLoading] =
    useState(false)

  const [customerLookupMessage, setCustomerLookupMessage] =
    useState('')

  // ==========================================
  // FETCH CUSTOMER AFTER 10 DIGITS
  // ==========================================

  const fetchCustomerByMobile = async (mobile) => {

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
          credentials: 'include'
        }
      )

      const data = await response.json()

      console.log(
        'Customer lookup response:',
        data
      )

      if (
        response.ok &&
        data.success &&
        data.customer
      ) {

        const foundName =
          data.customer.telugu_name || ''

        setCustomerName(foundName)

        if (foundName) {
          setCustomerLookupMessage(
            '✓ Customer found'
          )
        } else {
          setCustomerLookupMessage('')
        }

      } else {

        // New customer
        setCustomerName('')

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

      setCustomerLookupMessage(
        'Customer not found'
      )

    } finally {

      setCustomerLookupLoading(false)

    }

  }


  // ==========================================
  // AUTO FOCUS MOBILE NUMBER
  // ==========================================

  useEffect(() => {

    if (showCustomerPopup) {

      setTimeout(() => {

        mobileInputRef.current?.focus()

      }, 100)

    }

  }, [showCustomerPopup])


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


  // ==========================================
  // SOLD SOUND
  // ==========================================

  const playSoldSound = () => {

    try {

      const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext

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


      // 👑 ROYAL GOLD SOUND

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

    }

    catch (error) {

      console.log(
        'Royal Gold sound unavailable',
        error
      )

    }

  }


  // ==========================================
  // OPEN CUSTOMER POPUP
  // ==========================================

  const markAsSold = () => {

    if (selling) {
      return
    }

    setCustomerName('')
    setCustomerPhone('')
    setCustomerLookupMessage('')
    setCustomerLookupLoading(false)

    setShowCustomerPopup(true)

  }


  // ==========================================
  // CONFIRM CUSTOMER + MARK SOLD
  // ==========================================

  const confirmMarkAsSold = async () => {

    if (selling) {
      return
    }

    setSelling(true)

    try {

      // ========================================
      // CUSTOMER DETAILS
      // BOTH ARE OPTIONAL
      // ========================================

      const finalCustomerPhone =
        customerPhone.trim()

      const finalCustomerName =
        customerName.trim()


      console.log(
        'Selling silver item:',
        {
          itemId: item.id,
          itemName: item.name,
          customerName: finalCustomerName,
          customerPhone: finalCustomerPhone
        }
      )


      // ========================================
      // STEP 1
      // MARK SILVER ITEM AS SOLD
      // ========================================

      const response =
        await fetch(
          `${API_URL}/api/silver/${item.id}/sold`,
          {
            method: 'PATCH',

            credentials: 'include',

            headers: {
              'Content-Type': 'application/json'
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


      // ========================================
      // STEP 2
      // SAVE SOLD ITEM + CUSTOMER DETAILS
      // ========================================

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

              // ITEM

              itemId: item.id,

              itemType: 'Silver',

              itemName: item.name,


              // WEIGHT

              grossWeight: weight,


              // MONEY

              makingCost: makingCost,

              soldPrice: price,


              // CUSTOMER

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


      // ========================================
      // STEP 3
      // UPDATE CARD
      // ========================================

      setStatus('sold')


      // ========================================
      // STEP 4
      // CLOSE POPUP
      // ========================================

      setShowCustomerPopup(false)


      // ========================================
      // STEP 5
      // RESET CUSTOMER FIELDS
      // ========================================

      setCustomerName('')

      setCustomerPhone('')

      setCustomerLookupMessage('')

      setCustomerLookupLoading(false)


      // ========================================
      // STEP 6
      // PLAY SOLD SOUND
      // ========================================

      playSoldSound()


      // ========================================
      // STEP 7
      // UPDATE PARENT / DASHBOARD
      // ========================================

      if (onSold) {

        onSold(
          item,
          {
            itemId: item.id,

            itemName: item.name,

            itemType: 'Silver',

            grossWeight: weight,

            makingCost: makingCost,

            soldPrice: price,

            customerName:
              finalCustomerName,

            customerPhone:
              finalCustomerPhone
          }
        )

      }

    }

    catch (error) {

      console.error(
        'Mark silver item sold error:',
        error
      )


      alert(
        'Failed to mark item as sold.\n\n' +
        error.message
      )

    }

    finally {

      setSelling(false)

    }

  }


  // ==========================================
  // ⭐ KEY SELL SHORTCUT
  // ==========================================

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
      item.status?.toLowerCase() === 'sold' ||
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


  // ==========================================
  // POPUP KEYBOARD CONTROL
  // ==========================================

  const handlePopupKeyDown = (e) => {

    // ESC = CLOSE

    if (e.key === 'Escape') {

      if (!selling) {

        setShowCustomerPopup(false)

      }

      return

    }


    // ENTER = MARK SOLD

    if (e.key === 'Enter') {

      e.preventDefault()

      confirmMarkAsSold()

    }

  }


  return (

    <>

      {/* =====================================
          SILVER ITEM CARD
      ===================================== */}

      <div
        className={
          `silver-item-card ${
            isSold
              ? 'item-sold'
              : ''
          }`
        }
      >


        {/* =================================
            CONFETTI
        ================================= */}

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


        {/* =================================
            TOP
        ================================= */}

        <div className="gold-card-top">


          {/* TYPE */}

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


          {/* AVAILABLE */}

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

                disabled={selling}
              >

                {selling
                  ? 'UPDATING...'
                  : '✓ AVAILABLE'}

              </button>


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


          {/* SOLD */}

          {isSold && (

            <div className="sold-status-badge">

              ✓ SOLD

            </div>

          )}

        </div>


        {/* =================================
            ITEM CONTENT
        ================================= */}

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


            {/* ITEM ID */}

            <div className="silver-id">

              ID:

              <span>
                {item.id}
              </span>

            </div>


            {/* DETAILS */}

            <div className="silver-details">


              <div className="silver-weight-box">

                <p>
                  Weight
                </p>

                <strong>
                  {weight.toFixed(3)} g
                </strong>

              </div>


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


        {/* =================================
            SOLD MESSAGE
        ================================= */}

        {isSold && (

          <div className="sold-message">

            🎉 Silver jewellery item
            successfully sold!

          </div>

        )}

      </div>


      {/* =====================================
          CUSTOMER DETAILS POPUP
      ===================================== */}

      {showCustomerPopup && (

        <div
          className="customer-popup-overlay"

          onMouseDown={(e) => {

            if (
              e.target ===
              e.currentTarget &&
              !selling
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


            {/* HEADER */}

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


            {/* =================================
                MOBILE NUMBER
            ================================= */}

            <div
              className={
                'customer-field mobile-field'
              }
            >

              <label>
                Mobile Number
              </label>


              <input
                ref={mobileInputRef}
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={customerPhone}

                onClick={(e) => {
                  e.stopPropagation()
                }}

                onMouseDown={(e) => {
                  e.stopPropagation()
                }}

                onFocus={(e) => {
                  e.stopPropagation()
                }}

                onKeyDown={(e) => {
                  e.stopPropagation()

                  // Allow Enter only for the customer popup
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    confirmMarkAsSold()
                  }
                }}

                onChange={(e) => {

                  const value =
                    e.target.value
                      .replace(/\D/g, '')
                      .slice(0, 10)

                  setCustomerPhone(value)

                  if (value.length === 10) {

                    fetchCustomerByMobile(value)

                  } else {

                    setCustomerName('')

                    setCustomerLookupMessage('')

                    setCustomerLookupLoading(false)

                  }

                }}

                placeholder="Enter mobile number"

                autoComplete="tel"

                disabled={selling}
              />

              <span className="customer-hint">

                {customerLookupLoading
                  ? 'Searching customer...'
                  : customerLookupMessage ||
                    'Optional • Enter 10 digits to find customer'}

              </span>

            </div>


            {/* =================================
                NAME
            ================================= */}

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

                onChange={(e) => {

                  setCustomerName(
                    e.target.value
                  )

                }}

                placeholder="Customer name"

                autoComplete="name"

                disabled={selling}
              />


              <span className="customer-hint">

                Optional • Auto-filled from mobile number

              </span>

            </div>


            {/* =================================
                ACTIONS
            ================================= */}

            <div
              className="customer-popup"
              onMouseDown={(e) => {
                e.stopPropagation()
              }}
              onClick={(e) => {
                e.stopPropagation()
              }}
              onKeyDown={handlePopupKeyDown}
            >


              <button
                type="button"

                className={
                  'customer-cancel-btn'
                }

                onClick={() => {

                  if (!selling) {

                    setShowCustomerPopup(
                      false
                    )

                  }

                }}

                disabled={selling}
              >

                Cancel

              </button>


              <button
                type="button"

                className={
                  'customer-sold-btn'
                }

                onClick={
                  confirmMarkAsSold
                }

                disabled={selling}
              >

                {selling
                  ? 'SAVING...'
                  : '✓ Mark as Sold'}

              </button>


            </div>

          </div>

        </div>

      )}

    </>

  )

}


export default SilverItem