import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddItem.css";

const API_URL = "https://svs-jewellery-backend.onrender.com";

const AddItem = () => {
  const navigate = useNavigate();

  const [itemType, setItemType] = useState("KDM");
  const idInputRef = useRef(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    itemType: "",
    netWeight: "",
    charges: "",
    makingCost: "",
    weight: ""
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ==========================================
  // CHANGE ITEM TYPE
  // ==========================================

  const handleTypeChange = (type) => {
    setItemType(type);

    setFormData({
      id: "",
      name: "",
      itemType: "",
      netWeight: "",
      charges: "",
      makingCost: "",
      weight: ""
    });

    setMessage("");
    setError("");
  };

  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // ==========================================
  // ID VALIDATION
  // ==========================================

  const validateId = () => {
    const id = Number(formData.id);

    if (!Number.isInteger(id)) {
      return "Item ID must be a whole number.";
    }

    if (
      itemType === "Silver" &&
      (id < 1000 || id > 4999)
    ) {
      return "Silver Item ID must be between 1000 and 4999.";
    }

    if (
      itemType === "KDM" &&
      (id < 5000 || id > 8999)
    ) {
      return "KDM Item ID must be between 5000 and 8999.";
    }

    if (
      itemType === "Hallmark" &&
      (id < 9000 || id > 9999)
    ) {
      return "Hallmark Item ID must be between 9000 and 9999.";
    }

    return "";
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const idError = validateId();

    if (idError) {
      setError(idError);
      return;
    }

    if (!formData.name.trim()) {
      setError("Please enter item name.");
      return;
    }

    if (!formData.itemType) {
      setError("Please select item type.");
      return;
    }

    if (!formData.makingCost) {
      setError("Please enter making cost.");
      return;
    }

    if (
      (itemType === "KDM" ||
        itemType === "Hallmark") &&
      (!formData.netWeight || !formData.charges)
    ) {
      setError(
        "Please enter net weight and charges."
      );
      return;
    }

    if (
      itemType === "Silver" &&
      !formData.weight
    ) {
      setError("Please enter silver weight.");
      return;
    }

    let endpoint = "";
    let body = {};

    // ==========================================
    // KDM
    // ==========================================

    if (itemType === "KDM") {
      endpoint = "/api/kdm";

      body = {
        id: Number(formData.id),
        name: formData.name.trim(),
        itemType: formData.itemType,
        netWeight: Number(formData.netWeight),
        charges: Number(formData.charges),
        makingCost: Number(formData.makingCost),
        status: "available"
      };
    }

    // ==========================================
    // HALLMARK
    // ==========================================

    if (itemType === "Hallmark") {
      endpoint = "/api/hallmark";

      body = {
        id: Number(formData.id),
        name: formData.name.trim(),
        itemType: formData.itemType,
        netWeight: Number(formData.netWeight),
        charges: Number(formData.charges),
        makingCost: Number(formData.makingCost),
        status: "available"
      };
    }

    // ==========================================
    // SILVER
    // ==========================================

    if (itemType === "Silver") {
      endpoint = "/api/silver";

      body = {
        id: Number(formData.id),
        name: formData.name.trim(),
        itemType: formData.itemType,
        weight: Number(formData.weight),
        makingCost: Number(formData.makingCost),
        status: "available"
      };
    }

    // ==========================================
    // API REQUEST
    // ==========================================

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}${endpoint}`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          credentials: "include",

          body: JSON.stringify(body)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to add item"
        );
      }

      setMessage(
        `${itemType} item added successfully.`
      );

      setFormData({
        id: "",
        name: "",
        itemType: "",
        netWeight: "",
        charges: "",
        makingCost: "",
        weight: ""
      });

    } catch (error) {
      setError(error.message);

    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const handleSlashKey = (event) => {
      if (event.key === "/") {
        event.preventDefault();
        idInputRef.current?.focus();
      }
    };
  
    window.addEventListener("keydown", handleSlashKey);
  
    return () => {
      window.removeEventListener("keydown", handleSlashKey);
    };
  }, []);
  return (
    <div className="add-item-page">

      <div className="add-item-card">

        {/* ======================================
            HEADER
        ====================================== */}

        <div className="form-header">

          <div className="header-icon">
            ✦
          </div>

          <div>
            <h1>
              Add Jewellery Item
            </h1>

            <p>
              Add a new item to your jewellery inventory
            </p>
          </div>

        </div>


        {/* ======================================
            TYPE SELECTION
        ====================================== */}

        <div className="type-selector">

          {/* KDM */}

          <button
            type="button"
            className={
              itemType === "KDM"
                ? "type-btn active"
                : "type-btn"
            }
            onClick={() =>
              handleTypeChange("KDM")
            }
          >

            <span>♢</span>

            <div>
              <strong>KDM</strong>

              <small>
                5000 – 8999
              </small>
            </div>

          </button>


          {/* HALLMARK */}

          <button
            type="button"
            className={
              itemType === "Hallmark"
                ? "type-btn active"
                : "type-btn"
            }
            onClick={() =>
              handleTypeChange("Hallmark")
            }
          >

            <span>◇</span>

            <div>
              <strong>
                Hallmark
              </strong>

              <small>
                9000 – 9999
              </small>
            </div>

          </button>


          {/* SILVER */}

          <button
            type="button"
            className={
              itemType === "Silver"
                ? "type-btn active"
                : "type-btn"
            }
            onClick={() =>
              handleTypeChange("Silver")
            }
          >

            <span>◈</span>

            <div>
              <strong>
                Silver
              </strong>

              <small>
                1000 – 4999
              </small>
            </div>

          </button>


          {/* ==================================
              RATES
          ================================== */}

          <button
            type="button"
            className="type-btn rates-btn"
            onClick={() =>
              navigate("/Rates")
            }
          >

            <span>₹</span>

            <div>
              <strong>
                Rates
              </strong>

              <small>
                Gold & Silver Rates
              </small>
            </div>

          </button>

        </div>


        {/* ======================================
            FORM
        ====================================== */}

        <form onSubmit={handleSubmit}>

          {/* BASIC INFORMATION */}

          <div className="form-section">

            <div className="section-title">

              <span>
                01
              </span>

              Basic Information

            </div>


            <div className="input-grid">

              {/* ITEM ID */}

              <div className="input-group">

                <label>
                  Item ID
                </label>

                <input
                  type="number"
                  name="id"
                  ref={idInputRef}
                  value={formData.id}
                  onChange={handleChange}
                  placeholder={
                    itemType === "Silver"
                      ? "1000 - 4999"
                      : itemType === "KDM"
                      ? "5000 - 8999"
                      : "9000 - 9999"
                  }
                />

                <small className="input-hint">
                  {itemType} ID range
                </small>

              </div>


              {/* ITEM NAME */}

              <div className="input-group">

                <label>
                  Item Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Gold Necklace"
                />

              </div>

            </div>


            {/* ITEM TYPE */}

            <div className="input-group">

              <label>
                Item Type
              </label>

              <select
                name="itemType"
                value={formData.itemType}
                onChange={handleChange}
                required
              >

                <option value="">
                  Select item type
                </option>

                <option value="KDM">
                  KDM
                </option>

                <option value="HallMark">
                  HallMark
                </option>

                <option value="Silver">
                  Silver
                </option>

              </select>

            </div>

          </div>


          {/* ======================================
              ITEM DETAILS
          ====================================== */}

          <div className="form-section">

            <div className="section-title">

              <span>
                02
              </span>

              {itemType === "Silver"
                ? "Silver Details"
                : "Gold Details"}

            </div>


            {/* SILVER */}

            {itemType === "Silver" ? (

              <div className="input-grid">

                <div className="input-group">

                  <label>
                    Weight
                  </label>

                  <div className="input-with-unit">

                    <input
                      type="number"
                      step="0.001"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      placeholder="125.800"
                    />

                    <span>
                      g
                    </span>

                  </div>

                </div>


                <div className="input-group">

                  <label>
                    Making Cost
                  </label>

                  <div className="input-with-unit">

                    <input
                      type="number"
                      step="0.01"
                      name="makingCost"
                      value={formData.makingCost}
                      onChange={handleChange}
                      placeholder="700"
                    />

                    <span>
                      ₹
                    </span>

                  </div>

                </div>

              </div>

            ) : (

              /* GOLD */

              <div className="input-grid">

                <div className="input-group">

                  <label>
                    Net Weight
                  </label>

                  <div className="input-with-unit">

                    <input
                      type="number"
                      step="0.001"
                      name="netWeight"
                      value={formData.netWeight}
                      onChange={handleChange}
                      placeholder="18.500"
                    />

                    <span>
                      g
                    </span>

                  </div>

                </div>


                <div className="input-group">

                  <label>
                    Charges
                  </label>

                  <div className="input-with-unit">

                    <input
                      type="number"
                      step="0.001"
                      name="charges"
                      value={formData.charges}
                      onChange={handleChange}
                      placeholder="1.850"
                    />

                    <span>
                      g
                    </span>

                  </div>

                </div>


                <div className="input-group">

                  <label>
                    Making Cost
                  </label>

                  <div className="input-with-unit">

                    <input
                      type="number"
                      step="0.01"
                      name="makingCost"
                      value={formData.makingCost}
                      onChange={handleChange}
                      placeholder="500"
                    />

                    <span>
                      ₹
                    </span>

                  </div>

                </div>

              </div>

            )}

          </div>


          {/* ======================================
              MESSAGES
          ====================================== */}

          {message && (

            <div className="success-message">
              ✓ {message}
            </div>

          )}


          {error && (

            <div className="error-message">
              ! {error}
            </div>

          )}


          {/* ======================================
              FOOTER
          ====================================== */}

          <div className="form-footer">

            <div className="status-display">

              <span className="status-dot"></span>

              Status:
              <strong>
                Available
              </strong>

            </div>


            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >

              {loading ? (

                "Adding..."

              ) : (

                <>
                  Add {itemType} Item

                  <span>
                    →
                  </span>
                </>

              )}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default AddItem;
