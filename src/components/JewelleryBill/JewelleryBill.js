import React, { useEffect } from "react";
import "./JewelleryBill.css";

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
      Number(String(value ?? "0").replace(/,/g, "").trim()) || 0
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
  // COPY DETAILS
  // =========================================================

  const CopyDetails = ({ type }) => {
    return (
      <div className={`copy-details ${type}`}>

        {/* ==============================
            HEADER DETAILS
        ============================== */}

        <div className="detail bill-number">
          {billNo || ""}
        </div>

        <div className="detail bill-date">
          {date || ""}
        </div>

        <div className="detail customer-name">
          {customerName || ""}
        </div>

        <div className="detail customer-mobile">
          {customerMobile || ""}
        </div>

        <div className="detail payment-mode">
          {paymentMode || ""}
        </div>

        {/* ==============================
            ITEMS
        ============================== */}

        <div className="items-area">

          {items.slice(0, 8).map((item, index) => {
            const silver = isSilverItem(item);

            return (
              <div
                className="print-item"
                key={item?.id || index}
              >
                <span className="sno">
                  {index + 1}
                </span>

                <span className="item-name">
                  {item?.itemName || ""}
                </span>

                <span className="category">
                  {item?.category || ""}
                </span>

                <span className="weight">
                  {item?.weight ?? ""}
                </span>

                <span className="charges">
                  {silver
                    ? ""
                    : item?.charges ?? ""}
                </span>

                <span className="price">
                  {item?.totalPrice ?? ""}
                </span>
              </div>
            );
          })}

        </div>

        {/* ==============================
            TOTAL WEIGHT
        ============================== */}

        <div className="detail total-weight">
          {totalWeight.toFixed(3)}
        </div>

        {/* ==============================
            GRAND TOTAL
        ============================== */}

        <div className="detail grand-total">
          ₹ {formatMoney(grandTotal)}
        </div>
      </div>
    );
  };

  // =========================================================
  // SCREEN
  // =========================================================

  return (
    <div className="jewellery-bill-page">

      {/* ============================================
          SCREEN ONLY
      ============================================ */}

      <div className="bill-toolbar no-print">

        <div>
          <h3>SVS Jewellery Bill</h3>

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

      {/* ============================================
          PRINT PAGE
      ============================================ */}

      <div className="print-page">

        {/* REAL IMAGE - NOT BACKGROUND */}
        <img
          src={billTemplate}
          alt="SVS Jewellery Bill Template"
          className="bill-template-image"
        />

        {/* DATA OVER ORIGINAL */}
        <CopyDetails type="original" />

        {/* DATA OVER DUPLICATE */}
        <CopyDetails type="duplicate" />

      </div>

    </div>
  );
};

export default JewelleryBill;