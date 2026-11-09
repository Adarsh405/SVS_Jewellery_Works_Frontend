import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DueList.css";

const API = "https://svs-jewellery-works-backend.onrender.com/api/dues";

const formatMoney = (amount) =>
    Number(amount || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

function DueList() {
    const [dues, setDues] = useState([]);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState(null);

    const [history, setHistory] = useState([]);
    const [payment, setPayment] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // =================================
    // FETCH DUES
    // =================================

    const fetchDues = async () => {
        try {
            setLoading(true);

            const response = await axios.get(API, {
                withCredentials: true
            });

            setDues(response.data);

        } catch (err) {
            console.error(err);
            setError("Unable to load dues");

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDues();
    }, []);

    // =================================
    // OPEN PAYMENT POPUP
    // =================================

    const openPopup = async (item) => {
        setSelected(item);
        setPayment("");
        setHistory([]);
        setError("");

        try {
            const response = await axios.get(
                `${API}/${item.id}`,
                { withCredentials: true }
            );

            setSelected(response.data.due);
            setHistory(response.data.history);

        } catch (err) {
            setError("Unable to load payment history");
        }
    };

    // =================================
    // CLOSE POPUP
    // =================================

    const closePopup = () => {
        if (saving) return;

        setSelected(null);
        setPayment("");
        setHistory([]);
        setError("");
    };

    // =================================
    // LIVE BALANCE
    // =================================

    const currentBalance = Number(
        selected?.outstanding_amount || 0
    );

    const paidValue = Number(payment || 0);

    const remainingBalance = Math.max(
        0,
        currentBalance -
        (Number.isFinite(paidValue) ? paidValue : 0)
    );

    // =================================
    // SUBMIT PAYMENT
    // =================================

    const submitPayment = async () => {
        if (!selected || saving) return;

        const amount = Number(payment);

        if (!Number.isFinite(amount) || amount <= 0) {
            setError("Enter a valid payment amount");
            return;
        }

        if (amount > currentBalance) {
            setError("Payment cannot exceed outstanding amount");
            return;
        }

        try {
            setSaving(true);
            setError("");

            const response = await axios.post(
                `${API}/${selected.id}/payments`,
                {
                    paid_amount: amount
                },
                {
                    withCredentials: true
                }
            );

            // Update selected customer balance
            setSelected(response.data.due);

            // Refresh payment history
            const details = await axios.get(
                `${API}/${selected.id}`,
                { withCredentials: true }
            );

            setSelected(details.data.due);
            setHistory(details.data.history);

            // Clear input
            setPayment("");

            // Refresh main list
            const list = await axios.get(API, {
                withCredentials: true
            });

            setDues(list.data);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Payment failed"
            );

        } finally {
            setSaving(false);
        }
    };

    // =================================
    // SEARCH
    // =================================

    const filteredDues = dues.filter((item) => {
        const query = search.toLowerCase().trim();

        if (!query) return true;

        return [
            item.invoice_number || "",
            item.english_name || "",
            item.telugu_name || "",
            item.mobile_number || "",
            item.outstanding_amount || "",
            formatMoney(item.outstanding_amount)
        ].some(value =>
            String(value).toLowerCase().includes(query)
        );
    });

    // =================================
    // RENDER
    // =================================

    return (
        <div className="due-page">

            <div className="due-search-container">
                <input
                    type="text"
                    className="due-search"
                    placeholder="Search name, mobile, invoice or amount..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <button
                    className="due-refresh"
                    onClick={fetchDues}
                    title="Refresh"
                >
                    ↻
                </button>
            </div>

            {loading ? (
                <div className="due-message">
                    Loading...
                </div>
            ) : (
                <div className="due-list">

                    {filteredDues.map((item, index) => (
                        <div
                            key={item.id}
                            className={`due-card due-color-${index % 6}`}
                            onClick={() => openPopup(item)}
                        >

                            <div className="due-card-left">
                                <div className="due-invoice">
                                    {item.invoice_number
                                        ? `#${item.invoice_number}`
                                        : "No Inv"}
                                </div>


                                <div className="due-english" title={item.english_name}>
                                    {item.english_name}
                                </div>

                                <div className="due-mobile">
                                    {item.mobile_number}
                                </div>
                                <div className="due-telugu" title={item.telugu_name}>
                                    {item.telugu_name}
                                </div>
                            </div>

                            <div className="due-card-right">
                                <div className="due-label">
                                    OUTSTANDING
                                </div>

                                <div className="due-amount">
                                    ₹{formatMoney(
                                        item.outstanding_amount
                                    )}
                                </div>
                            </div>

                        </div>
                    ))}

                    {filteredDues.length === 0 && (
                        <div className="due-message">
                            No dues found
                        </div>
                    )}

                </div>
            )}

            {/* PAYMENT POPUP */}

            {selected && (
                <div
                    className="due-modal-overlay"
                    onClick={closePopup}
                >

                    <div
                        className="due-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <button
                            className="due-close"
                            onClick={closePopup}
                        >
                            ×
                        </button>

                        <div className="popup-telugu-name">
                            {selected.telugu_name}
                        </div>

                        <div className="popup-english-name">
                            {selected.english_name}
                        </div>

                        <div className="popup-mobile">
                            {selected.mobile_number}
                        </div>

                        <div className="popup-balance">
                            <div className="popup-balance-label">
                                OUTSTANDING BALANCE
                            </div>

                            <div className="popup-balance-amount">
                                ₹{formatMoney(currentBalance)}
                            </div>
                        </div>

                        {currentBalance > 0 && (
                            <div className="payment-section">

                                <label>
                                    ENTER PAID AMOUNT
                                </label>

                                <input
                                    type="number"
                                    className="payment-input"
                                    placeholder="₹ 0.00"
                                    min="0"
                                    max={currentBalance}
                                    step="0.01"
                                    value={payment}
                                    disabled={saving}
                                    onChange={(e) => {
                                        setPayment(e.target.value);
                                        setError("");
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            submitPayment();
                                        }
                                    }}
                                    autoFocus
                                />

                                <div className="live-balance">
                                    <span>Remaining Balance</span>

                                    <strong>
                                        ₹{formatMoney(
                                            remainingBalance
                                        )}
                                    </strong>
                                </div>

                                <button
                                    className="payment-submit"
                                    onClick={submitPayment}
                                    disabled={
                                        saving ||
                                        !payment ||
                                        paidValue <= 0 ||
                                        paidValue > currentBalance
                                    }
                                >
                                    {saving
                                        ? "Saving..."
                                        : "ADD PAYMENT"}
                                </button>

                            </div>
                        )}

                        {currentBalance === 0 && (
                            <div className="due-cleared">
                                ✓ FULLY PAID
                            </div>
                        )}

                        {error && (
                            <div className="due-error">
                                {error}
                            </div>
                        )}

                        {/* PAYMENT HISTORY */}

                        <div className="payment-history">

                            <div className="history-title">
                                PAYMENT HISTORY
                            </div>

                            {history.length === 0 ? (
                                <div className="history-empty">
                                    No payments yet
                                </div>
                            ) : (
                                history.map((item) => (
                                    <div
                                        className="history-row"
                                        key={item.id}
                                    >

                                        <div className="history-date">
                                            {new Date(
                                                item.payment_date
                                            ).toLocaleString("en-IN", {
                                                dateStyle: "medium",
                                                timeStyle: "short"
                                            })}
                                        </div>

                                        <div className="history-amount">
                                            + ₹{formatMoney(
                                                item.paid_amount
                                            )}
                                        </div>

                                    </div>
                                ))
                            )}

                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}

export default DueList;