import React, { useEffect } from "react";
import "./JewelleryBill.css";

// IMPORTANT:
// Put svs-bill.png in the same folder as JewelleryBill.js
import billTemplate from "./svs-bill.png";

const JewelleryBill = ({
  billNo,
  date,
  customerName,
  customerMobile,
  paymentMode,
  items = [],
  onClose,
}) => {
  // =========================================================
  // NUMBER CLEANER
  // =========================================================

  const cleanNumber = (value) => {
    return (
      Number(
        String(value ?? "0")
          .replace(/,/g, "")
          .replace(/[₹]/g, "")
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
    (sum, item) => sum + cleanNumber(item.weight),
    0
  );

  // =========================================================
  // GRAND TOTAL
  // =========================================================

  const grandTotal = items.reduce(
    (sum, item) => sum + cleanNumber(item.totalPrice),
    0
  );

  // =========================================================
  // SILVER CHECK
  // =========================================================

  const isSilverItem = (item) => {
    const category = String(item?.category || "").toLowerCase();
    const itemType = String(item?.itemType || "").toLowerCase();

    return (
      category.includes("silver") ||
      itemType.includes("silver")
    );
  };

  // =========================================================
  // PRINT
  // =========================================================

  const printBill = () => {
    window.print();
  };

  // =========================================================
  // KEYBOARD
  // ENTER = PRINT
  // ESC = CLOSE
  // =========================================================

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        printBill();
      }

      if (event.key === "Escape") {
        event.preventDefault();

        if (onClose) {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // =========================================================
  // BILL DETAILS
  // =========================================================

  const BillDetails = ({ copyType }) => {
    return (
      <div className={`bill-details ${copyType}`}>

        {/* ============================================
            BILL NUMBER
        ============================================ */}

        <div className="print-field bill-no">
          {billNo || ""}
        </div>

        {/* ============================================
            DATE
        ============================================ */}

        <div className="print-field bill-date">
          {date || ""}
        </div>

        {/* ============================================
            CUSTOMER NAME
        ============================================ */}

        <div className="print-field customer-name">
          {customerName || ""}
        </div>

        {/* ============================================
            MOBILE
        ============================================ */}

        <div className="print-field customer-mobile">
          {customerMobile || ""}
        </div>

        {/* ============================================
            PAYMENT MODE
        ============================================ */}

        <div className="print-field payment-mode">
          {paymentMode || ""}
        </div>

        {/* ============================================
            ITEMS
        ============================================ */}

        <div className="items-container">

          {items.slice(0, 8).map((item, index) => {
            const silver = isSilverItem(item);

            return (
              <div
                className="item-row"
                key={item.id || index}
              >

                {/* S.NO */}

                <div className="item-sno">
                  {index + 1}
                </div>

                {/* ITEM NAME */}

                <div className="item-name">
                  {item.itemName || ""}
                </div>

                {/* CATEGORY */}

                <div className="item-category">
                  {item.category || ""}
                </div>

                {/* WEIGHT */}

                <div className="item-weight">
                  {item.weight ?? ""}
                </div>

                {/* CHARGES */}

                <div className="item-charges">
                  {silver
                    ? ""
                    : item.charges !== undefined &&
                      item.charges !== null &&
                      item.charges !== ""
                    ? item.charges
                    : ""}
                </div>

                {/* TOTAL PRICE */}

                <div className="item-price">
                  {item.totalPrice !== undefined &&
                  item.totalPrice !== null &&
                  item.totalPrice !== ""
                    ? formatMoney(item.totalPrice)
                    : ""}
                </div>

              </div>
            );
          })}

        </div>

        {/* ============================================
            TOTAL WEIGHT
        ============================================ */}

        <div className="print-field total-weight">
          {totalWeight.toFixed(3)}
        </div>

        {/* ============================================
            GRAND TOTAL
        ============================================ */}

        <div className="print-field grand-total">
          ₹ {formatMoney(grandTotal)}
        </div>

      </div>
    );
  };

  // =========================================================
  // MAIN
  // =========================================================

  return (
    <div className="jewellery-bill-page">

      {/* =====================================================
          SCREEN TOOLBAR
          NEVER PRINT
      ===================================================== */}

      <div className="bill-toolbar no-print">

        <div className="bill-toolbar-title">

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
            className="print-button"
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
          PRINT AREA

          ONE IMAGE CONTAINS:
          ORIGINAL + DUPLICATE

          IMAGE IS ONLY FOR SCREEN PREVIEW.
          IT WILL NOT PRINT.
      ===================================================== */}

      <div className="bill-preview-wrapper">

        <div
          className="print-sheet"
          style={{
            backgroundImage: `url(${billTemplate})`,
          }}
        >

          {/* =================================================
              LEFT SIDE = ORIGINAL
          ================================================= */}

          <BillDetails copyType="original" />

          {/* =================================================
              RIGHT SIDE = DUPLICATE
          ================================================= */}

          <BillDetails copyType="duplicate" />

        </div>

      </div>

    </div>
  );
};

export default JewelleryBill;