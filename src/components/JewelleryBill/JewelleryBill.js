import React from 'react'
import './JewelleryBill.css'


const JewelleryBill = ({
  billNo,
  customerName,
  customerMobile,
  items = [],
  onClose
}) => {


  // ==========================================
  // CLEAN NUMBER
  // ==========================================

  const cleanNumber = (value) => {

    return Number(
      String(value || '0')
        .replace(/,/g, '')
    )

  }


  // ==========================================
  // FORMAT MONEY
  // ==========================================

  const formatMoney = (value) => {

    return cleanNumber(value)
      .toLocaleString('en-IN')

  }


  // ==========================================
  // TOTAL WEIGHT
  // ==========================================

  const totalWeight =
    items.reduce(
      (sum, item) =>
        sum +
        cleanNumber(item.weight),
      0
    )


  // ==========================================
  // GRAND TOTAL
  // ==========================================

  const grandTotal =
    items.reduce(
      (sum, item) =>
        sum +
        cleanNumber(item.totalPrice),
      0
    )


  // ==========================================
  // DATE
  // ==========================================

  const date =
    new Date().toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
    )


  // ==========================================
  // PRINT
  // ==========================================

  const printBill = () => {

    window.print()

  }


  // ==========================================
  // BILL COPY
  // ==========================================

  const BillCopy = ({
    copyType
  }) => {

    return (

      <div
        className={
          `bill-copy ${copyType}`
        }
      >

        {/* BILL NUMBER */}

        <div className="field bill-no">

          {billNo}

        </div>


        {/* DATE */}

        <div className="field bill-date">

          {date}

        </div>


        {/* CUSTOMER NAME */}

        <div className="field customer-name">

          {customerName || ''}

        </div>


        {/* MOBILE */}

        <div className="field customer-mobile">

          {customerMobile}

        </div>


        {/* ITEMS */}

        <div className="items-container">

          {items
            .slice(0, 8)
            .map(
              (item, index) => (

                <div
                  className="item-row"
                  key={index}
                >

                  <div className="item-sno">

                    {index + 1}

                  </div>


                  <div className="item-name">

                    {item.itemName}

                  </div>


                  <div className="item-category">

                    {item.category}

                  </div>


                  <div className="item-weight">

                    {item.weight}

                  </div>


                  <div className="item-charges">

                    {formatMoney(
                      item.charges
                    )}

                  </div>


                  <div className="item-price">

                    {formatMoney(
                      item.totalPrice
                    )}

                  </div>

                </div>

              )
            )}

        </div>


        {/* TOTAL WEIGHT */}

        <div className="field total-weight">

          {totalWeight.toFixed(3)}

        </div>


        {/* GRAND TOTAL */}

        <div className="field grand-total">

          ₹ {formatMoney(grandTotal)}

        </div>

      </div>

    )

  }


  return (

    <div className="jewellery-bill-modal">

      {/* ====================================
          SCREEN TOOLBAR
      ==================================== */}

      <div className="bill-toolbar no-print">

        <div>

          <h3>
            SVS Jewellery Bill
          </h3>

          <span>
            Pre-Printed A4 Template
          </span>

        </div>


        <div className="bill-toolbar-actions">

          <button
            type="button"
            className="bill-print-btn"
            onClick={printBill}
          >

            🖨 Print Bill

          </button>


          <button
            type="button"
            className="bill-close-btn"
            onClick={onClose}
          >

            ✕

          </button>

        </div>

      </div>


      {/* ====================================
          A4 PAPER
      ==================================== */}

      <div className="a4-paper">

        <BillCopy
          copyType="original"
        />


        <BillCopy
          copyType="duplicate"
        />

      </div>

    </div>

  )

}


export default JewelleryBill