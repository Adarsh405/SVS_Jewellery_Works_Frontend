import React from "react";
import "./BillCopy.css";

/* HELPERS */

const cleanValue = (value) => {
  if (value === null || value === undefined) return "";
  return String(value).trim();
};

const getNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const formatMoney = (value) =>
  getNumber(value).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

/* WEIGHT */

const getWeight = (item) =>
  getNumber(
    item?.weight ??
      item?.net_weight ??
      item?.netWeight ??
      item?.gross_weight ??
      item?.grossWeight
  );

/* MAKING CHARGES IN GRAMS */

const getMakingCharges = (item) =>
  getNumber(item?.makingCharges ?? item?.making_charges);

/* ITEM TYPE */

const getItemType = (item) =>
  cleanValue(item?.item_type ?? item?.itemType ?? "Silver");

/* GOLD CHECK */

const isGoldItem = (item) => {
  const type = getItemType(item).toLowerCase();

  return (
    type.includes("kdm") ||
    type.includes("hallmark") ||
    type.includes("gold")
  );
};

/* TOTAL WEIGHT */

const getTotalWeight = (item) => {
  if (!isGoldItem(item)) return 0;

  return getWeight(item) + getMakingCharges(item);
};

/* AMOUNT */

const getAmount = (item) =>
  getNumber(
    item?.amount ??
      item?.price ??
      item?.sold_price ??
      item?.soldPrice ??
      item?.total_price ??
      item?.totalPrice
  );

/* ITEM NAME */

const getItemName = (item) =>
  cleanValue(item?.item_name ?? item?.itemName ?? item?.name);

/* ITEM ID */

const getItemId = (item) =>
  cleanValue(item?.item_id ?? item?.itemId ?? item?.id);

/* DATE */

