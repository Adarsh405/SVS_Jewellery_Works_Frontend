import React, { useEffect } from "react";
import "./JewelleryBill.css";

const JewelleryBill = ({
  billNo,
  date,
  customerName,
  customerMobile,
  paymentMode,
  items = [],
  onClose,
}) => {
  // ==========================================
  // NUMBER CLEANER
  // ==========================================

  const cleanNumber = (value) => {
    return Number(String(value ?? "0").replace(/,/g, "")) || 0;
  };

  // ==========================================
  // MONEY FORMAT
  // ==========================================

  const formatMoney = (value) => {
    return cleanNumber(value).toLocaleString("en-IN");
  };

  // ==========================================
  // TOTAL WEIGHT
  // ==========================================

  const totalWeight = items.reduce(
    (sum, item) => sum + cleanNumber(item.weight),
    0
  );

  // ==========================================
  // GRAND TOTAL
  // ==========================================

  const grandTotal = items.reduce(
    (sum, item) => sum + cleanNumber(item.totalPrice),
    0
  );

  // ==========================================
  // CHECK SILVER ITEM
  // ==========================================

  const isSilverItem = (item) => {
    const category = String(item?.category || "").toLowerCase();

    const itemType = String(item?.itemType || "").toLowerCase();

    return (
      category.includes("silver") ||
      itemType.includes("silver")
    );
  };

  // ==========================================
  // PRINT
  // ==========================================

  const printBill = () => {
    window.print();
  };

  // ==========================================
  // ENTER = PRINT
  // ESC = CLOSE
  // ==========================================

  useEffect(() => {
    const handleKeyDown = (event) => {
      // ENTER → PRINT
      if (event.key === "Enter") {
        event.preventDefault();
        printBill();
      }

      // ESC → CLOSE
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

  // ==========================================
  // BILL COPY
  // ==========================================

  const BillCopy = ({ copyType }) => {
    return (
      <div className={`bill-copy ${copyType}`}>

        {/* ==================================
            BILL NUMBER
        ================================== */}

        <div className="field bill-no">
          {billNo || ""}
        </div>

        {/* ==================================
            DATE
        ================================== */}

        <div className="field bill-date">
          {date || ""}
        </div>

        {/* ==================================
            CUSTOMER NAME
        ================================== */}

        <div className="field customer-name">
          {customerName || ""}
        </div>

        {/* ==================================
            CUSTOMER MOBILE
        ================================== */}

        <div className="field customer-mobile">
          {customerMobile || ""}
        </div>

        {/* ==================================
            PAYMENT MODE
        ================================== */}

        <div className="field payment-mode">
          {paymentMode || ""}
        </div>

        {/* ==================================
            ITEMS
        ================================== */}

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

                {/* PRICE */}

                <div className="item-price">
                  {item.totalPrice ?? ""}
                </div>

              </div>
            );
          })}

        </div>

        {/* ==================================
            TOTAL WEIGHT
        ================================== */}

        <div className="field total-weight">
          {totalWeight.toFixed(3)}
        </div>

        {/* ==================================
            GRAND TOTAL
        ================================== */}

        <div className="field grand-total">
          ₹ {formatMoney(grandTotal)}
        </div>

      </div>
    );
  };

  // ==========================================
  // MAIN
  // ==========================================

  return (
    <div className="jewellery-bill-page">

      {/* ======================================
          SCREEN TOOLBAR
      ====================================== */}

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

          {/* PRINT */}

          <button
            type="button"
            onClick={printBill}
          >
            🖨 Print Bill
          </button>

          {/* CLOSE */}

          <button
            type="button"
            className="bill-close-button"
            onClick={onClose}
          >
            Close
          </button>

        </div>

      </div>

      {/* ======================================
          A4 PAPER
      ====================================== */}

      <div className="a4-paper">

        {/* ORIGINAL CUSTOMER COPY */}

        <BillCopy
          copyType="original"
        />

        {/* DUPLICATE SHOP COPY */}

        <BillCopy
          copyType="duplicate"
        />

      </div>

    </div>
  );
};

export default JewelleryBill;