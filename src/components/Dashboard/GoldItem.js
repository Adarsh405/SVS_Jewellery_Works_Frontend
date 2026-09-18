import React, { useState, useEffect } from 'react'

const API_URL =
  'https://svs-jewellery-works-backend.onrender.com'

const GoldItem = ({
  item,
  KDMGoldrate,
  onSold,
  onAdd,
  focusItemId,
  sellRequest
}) => {

  const [selling, setSelling] = useState(false)

  const [status, setStatus] = useState(
    item.status?.toLowerCase() || 'available'
  )
  const customerName = 'Adarsh'
  const customerPhone = '9908622405'
  // --------------------------------
  // CALCULATIONS
  // --------------------------------

  const netWeight =
    Number(item.netWeight) || 0

  const charges =
    Number(item.charges) || 0

  const makingCost =
    Number(item.makingCost) || 0

  const goldRate =
    Number(KDMGoldrate) || 0

  const totalWeight =
    netWeight + charges

  const price =
    (totalWeight * goldRate) +
    makingCost

  const isSold =
    status === 'sold'


  // --------------------------------
  // CELEBRATION SOUND
  // --------------------------------

   const playSoldSound = () => {
    try {
      const AudioContext =
        window.AudioContext || window.webkitAudioContext;
  
      const audioContext = new AudioContext();
  
      const playNote = (frequency, startTime, duration, volume) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
  
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
  
        oscillator.type = "sine";
  
        oscillator.frequency.setValueAtTime(
          frequency,
          startTime
        );
  
        gainNode.gain.setValueAtTime(
          0.001,
          startTime
        );
  
        gainNode.gain.exponentialRampToValueAtTime(
          volume,
          startTime + 0.025
        );
  
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          startTime + duration
        );
  
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };
  
      const now = audioContext.currentTime;
  
      // 👑 ROYAL GOLD
      playNote(392, now, 0.30, 0.20);        // G4
      playNote(523.25, now + 0.12, 0.35, 0.20); // C5
      playNote(659.25, now + 0.24, 0.40, 0.20); // E5
      playNote(783.99, now + 0.36, 0.50, 0.18); // G5
      playNote(1046.50, now + 0.48, 0.80, 0.15); // C6
  
    } catch (error) {
      console.log("Royal Gold sound unavailable", error);
    }
  };


  // --------------------------------
  // MARK ITEM AS SOLD
  // --------------------------------

  const markAsSold = async () => {

    const confirmed =
      window.confirm(
        `Are you sure you want to mark "${item.name}" as SOLD?\n\n` +
        `Item ID: ${item.id}\n` +
        `Price: ₹${price.toLocaleString('en-IN')}`
      )

    if (!confirmed) {
      return
    }

    setSelling(true)

    try {

  // ==================================
  // MARK ORIGINAL ITEM AS SOLD
  // ==================================

  const response =
    await fetch(
      `${API_URL}/api/kdm/${item.id}/sold`,
      {
        method: 'PATCH',
        credentials: 'include'
      }
    )

  const data =
    await response.json()


  if (!response.ok) {

    throw new Error(
      data.message ||
      'Failed to mark item as sold'
    )

  }


  // ==================================
  // ADD SOLD ITEM + CUSTOMER DETAILS
  // ==================================
  
  const soldResponse =
    await fetch(
      `${API_URL}/api/sold-items`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        credentials: 'include',

        body: JSON.stringify({

          itemId: item.id,

          itemType: 'KDM',

          itemName: item.name,

          netWeight: netWeight,

          charges: charges,

          makingCost: makingCost,

          soldPrice: price,

          customerName: customerName,

          customerPhone: customerPhone

        })

      }
    )


  const soldData =
    await soldResponse.json()


  if (!soldResponse.ok) {

    throw new Error(
      soldData.message ||
      'Item sold, but failed to save sales record'
    )

  }


  // ==================================
  // UPDATE UI
  // ==================================

  setStatus('sold')


  // ==================================
  // UPDATE DASHBOARD STATE
  // ==================================

  if (onSold) {
    onSold(item.id)
  }


  // ==================================
  // PLAY SOUND
  // ==================================

  playSoldSound()


} catch (error) {

  console.error(
    'Mark sold error:',
    error
  )

  alert(
    error.message ||
    'Unable to mark item as sold'
  )

} finally {

  setSelling(false)

}

  }

  useEffect(() => {
    if (!sellRequest) {
      return
    }

    // Only act on the currently displayed item
    if (
      item.status?.toLowerCase() === 'sold' ||
      status === 'sold'
    ) {
      return
    }

    markAsSold()

  }, [sellRequest])
  return (

    <div
      className={
        `gold-item-card ${
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
          TOP SECTION
      ================================= */}

      <div className="gold-card-top">

        {/* ITEM TYPE */}

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
            : '💛 GOLD ITEM'}

        </div>


        {/* AVAILABLE BUTTON */}

        {!isSold && (

          <div className="item-actions">

            <button
              type="button"
              className="available-button"
              onClick={() => {
                  markAsSold()
          
                  setTimeout(() => {
                    focusItemId()
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
                onAdd(item, price)
            
                setTimeout(() => {
                  focusItemId()
                }, 0)
              }}
            >
              + ADD
            </button>
      
          </div>
        )}


        {/* SOLD BUTTON */}

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

        {/* IMAGE */}

        <img
          src="https://res.cloudinary.com/dhuby3rax/image/upload/v1787657006/gold_model_dzewrc.png"
          alt={item.name}
          className="item-image"
        />


        {/* DETAILS */}

        <div className="item-details">

          <h2>
            {item.name}
          </h2>


          {/* ITEM ID */}

          <div className="item-id">

            ID:

            <span>
              {item.id}
            </span>

          </div>


          {/* DETAILS GRID */}

          <div className="gold-details-grid">

            {/* NET WEIGHT */}

            <div className="gold-weight-box">

              <p>
                Net Weight
              </p>
            
              <strong>
                {netWeight.toFixed(3)} g
              </strong>
            
            </div>
            
            
            <div className="gold-charges-box">
            
              <p>
                Charges
              </p>
            
              <strong>
                {charges.toFixed(3)} g
              </strong>
            
            </div>
            
            
            <div className="gold-total-weight-box">
            
              <p>
                Total Weight
              </p>
            
              <strong>
                {totalWeight.toFixed(3)} g
              </strong>
            
            </div>


            {/* PRICE */}

            <div className="price-box">

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

          🎉 Jewellery item successfully sold!

        </div>

      )}

    </div>

  )
}

export default GoldItem
