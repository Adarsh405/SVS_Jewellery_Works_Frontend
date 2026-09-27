import React, { Component } from "react";
import axios from "axios";
import Sanscript from "@indic-transliteration/sanscript";

import {
  FiPlus,
  FiSearch,
  FiEdit3,
  FiX,
  FiUser,
  FiPhone,
  FiMapPin,
  FiType,
  FiUsers,
  FiSave,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

import "./Customers.css";

const API_URL =
  "https://svs-jewellery-works-backend.onrender.com/api/customers";

class Customers extends Component {
  state = {
    customers: [],
    filteredCustomers: [],

    loading: true,
    saving: false,

    showModal: false,
    editingCustomer: null,

    search: "",

    form: {
      customer_name: "",
      mobile_number: "",
      address: "",
      telugu_name: "",
    },

    error: "",
    success: "",

    transliterating: false,
  };

  componentDidMount() {
    this.fetchCustomers();
  }

  /* =========================================================
     FETCH CUSTOMERS
  ========================================================= */

  fetchCustomers = async () => {
    try {
      this.setState({
        loading: true,
        error: "",
      });

      const response = await axios.get(API_URL);

      const customers = response.data?.customers || [];

      this.setState(
        {
          customers,
          filteredCustomers: customers,
          loading: false,
        },
        this.filterCustomers
      );
    } catch (error) {
      console.error("Fetch customers error:", error);

      this.setState({
        loading: false,
        error:
          error.response?.data?.message ||
          "Unable to load customers. Please try again.",
      });
    }
  };

  /* =========================================================
     SEARCH
  ========================================================= */

  handleSearch = (event) => {
    const search = event.target.value;

    this.setState(
      {
        search,
      },
      this.filterCustomers
    );
  };

  filterCustomers = () => {
    const { customers, search } = this.state;

    const value = search.trim().toLowerCase();

    if (!value) {
      this.setState({
        filteredCustomers: customers,
      });

      return;
    }

    const filtered = customers.filter((customer) => {
      return (
        String(customer.customer_name || "")
          .toLowerCase()
          .includes(value) ||
        String(customer.telugu_name || "")
          .toLowerCase()
          .includes(value) ||
        String(customer.mobile_number || "")
          .toLowerCase()
          .includes(value) ||
        String(customer.address || "")
          .toLowerCase()
          .includes(value)
      );
    });

    this.setState({
      filteredCustomers: filtered,
    });
  };

  /* =========================================================
     OPEN ADD MODAL
  ========================================================= */

  openAddModal = () => {
    this.setState({
      showModal: true,
      editingCustomer: null,

      form: {
        customer_name: "",
        mobile_number: "",
        address: "",
        telugu_name: "",
      },

      error: "",
      success: "",
    });
  };

  /* =========================================================
     OPEN EDIT MODAL
  ========================================================= */

  openEditModal = (customer) => {
    this.setState({
      showModal: true,
      editingCustomer: customer,

      form: {
        customer_name: customer.customer_name || "",
        mobile_number: customer.mobile_number || "",
        address: customer.address || "",
        telugu_name: customer.telugu_name || "",
      },

      error: "",
      success: "",
    });
  };

  /* =========================================================
     CLOSE MODAL
  ========================================================= */

  closeModal = () => {
    if (this.state.saving) return;

    this.setState({
      showModal: false,
      editingCustomer: null,
      error: "",
      success: "",
    });
  };

  /* =========================================================
     FORM INPUT
  ========================================================= */

  handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "mobile_number") {
      const onlyNumbers = value.replace(/\D/g, "");

      if (onlyNumbers.length <= 10) {
        this.setState({
          form: {
            ...this.state.form,
            [name]: onlyNumbers,
          },
        });
      }

      return;
    }

    this.setState({
      form: {
        ...this.state.form,
        [name]: value,
      },
    });
  };

  /* =========================================================
     TELUGU TRANSLITERATION
     
     Example:
     Kothagattu Adarsh
     ↓
     తెలుగు phonetic output
  ========================================================= */

  transliterateTelugu = () => {
    const { customer_name } = this.state.form;

    if (!customer_name.trim()) {
      this.setState({
        error: "Enter customer name first.",
      });

      return;
    }

    try {
      this.setState({
        transliterating: true,
        error: "",
      });

      const telugu = Sanscript.t(
        customer_name,
        "itrans",
        "telugu",
        {
          syncope: true,
        }
      );

      this.setState({
        form: {
          ...this.state.form,
          telugu_name: telugu,
        },

        transliterating: false,
      });
    } catch (error) {
      console.error("Transliteration error:", error);

      this.setState({
        transliterating: false,
        error:
          "Unable to convert automatically. You can type Telugu manually.",
      });
    }
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  handleSubmit = async (event) => {
    event.preventDefault();

    const {
      customer_name,
      mobile_number,
      address,
      telugu_name,
    } = this.state.form;

    const { editingCustomer } = this.state;

    /* -----------------------------------------
       VALIDATION
    ----------------------------------------- */

    if (!customer_name.trim()) {
      this.setState({
        error: "Please enter customer name.",
      });

      return;
    }

    if (!mobile_number.trim()) {
      this.setState({
        error: "Please enter mobile number.",
      });

      return;
    }

    if (mobile_number.length !== 10) {
      this.setState({
        error: "Mobile number must contain 10 digits.",
      });

      return;
    }

    if (!address.trim()) {
      this.setState({
        error: "Please enter address.",
      });

      return;
    }

    try {
      this.setState({
        saving: true,
        error: "",
        success: "",
      });

      const payload = {
        customer_name: customer_name.trim(),
        mobile_number: mobile_number.trim(),
        address: address.trim(),
        telugu_name: telugu_name.trim(),
      };

      /* -----------------------------------------
         EDIT CUSTOMER
      ----------------------------------------- */

      if (editingCustomer) {
        await axios.put(
          `${API_URL}/${editingCustomer.id}`,
          payload
        );

        this.setState({
          success: "Customer updated successfully.",
        });
      }

      /* -----------------------------------------
         ADD CUSTOMER
      ----------------------------------------- */

      else {
        await axios.post(API_URL, payload);

        this.setState({
          success: "Customer added successfully.",
        });
      }

      /* -----------------------------------------
         REFRESH LIST
      ----------------------------------------- */

      await this.fetchCustomers();

      setTimeout(() => {
        this.setState({
          showModal: false,
          editingCustomer: null,
          success: "",
        });
      }, 900);
    } catch (error) {
      console.error("Save customer error:", error);

      this.setState({
        saving: false,
        error:
          error.response?.data?.message ||
          "Unable to save customer. Please try again.",
      });

      return;
    }

    this.setState({
      saving: false,
    });
  };

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  formatDate = (date) => {
    if (!date) return "-";

    try {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  render() {
    const {
      filteredCustomers,
      customers,
      loading,
      showModal,
      editingCustomer,
      search,
      form,
      saving,
      error,
      success,
      transliterating,
    } = this.state;

    return (
      <div className="customers-page">

        {/* =====================================================
            BACKGROUND EFFECTS
        ===================================================== */}

        <div className="customer-orb customer-orb-one"></div>
        <div className="customer-orb customer-orb-two"></div>
        <div className="customer-grid"></div>

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="customers-header">

          <div className="customers-title-section">

            <div className="customers-title-icon">
              <FiUsers />
            </div>

            <div>
              <div className="customers-small-title">
                SVS JEWELLERY
              </div>

              <h1>Customers</h1>

              <p>
                Manage your customer information beautifully
              </p>
            </div>

          </div>

          <button
            className="add-customer-btn"
            onClick={this.openAddModal}
          >
            <FiPlus />
            <span>Add Customer</span>
          </button>

        </div>

        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <div className="customer-stats">

          <div className="customer-stat-card">

            <div className="stat-icon">
              <FiUsers />
            </div>

            <div>
              <span>Total Customers</span>
              <strong>{customers.length}</strong>
            </div>

          </div>

          <div className="customer-stat-card">

            <div className="stat-icon">
              <FiSearch />
            </div>

            <div>
              <span>Search Results</span>
              <strong>{filteredCustomers.length}</strong>
            </div>

          </div>

        </div>

        {/* =====================================================
            SEARCH
        ===================================================== */}

        <div className="customer-search-container">

          <FiSearch className="customer-search-icon" />

          <input
            type="text"
            placeholder="Search customer name, Telugu name, mobile or address..."
            value={search}
            onChange={this.handleSearch}
          />

          {search && (
            <button
              className="clear-search"
              onClick={() =>
                this.setState(
                  {
                    search: "",
                  },
                  this.filterCustomers
                )
              }
            >
              <FiX />
            </button>
          )}

        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && !showModal && (
          <div className="customer-alert customer-alert-error">
            <FiAlertCircle />
            <span>{error}</span>
          </div>
        )}

        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading ? (
          <div className="customer-loading">

            <div className="customer-spinner"></div>

            <p>Loading customers...</p>

          </div>
        ) : filteredCustomers.length === 0 ? (

          /* ===================================================
             EMPTY
          =================================================== */

          <div className="customer-empty">

            <div className="empty-icon">
              <FiUsers />
            </div>

            <h2>
              {search
                ? "No customers found"
                : "No customers yet"}
            </h2>

            <p>
              {search
                ? "Try another search."
                : "Add your first customer to get started."}
            </p>

            {!search && (
              <button
                className="empty-add-btn"
                onClick={this.openAddModal}
              >
                <FiPlus />
                Add Customer
              </button>
            )}

          </div>

        ) : (

          /* ===================================================
             CUSTOMER GRID
          =================================================== */

          <div className="customers-grid">

            {filteredCustomers.map((customer, index) => (

              <div
                className="customer-card"
                key={customer.id}
                style={{
                  "--delay": `${index * 70}ms`,
                }}
              >

                <div className="customer-card-top">

                  <div className="customer-avatar">
                    {customer.customer_name
                      ? customer.customer_name
                          .charAt(0)
                          .toUpperCase()
                      : "C"}
                  </div>

                  <button
                    className="customer-edit-btn"
                    onClick={() =>
                      this.openEditModal(customer)
                    }
                    title="Edit customer"
                  >
                    <FiEdit3 />
                  </button>

                </div>

                <div className="customer-card-body">

                  <h2>
                    {customer.customer_name}
                  </h2>

                  {customer.telugu_name && (
                    <div className="customer-telugu-name">
                      {customer.telugu_name}
                    </div>
                  )}

                  <div className="customer-info-row">

                    <div className="info-icon">
                      <FiPhone />
                    </div>

                    <div>
                      <small>Mobile Number</small>
                      <strong>
                        {customer.mobile_number}
                      </strong>
                    </div>

                  </div>

                  <div className="customer-info-row">

                    <div className="info-icon">
                      <FiMapPin />
                    </div>

                    <div>
                      <small>Address</small>
                      <strong>
                        {customer.address || "Not provided"}
                      </strong>
                    </div>

                  </div>

                </div>

                <div className="customer-card-footer">

                  <span>
                    Customer #{customer.id}
                  </span>

                  <span>
                    {this.formatDate(customer.created_at)}
                  </span>

                </div>

              </div>

            ))}

          </div>

        )}

        {/* =====================================================
            MODAL
        ===================================================== */}

        {showModal && (

          <div
            className="customer-modal-overlay"
            onMouseDown={(event) => {
              if (
                event.target.className ===
                "customer-modal-overlay"
              ) {
                this.closeModal();
              }
            }}
          >

            <div className="customer-modal">

              {/* Modal Header */}

              <div className="customer-modal-header">

                <div className="modal-heading">

                  <div className="modal-icon">
                    {editingCustomer ? (
                      <FiEdit3 />
                    ) : (
                      <FiPlus />
                    )}
                  </div>

                  <div>
                    <span>
                      {editingCustomer
                        ? "CUSTOMER MANAGEMENT"
                        : "NEW CUSTOMER"}
                    </span>

                    <h2>
                      {editingCustomer
                        ? "Edit Customer"
                        : "Add Customer"}
                    </h2>
                  </div>

                </div>

                <button
                  className="modal-close-btn"
                  onClick={this.closeModal}
                  disabled={saving}
                >
                  <FiX />
                </button>

              </div>

              {/* Modal Body */}

              <form
                className="customer-form"
                onSubmit={this.handleSubmit}
              >

                {/* Error */}

                {error && (
                  <div className="customer-alert customer-alert-error">
                    <FiAlertCircle />
                    <span>{error}</span>
                  </div>
                )}

                {/* Success */}

                {success && (
                  <div className="customer-alert customer-alert-success">
                    <FiCheckCircle />
                    <span>{success}</span>
                  </div>
                )}

                {/* =================================================
                    CUSTOMER NAME
                ================================================= */}

                <div className="form-group">

                  <label>
                    <FiUser />
                    Customer Name
                  </label>

                  <div className="input-wrapper">

                    <FiUser />

                    <input
                      type="text"
                      name="customer_name"
                      value={form.customer_name}
                      onChange={this.handleChange}
                      placeholder="Enter customer name"
                      autoComplete="off"
                      autoFocus
                    />

                  </div>

                </div>

                {/* =================================================
                    TELUGU NAME
                ================================================= */}

                <div className="form-group">

                  <div className="label-with-action">

                    <label>
                      <FiType />
                      Telugu Name
                    </label>

                    <button
                      type="button"
                      className="transliterate-btn"
                      onClick={this.transliterateTelugu}
                      disabled={
                        transliterating ||
                        !form.customer_name.trim()
                      }
                    >
                      {transliterating ? (
                        <>
                          <FiRefreshCw className="spin" />
                          Converting...
                        </>
                      ) : (
                        <>
                          <span>అ</span>
                          English → తెలుగు
                        </>
                      )}
                    </button>

                  </div>

                  <div className="input-wrapper telugu-input">

                    <FiType />

                    <input
                      type="text"
                      name="telugu_name"
                      value={form.telugu_name}
                      onChange={this.handleChange}
                      placeholder="తెలుగు పేరు"
                      autoComplete="off"
                    />

                  </div>

                  <div className="input-hint">
                    Enter the English name above and press
                    <strong> English → తెలుగు</strong>.
                    You can edit the Telugu result manually.
                  </div>

                </div>

                {/* =================================================
                    MOBILE
                ================================================= */}

                <div className="form-group">

                  <label>
                    <FiPhone />
                    Mobile Number
                  </label>

                  <div className="input-wrapper">

                    <FiPhone />

                    <input
                      type="tel"
                      name="mobile_number"
                      value={form.mobile_number}
                      onChange={this.handleChange}
                      placeholder="10 digit mobile number"
                      maxLength="10"
                      inputMode="numeric"
                      autoComplete="tel"
                    />

                    <span className="input-counter">
                      {form.mobile_number.length}/10
                    </span>

                  </div>

                </div>

                {/* =================================================
                    ADDRESS
                ================================================= */}

                <div className="form-group">

                  <label>
                    <FiMapPin />
                    Address
                  </label>

                  <div className="input-wrapper textarea-wrapper">

                    <FiMapPin />

                    <textarea
                      name="address"
                      value={form.address}
                      onChange={this.handleChange}
                      placeholder="Enter customer address"
                      rows="3"
                    />

                  </div>

                </div>

                {/* =================================================
                    BUTTONS
                ================================================= */}

                <div className="customer-form-actions">

                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={this.closeModal}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="save-customer-btn"
                    disabled={saving}
                  >

                    {saving ? (
                      <>
                        <FiRefreshCw className="spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave />
                        {editingCustomer
                          ? "Update Customer"
                          : "Save Customer"}
                      </>
                    )}

                  </button>

                </div>

              </form>

            </div>

          </div>

        )}

      </div>
    );
  }
}

export default Customers;