const formatDate = (value) => {
  if (value) {
    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  }

  return new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/* BILL COPY */

const BillCopy = ({
  side = "left",
  copyType,
  customerName = "",
  customerPhone = "",
  address = "",
  billNumber = "",
  invoiceNumber,
  date,
  items = [],
  item,
  discount = 0,
  subtotal,
  total,
}) => {
  /* SIDE */

  const resolvedSide =
    copyType === "original"
      ? "left"
      : copyType === "duplicate"
      ? "right"
      : side;

  const isOriginal = resolvedSide === "left";

  /* ITEMS - MAXIMUM 4 */

  const resolvedItems = (
    Array.isArray(items) ? items : item ? [item] : []
  ).slice(0, 4);

  /* SUBTOTAL */

  const calculatedSubtotal = resolvedItems.reduce(
    (sum, currentItem) =>
      sum +
      getNumber(
        currentItem?.original_amount ??
          currentItem?.originalAmount ??
          currentItem?.price ??
          currentItem?.amount ??
          currentItem?.sold_price
      ),
    0
  );

  const resolvedSubtotal =
    subtotal !== undefined
      ? getNumber(subtotal)
      : calculatedSubtotal;

  /* DISCOUNT */

  const resolvedDiscount = getNumber(discount);
  const showDiscount = resolvedDiscount > 0;

  /* TOTAL */

  const calculatedTotal = resolvedItems.reduce(
    (sum, currentItem) => sum + getAmount(currentItem),
    0
  );

  const resolvedTotal =
    total !== undefined
      ? getNumber(total)
      : Math.max(calculatedTotal, 0);

  /* BILL NUMBER */

  const resolvedBillNumber = cleanValue(
    billNumber || invoiceNumber || "SVS-1000"
  );

  /* DATE */

  const resolvedDate = formatDate(date);

  /* CUSTOMER */

  const displayName = cleanValue(customerName) || "—";
  const displayPhone = cleanValue(customerPhone) || "—";
  const displayAddress = cleanValue(address) || "—";

  /* CHECK FOR GOLD ITEMS */

  const hasGoldItems = resolvedItems.some((currentItem) =>
    isGoldItem(currentItem)
  );

  /* TOTAL GOLD WEIGHT */

  const totalGoldWeight = resolvedItems.reduce(
    (sum, currentItem) => sum + getTotalWeight(currentItem),
    0
  );

  return (
    <div
      className={`bill-copy ${
        isOriginal ? "bill-copy-left" : "bill-copy-right"
      }`}
    >
      <div
        className={`bill-copy-body ${
          isOriginal ? "bill-copy-original" : "bill-copy-shop"
        }`}
      >
        {/* BILL META */}

        <div className="bill-meta-row">
          <div className="bill-meta-box">
            <span className="bill-meta-label">
              Bill No.
            </span>

            <span className="bill-meta-value">
              {resolvedBillNumber}
            </span>
          </div>

          <div className="bill-meta-box bill-date-box">
            <span className="bill-meta-label">
              Date
            </span>

            <span className="bill-meta-value">
              {resolvedDate}
            </span>
          </div>
        </div>

        {/* CUSTOMER DETAILS */}

        <section className="customer-section">
          <div className="section-title">
            Customer Details
          </div>

          <div
            className={`customer-details-grid ${
              resolvedItems.length >= 2
                ? "customer-details-inline"
                : "customer-details-stacked"
            }`}
          >
            <div className="customer-detail customer-name-row">
              <span className="detail-label">
                Name
              </span>

              <span className="detail-value">
                {displayName}
              </span>
            </div>

            <div className="customer-detail customer-mobile-row">
              <span className="detail-label">
                Mobile
              </span>

              <span className="detail-value">
                {displayPhone}
              </span>
            </div>

            <div className="customer-detail customer-address-row">
              <span className="detail-label">
                Address
              </span>

              <span className="detail-value">
                {displayAddress}
              </span>
            </div>
          </div>
        </section>

        {/* ITEMS */}

        <section className="items-section">
          <div className="section-title">
            Item Details
          </div>

          <table
            className={`bill-items-table ${
              hasGoldItems
                ? "has-gold-columns"
                : "silver-only-table"
            }`}
          >
            <colgroup>
              <col className="col-sl" />
              <col className="col-name" />
              <col className="col-type" />
              <col className="col-id" />
              <col className="col-weight" />

              {hasGoldItems && (
                <>
                  <col className="col-making" />
                  <col className="col-total-weight" />
                </>
              )}

              <col className="col-amount" />
            </colgroup>

            <thead>
              <tr>
                <th className="col-sl">Sl No</th>
                <th className="col-name">Name</th>
                <th className="col-type">Type</th>
                <th className="col-id">Item ID</th>
                <th className="col-weight">Weight</th>

                {hasGoldItems && (
                  <>
                    <th className="col-making">
                      Making Charges
                    </th>

                    <th className="col-total-weight">
                      Total Weight
                    </th>
                  </>
                )}

                <th className="col-amount">Amount</th>
              </tr>
            </thead>

            <tbody>
              {resolvedItems.map((currentItem, index) => {
                const goldItem = isGoldItem(currentItem);

                return (
                  <tr
                    key={getItemId(currentItem) || index}
                  >
                    <td className="text-center">
                      {index + 1}
                    </td>

                    <td className="item-name-cell">
                      {getItemName(currentItem) || "—"}
                    </td>

                    <td className="text-center item-type-cell">
                      {getItemType(currentItem) || "—"}
                    </td>

                    <td className="text-center">
                      {getItemId(currentItem) || "—"}
                    </td>

                    <td className="text-center">
                      {getWeight(currentItem).toFixed(3)} g
                    </td>

                    {hasGoldItems && (
                      <>
                        <td className="text-center making-charges-cell">
                          {goldItem
                            ? `${getMakingCharges(
                                currentItem
                              ).toFixed(3)} g`
                            : "---"}
                        </td>

                        <td className="text-center total-weight-cell">
                          {goldItem
                            ? `${getTotalWeight(
                                currentItem
                              ).toFixed(3)} g`
                            : "---"}
                        </td>
                      </>
                    )}

                    <td className="amount-cell text-right">
                      {formatMoney(getAmount(currentItem))}
                    </td>
                  </tr>
                );
              })}

              {/* TABLE TOTAL */}

              <tr className="table-total-row">
                <td
                  colSpan={hasGoldItems ? 6 : 5}
                  className="total-label-cell"
                >
                  {hasGoldItems
                    ? "Total Gold Weight"
                    : "Total"}
                </td>

                {hasGoldItems ? (
                  <>
                    <td className="total-weight-summary text-center">
                      {totalGoldWeight.toFixed(3)} g
                    </td>

                    <td className="grand-total-cell text-right">
                      {formatMoney(resolvedTotal)}
                    </td>
                  </>
                ) : (
                  <td className="grand-total-cell text-right">
                    {formatMoney(resolvedTotal)}
                  </td>
                )}
              </tr>
            </tbody>
          </table>
        </section>

        {/* PRICE SUMMARY */}

        <div className="grand-total-box">
          <div className="bill-total-summary">
            <div className="bill-total-line">
              <span>Subtotal</span>

              <strong>
                {formatMoney(resolvedSubtotal)}
              </strong>
            </div>

            {showDiscount && (
              <div className="bill-total-line bill-discount-line">
                <span>Discount</span>

                <strong>
                  − {formatMoney(resolvedDiscount)}
                </strong>
              </div>
            )}
          </div>

          <div className="bill-final-total">
            <span className="grand-total-label">
              GRAND TOTAL
            </span>

            <strong className="grand-total-value">
              {formatMoney(resolvedTotal)}
            </strong>
          </div>
        </div>

        {/* TWO BLANK PAYMENT SPACES */}

        <div
          className="payment-write-in"
          aria-hidden="true"
        >
          <div className="payment-write-space" />
          <div className="payment-write-space" />
        </div>

        {/* AUTHORIZED SIGNATURE */}

        <div className="signature-section">
          <div className="signature-box">
            <div className="signature-line" />

            <div className="signature-label">
              Authorized Signature
            </div>

            <span className="signature-name">
              K. V. Sathyanarayana
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillCopy;