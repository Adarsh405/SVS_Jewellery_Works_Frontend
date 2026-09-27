import React, { useEffect, useRef } from "react";
import "./JewelleryBill.css";
import billTemplate from "./svs-bill.jpeg";

const JewelleryBill = ({
  billNo,
  date,
  customerName,
  customerMobile,
  paymentMode,
  items = [],
  onClose,
  autoPrint = true,
}) => {

  // =========================================================
  // PRINT PAGE REF
  // =========================================================

  const printStartedRef = useRef(false);


  // =========================================================
  // CLEAN NUMBER
  // =========================================================

  const cleanNumber = (value) => {
    return (
      Number(
        String(value ?? "0")
          .replace(/,/g, "")
          .trim()
      ) || 0
    );
  };


  // =========================================================
  // MONEY FORMAT
  // =========================================================

  const formatMoney = (value) => {
    return cleanNumber(value).toLocaleString("en-IN");
  };


  // =========================================================
  // TOTAL WEIGHT
  // =========================================================

  const totalWeight = items.reduce(
    (sum, item) => {
      return sum + cleanNumber(item?.weight);
    },
    0
  );


  // =========================================================
  // GRAND TOTAL
  // =========================================================

  const grandTotal = items.reduce(
    (sum, item) => {
      return sum + cleanNumber(item?.totalPrice);
    },
    0
  );


  // =========================================================
  // SILVER CHECK
  // =========================================================

  const isSilverItem = (item) => {

    const category = String(
      item?.category || ""
    ).toLowerCase();

    const itemType = String(
      item?.itemType || ""
    ).toLowerCase();

    return (
      category.includes("silver") ||
      itemType.includes("silver")
    );
  };


  // =========================================================
  // PRINT
  // =========================================================

  const printBill = () => {

    if (printStartedRef.current) {
      return;
    }

    printStartedRef.current = true;

    // Give React/browser time to render
    // the A4 bill before opening print.

    setTimeout(() => {

      window.print();

      // Allow printing again if
      // the browser closes the dialog.

      setTimeout(() => {
        printStartedRef.current = false;
      }, 1000);

    }, 300);
  };


  // =========================================================
  // AUTOMATIC PRINT
  // =========================================================

  useEffect(() => {

    if (!autoPrint) {
      return;
    }

    const timer = setTimeout(() => {

      printBill();

    }, 500);


    return () => {
      clearTimeout(timer);
    };

  }, [autoPrint]);


  // =========================================================
  // AFTER PRINT
  // =========================================================

  useEffect(() => {

    const handleAfterPrint = () => {

      printStartedRef.current = false;

    };


    window.addEventListener(
      "afterprint",
      handleAfterPrint
    );


    return () => {

      window.removeEventListener(
        "afterprint",
        handleAfterPrint
      );

    };

  }, []);


  // =========================================================
  // KEYBOARD
  // =========================================================

  useEffect(() => {

    const handleKeyDown = (event) => {

      // ENTER = PRINT

      if (
        event.key === "Enter" &&
        !event.target?.matches(
          "input, textarea, select, button"
        )
      ) {

        event.preventDefault();

        printBill();

      }


      // ESC = CLOSE

      if (event.key === "Escape") {

        event.preventDefault();

        if (onClose) {
          onClose();
        }

      }

    };


    window.addEventListener(
      "keydown",
      handleKeyDown
    );


    return () => {

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

    };

  }, [onClose]);


  // =========================================================
  // COPY DETAILS
  // =========================================================

  const CopyDetails = ({ type }) => {

    return (

      <div
        className={`copy-details ${type}`}
      >

        {/* =========================================
            BILL NUMBER
        ========================================= */}

        <div className="detail bill-number">

          {billNo || ""}

        </div>


        {/* =========================================
            DATE
        ========================================= */}

        <div className="detail bill-date">

          {date || ""}

        </div>


        {/* =========================================
            CUSTOMER NAME
        ========================================= */}

        <div className="detail customer-name">

          {customerName || ""}

        </div>


        {/* =========================================
            MOBILE
        ========================================= */}

        <div className="detail customer-mobile">

          {customerMobile || ""}

        </div>


        {/* =========================================
            PAYMENT MODE
        ========================================= */}

        <div className="detail payment-mode">

          {paymentMode || ""}

        </div>


        {/* =========================================
            ITEMS
        ========================================= */}

        <div className="items-area">

          {items
            .slice(0, 8)
            .map((item, index) => {

              const silver =
                isSilverItem(item);


              return (

                <div
                  className="print-item"
                  key={
                    item?.id ??
                    item?.itemId ??
                    index
                  }
                >

                  {/* S.NO */}

                  <span className="sno">

                    {index + 1}

                  </span>


                  {/* ITEM NAME */}

                  <span className="item-name">

                    {item?.itemName || ""}

                  </span>


                  {/* CATEGORY */}

                  <span className="category">

                    {item?.category || ""}

                  </span>


                  {/* WEIGHT */}

                  <span className="weight">

                    {item?.weight ?? ""}

                  </span>


                  {/* CHARGES */}

                  <span className="charges">

                    {silver
                      ? ""
                      : item?.charges ?? ""}

                  </span>


                  {/* PRICE */}

                  <span className="price">

                    {item?.totalPrice ?? ""}

                  </span>

                </div>

              );

            })}

        </div>


        {/* =========================================
            TOTAL WEIGHT
        ========================================= */}

        <div className="detail total-weight">

          {totalWeight.toFixed(3)}

        </div>


        {/* =========================================
            GRAND TOTAL
        ========================================= */}

        <div className="detail grand-total">

          ₹ {formatMoney(grandTotal)}

        </div>

      </div>

    );

  };


  // =========================================================
  // SCREEN + PRINT
  // =========================================================

  return (

    <div className="jewellery-bill-page">

      {/* =====================================================
          SMALL SCREEN TOOLBAR
      ===================================================== */}

      <div className="bill-toolbar no-print">

        <div>

          <h3>
            SVS Jewellery Bill
          </h3>

          <span>
            A4 Original + Duplicate
          </span>

        </div>


        <div className="bill-toolbar-actions">

          <button
            type="button"
            onClick={printBill}
          >
            🖨 Print Bill
          </button>


          <button
            type="button"
            className="bill-close-button"
            onClick={onClose}
          >
            Close
          </button>

        </div>

      </div>


      {/* =====================================================
          A4 PRINT PAGE
      ===================================================== */}

      <div className="print-page">

        {/* ===================================================
            ORIGINAL BILL TEMPLATE
        =================================================== */}

        <img
          src={billTemplate}
          alt="SVS Jewellery Bill Template"
          className="bill-template-image"
        />


        {/* ===================================================
            LEFT — ORIGINAL / CUSTOMER COPY
        =================================================== */}

        <CopyDetails
          type="original"
        />


        {/* ===================================================
            RIGHT — DUPLICATE / SHOP COPY
        =================================================== */}

        <CopyDetails
          type="duplicate"
        />

      </div>

    </div>

  );

};


export default JewelleryBill;