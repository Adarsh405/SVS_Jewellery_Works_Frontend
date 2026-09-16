import { Component } from "react";
import {
  FiActivity,
  FiCalendar,
  FiChevronDown,
  FiClock,
  FiDownload,
  FiFilter,
  FiPackage,
  FiPhone,
  FiRefreshCw,
  FiSearch,
  FiUser,
  FiX,
} from "react-icons/fi";
import "./sales.css";

const API_URL =
  "https://svs-jewellery-works-backend.onrender.com/api/sold-items";

class Sales extends Component {
  state = {
    sales: [],
    loading: true,
    error: "",

    saleType: "All",
    period: "today",

    startDate: "",
    endDate: "",

    search: "",
  };

  componentDidMount() {
    const today = this.getToday();

    this.setState(
      {
        startDate: today,
        endDate: today,
      },
      this.fetchSales
    );
  }

  /* =====================================================
     API
  ===================================================== */

  fetchSales = async () => {
    try {
      this.setState({
        loading: true,
        error: "",
      });

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch sales");
      }

      const data = await response.json();

      this.setState({
        sales: Array.isArray(data) ? data : [],
        loading: false,
      });
    } catch (error) {
      console.error(error);

      this.setState({
        loading: false,
        error: "Unable to connect to the sales server.",
      });
    }
  };

  /* =====================================================
     INDIA DATE / TIME
  ===================================================== */

  formatDateTime = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(date);
  };

  getIndiaDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);

    const year = parts.find((item) => item.type === "year")?.value;
    const month = parts.find((item) => item.type === "month")?.value;
    const day = parts.find((item) => item.type === "day")?.value;

    return `${year}-${month}-${day}`;
  };

  getToday = () => {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());

    const year = parts.find((item) => item.type === "year")?.value;
    const month = parts.find((item) => item.type === "month")?.value;
    const day = parts.find((item) => item.type === "day")?.value;

    return `${year}-${month}-${day}`;
  };

  getDateFromString = (dateString) => {
    const [year, month, day] = dateString.split("-").map(Number);

    return new Date(year, month - 1, day);
  };

  formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  getYesterday = () => {
    const today = this.getDateFromString(this.getToday());

    today.setDate(today.getDate() - 1);

    return this.formatLocalDate(today);
  };

  getWeekStart = () => {
    const today = this.getDateFromString(this.getToday());

    const day = today.getDay();

    const difference = day === 0 ? -6 : 1 - day;

    today.setDate(today.getDate() + difference);

    return this.formatLocalDate(today);
  };

  getMonthStart = () => {
    const today = this.getDateFromString(this.getToday());

    return this.formatLocalDate(
      new Date(today.getFullYear(), today.getMonth(), 1)
    );
  };

  /* =====================================================
     FILTERS
  ===================================================== */

  getFilteredSales = () => {
    const {
      sales,
      saleType,
      period,
      startDate,
      endDate,
      search,
    } = this.state;

    let filtered = [...sales];

    /* TYPE */

    if (saleType !== "All") {
      filtered = filtered.filter(
        (item) =>
          item.item_type?.toLowerCase() === saleType.toLowerCase()
      );
    }

    /* DATE */

    if (period !== "all") {
      let filterStart = "";
      let filterEnd = "";

      if (period === "today") {
        filterStart = this.getToday();
        filterEnd = this.getToday();
      }

      if (period === "yesterday") {
        filterStart = this.getYesterday();
        filterEnd = this.getYesterday();
      }

      if (period === "week") {
        filterStart = this.getWeekStart();
        filterEnd = this.getToday();
      }

      if (period === "month") {
        filterStart = this.getMonthStart();
        filterEnd = this.getToday();
      }

      if (period === "custom") {
        filterStart = startDate;
        filterEnd = endDate;
      }

      filtered = filtered.filter((item) => {
        const itemDate = this.getIndiaDate(item.sold_at);

        if (filterStart && itemDate < filterStart) {
          return false;
        }

        if (filterEnd && itemDate > filterEnd) {
          return false;
        }

        return true;
      });
    }

    /* SEARCH */

    const searchText = search.trim().toLowerCase();

    if (searchText) {
      filtered = filtered.filter((item) => {
        return (
          String(item.item_name || "")
            .toLowerCase()
            .includes(searchText) ||
          String(item.item_id || "")
            .toLowerCase()
            .includes(searchText) ||
          String(item.customer_name || "")
            .toLowerCase()
            .includes(searchText) ||
          String(item.customer_phone || "")
            .toLowerCase()
            .includes(searchText)
        );
      });
    }

    return filtered;
  };

  handleTypeChange = (event) => {
    this.setState({
      saleType: event.target.value,
    });
  };

  handlePeriodChange = (event) => {
    const period = event.target.value;

    let startDate = this.state.startDate;
    let endDate = this.state.endDate;

    if (period === "today") {
      startDate = this.getToday();
      endDate = this.getToday();
    }

    if (period === "yesterday") {
      startDate = this.getYesterday();
      endDate = this.getYesterday();
    }

    if (period === "week") {
      startDate = this.getWeekStart();
      endDate = this.getToday();
    }

    if (period === "month") {
      startDate = this.getMonthStart();
      endDate = this.getToday();
    }

    if (period === "all") {
      startDate = "";
      endDate = "";
    }

    if (period === "custom") {
      startDate = "";
      endDate = "";
    }

    this.setState({
      period,
      startDate,
      endDate,
    });
  };

  handleStartDate = (event) => {
    this.setState({
      startDate: event.target.value,
      period: "custom",
    });
  };

  handleEndDate = (event) => {
    this.setState({
      endDate: event.target.value,
      period: "custom",
    });
  };

  handleSearch = (event) => {
    this.setState({
      search: event.target.value,
    });
  };

  clearFilters = () => {
    const today = this.getToday();

    this.setState({
      saleType: "All",
      period: "today",
      startDate: today,
      endDate: today,
      search: "",
    });
  };

  /* =====================================================
     CALCULATIONS
  ===================================================== */

  getWeight = (item) => {
    if (item.item_type?.toLowerCase() === "silver") {
      return Number(item.gross_weight || 0);
    }

    return Number(item.net_weight || 0);
  };

  getCharges = (item) => {
    return Number(item.charges || 0);
  };

  getMakingCost = (item) => {
    return Number(item.making_cost || 0);
  };

  getSoldPrice = (item) => {
    return Number(item.sold_price || 0);
  };

  getTotalWeight = (sales) => {
    return sales.reduce(
      (total, item) => total + this.getWeight(item),
      0
    );
  };

  getTotalCharges = (sales) => {
    return sales.reduce(
      (total, item) => total + this.getCharges(item),
      0
    );
  };

  getTotalMakingCost = (sales) => {
    return sales.reduce(
      (total, item) => total + this.getMakingCost(item),
      0
    );
  };

  getTotalSales = (sales) => {
    return sales.reduce(
      (total, item) => total + this.getSoldPrice(item),
      0
    );
  };

  getCategorySales = (type, sales) => {
    return sales.filter(
      (item) =>
        item.item_type?.toLowerCase() === type.toLowerCase()
    );
  };

  getHighestSale = (sales) => {
    if (!sales.length) return null;

    return sales.reduce((highest, current) => {
      return this.getSoldPrice(current) >
        this.getSoldPrice(highest)
        ? current
        : highest;
    }, sales[0]);
  };

  /* =====================================================
     CURRENCY
  ===================================================== */

  formatMoney = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  formatNumber = (value) => {
    return Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 3,
    });
  };

  /* =====================================================
     CSV EXPORT
  ===================================================== */

  exportCSV = () => {
    const sales = this.getFilteredSales();

    if (!sales.length) {
      alert("No sales available to export.");
      return;
    }

    const headers = [
      "Item ID",
      "Item Name",
      "Type",
      "Weight",
      "Charges",
      "Making Cost",
      "Sold Price",
      "Customer Name",
      "Customer Phone",
      "Sold At",
    ];

    const rows = sales.map((item) => [
      item.item_id,
      item.item_name || "",
      item.item_type || "",
      this.getWeight(item).toFixed(3),
      this.getCharges(item).toFixed(3),
      this.getMakingCost(item).toFixed(2),
      this.getSoldPrice(item).toFixed(2),
      item.customer_name || "",
      item.customer_phone || "",
      this.formatDateTime(item.sold_at),
    ]);

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `SVS-Sales-${this.getToday()}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /* =====================================================
     RENDER CATEGORY CARD
  ===================================================== */

  renderCategoryCard = (
    title,
    type,
    className,
    icon
  ) => {
    const filteredSales = this.getFilteredSales();

    const items = this.getCategorySales(type, filteredSales);

    const weight = this.getTotalWeight(items);
    const charges = this.getTotalCharges(items);
    const sales = this.getTotalSales(items);

    return (
      <div className={`category-card ${className}`}>
        <div className="category-card-glow"></div>

        <div className="category-top">
          <div className="category-icon">
            {icon}
          </div>

          <div>
            <span>{title}</span>

            <small>
              {items.length} item
              {items.length !== 1 ? "s" : ""} sold
            </small>
          </div>
        </div>

        <div className="category-divider"></div>

        <div className="category-stat">
          <span>Weight</span>
          <strong>{this.formatNumber(weight)} g</strong>
        </div>

        {(type === "KDM" || type === "HallMark") && (
          <div className="category-stat charge-stat">
            <span>Charges</span>
            <strong>
              {this.formatNumber(charges)} g
            </strong>
          </div>
        )}

        <div className="category-stat">
          <span>Sold Value</span>
          <strong>{this.formatMoney(sales)}</strong>
        </div>
      </div>
    );
  };

  /* =====================================================
     SUMMARY
  ===================================================== */

  renderSummary = (filteredSales) => {
    const totalSales = this.getTotalSales(filteredSales);

    const totalMaking = this.getTotalMakingCost(
      filteredSales
    );

    const averageSale = filteredSales.length
      ? totalSales / filteredSales.length
      : 0;

    const highestSale = this.getHighestSale(
      filteredSales
    );

    return (
      <div className="summary-grid">
        <div className="summary-card revenue-card">
          <div className="summary-icon">₹</div>

          <div className="summary-info">
            <span>Total Sold Value</span>

            <strong>
              {this.formatMoney(totalSales)}
            </strong>

            <small>Revenue generated</small>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <FiPackage />
          </div>

          <div className="summary-info">
            <span>Items Sold</span>

            <strong>{filteredSales.length}</strong>

            <small>Completed transactions</small>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <FiActivity />
          </div>

          <div className="summary-info">
            <span>Making Cost</span>

            <strong>
              {this.formatMoney(totalMaking)}
            </strong>

            <small>Total making charges</small>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <FiActivity />
          </div>

          <div className="summary-info">
            <span>Average Sale</span>

            <strong>
              {this.formatMoney(averageSale)}
            </strong>

            <small>Per transaction</small>
          </div>
        </div>

        <div className="summary-card highlight-card">
          <div className="summary-icon">
            ↗
          </div>

          <div className="summary-info">
            <span>Highest Sale</span>

            <strong>
              {highestSale
                ? this.formatMoney(
                    this.getSoldPrice(highestSale)
                  )
                : "₹0"}
            </strong>

            <small>
              {highestSale?.item_name || "No sales"}
            </small>
          </div>
        </div>
      </div>
    );
  };

  /* =====================================================
     RENDER
  ===================================================== */

  render() {
    const {
      loading,
      error,
      saleType,
      period,
      startDate,
      endDate,
      search,
    } = this.state;

    const filteredSales = this.getFilteredSales();

    return (
      <div className="sales-page">

        {/* BACKGROUND */}

        <div className="sales-bg">
          <div className="bg-glow bg-glow-one"></div>
          <div className="bg-glow bg-glow-two"></div>
          <div className="bg-glow bg-glow-three"></div>

          <div className="bg-ring ring-one"></div>
          <div className="bg-ring ring-two"></div>
          <div className="bg-ring ring-three"></div>

          <div className="floating-dot dot-one"></div>
          <div className="floating-dot dot-two"></div>
          <div className="floating-dot dot-three"></div>
        </div>

        <div className="sales-content">

          {/* HEADER */}

          <header className="sales-header">

            <div className="brand-section">

              <div className="svs-logo-box">
                <div className="svs-logo-ring"></div>

                <div className="svs-logo">
                  <strong>SVS</strong>
                  <span>JEWELLERY</span>
                </div>
              </div>

              <div className="brand-divider"></div>

              <div className="sales-title">

                <span className="sales-kicker">
                  SVS JEWELLERY WORKS
                </span>

                <h1>Sales Analytics</h1>

                <p>
                  Business sales intelligence,
                  jewellery weight & revenue
                </p>

              </div>

            </div>

            <div className="header-actions">

              <div className="india-badge">
                <span></span>
                India Standard Time
              </div>

              <button
                className="refresh-btn"
                onClick={this.fetchSales}
                disabled={loading}
              >
                <FiRefreshCw
                  className={
                    loading ? "refresh-spin" : ""
                  }
                />

                Refresh
              </button>

            </div>

          </header>

          {/* FILTER PANEL */}

          <section className="filter-panel">

            <div className="filter-panel-header">

              <div className="filter-title">

                <div className="filter-title-icon">
                  <FiFilter />
                </div>

                <div>
                  <span>REPORT CONTROLS</span>
                  <h2>Sales Filters</h2>
                </div>

              </div>

              <button
                className="clear-btn"
                onClick={this.clearFilters}
              >
                <FiX />
                Clear
              </button>

            </div>

            <div className="filter-controls">

              <div className="filter-group">

                <label>
                  <FiPackage />
                  SALE TYPE
                </label>

                <div className="select-wrap">

                  <select
                    value={saleType}
                    onChange={this.handleTypeChange}
                  >
                    <option value="All">
                      All Sales
                    </option>

                    <option value="KDM">
                      KDM Gold
                    </option>

                    <option value="HallMark">
                      HallMark Gold
                    </option>

                    <option value="Silver">
                      Silver
                    </option>
                  </select>

                  <FiChevronDown />

                </div>

              </div>

              <div className="filter-group">

                <label>
                  <FiCalendar />
                  PERIOD
                </label>

                <div className="select-wrap">

                  <select
                    value={period}
                    onChange={this.handlePeriodChange}
                  >
                    <option value="today">
                      Today
                    </option>

                    <option value="yesterday">
                      Yesterday
                    </option>

                    <option value="week">
                      This Week
                    </option>

                    <option value="month">
                      This Month
                    </option>

                    <option value="all">
                      All Time
                    </option>

                    <option value="custom">
                      Custom Range
                    </option>
                  </select>

                  <FiChevronDown />

                </div>

              </div>

              {period === "custom" && (
                <>
                  <div className="filter-group">

                    <label>
                      <FiCalendar />
                      START DATE
                    </label>

                    <input
                      type="date"
                      value={startDate}
                      onChange={this.handleStartDate}
                    />

                  </div>

                  <div className="filter-group">

                    <label>
                      <FiCalendar />
                      END DATE
                    </label>

                    <input
                      type="date"
                      value={endDate}
                      onChange={this.handleEndDate}
                    />

                  </div>
                </>
              )}

            </div>

            {/* SEARCH */}

            <div className="sales-search">

              <FiSearch />

              <input
                type="text"
                placeholder="Search item, item ID, customer name or phone..."
                value={search}
                onChange={this.handleSearch}
              />

              {search && (
                <button
                  onClick={() =>
                    this.setState({ search: "" })
                  }
                >
                  <FiX />
                </button>
              )}

            </div>

          </section>

          {/* CURRENT RESULT */}

          <div className="result-toolbar">

            <div>

              <span>TRANSACTION OVERVIEW</span>

              <h2>
                {saleType === "All"
                  ? "All Sales"
                  : `${saleType} Sales`}
              </h2>

              <p>
                {filteredSales.length} transaction
                {filteredSales.length !== 1
                  ? "s"
                  : ""}{" "}
                found
              </p>

            </div>

            <button
              className="export-btn"
              onClick={this.exportCSV}
              disabled={!filteredSales.length}
            >
              <FiDownload />
              Export CSV
            </button>

          </div>

          {/* LOADING */}

          {loading && (
            <div className="sales-loading">

              <div className="premium-loader">
                <div></div>
              </div>

              <h3>Loading Sales Data</h3>

              <p>
                Connecting to SVS Jewellery Works...
              </p>

            </div>
          )}

          {/* ERROR */}

          {!loading && error && (
            <div className="sales-error">

              <div className="error-icon">
                !
              </div>

              <div>
                <h3>Sales data unavailable</h3>
                <p>{error}</p>
              </div>

              <button onClick={this.fetchSales}>
                Try Again
              </button>

            </div>
          )}

          {/* DATA */}

          {!loading && !error && (
            <>

              {/* SUMMARY */}

              {this.renderSummary(filteredSales)}

              {/* CATEGORY BREAKDOWN */}

              {saleType === "All" && (
                <section className="category-section">

                  <div className="section-heading">

                    <div>
                      <span>INVENTORY BREAKDOWN</span>

                      <h2>Sales by Category</h2>

                      <p>
                        Gold and silver weights are
                        displayed separately.
                      </p>
                    </div>

                    <div className="section-live">
                      <span></span>
                      LIVE REPORT
                    </div>

                  </div>

                  <div className="category-grid">

                    {this.renderCategoryCard(
                      "KDM Gold",
                      "KDM",
                      "category-kdm",
                      "K"
                    )}

                    {this.renderCategoryCard(
                      "HallMark Gold",
                      "HallMark",
                      "category-hallmark",
                      "H"
                    )}

                    {this.renderCategoryCard(
                      "Silver",
                      "Silver",
                      "category-silver",
                      "S"
                    )}

                  </div>

                </section>
              )}

              {/* SELECTED CATEGORY */}

              {saleType !== "All" && (
                <section className="selected-category-section">

                  <div className="selected-category-card">

                    <div className="selected-category-left">

                      <div className="selected-icon">
                        {saleType === "Silver"
                          ? "S"
                          : saleType === "KDM"
                          ? "K"
                          : "H"}
                      </div>

                      <div>
                        <span>
                          SELECTED CATEGORY
                        </span>

                        <h2>
                          {saleType === "KDM"
                            ? "KDM Gold"
                            : saleType === "HallMark"
                            ? "HallMark Gold"
                            : "Silver"}
                        </h2>
                      </div>

                    </div>

                    <div className="selected-stats">

                      <div>
                        <span>Weight</span>
                        <strong>
                          {this.formatNumber(
                            this.getTotalWeight(
                              filteredSales
                            )
                          )}{" "}
                          g
                        </strong>
                      </div>

                      {(saleType === "KDM" ||
                        saleType === "HallMark") && (
                        <div className="charge-highlight">
                          <span>Charges</span>

                          <strong>
                            {this.formatNumber(
                              this.getTotalCharges(
                                filteredSales
                              )
                            )}{" "}
                            g
                          </strong>
                        </div>
                      )}

                      <div>
                        <span>Sold Value</span>

                        <strong>
                          {this.formatMoney(
                            this.getTotalSales(
                              filteredSales
                            )
                          )}
                        </strong>
                      </div>

                    </div>

                  </div>

                </section>
              )}

              {/* TABLE */}

              <section className="sales-table-section">

                <div className="table-header">

                  <div className="table-heading">

                    <div className="table-icon">
                      <FiActivity />
                    </div>

                    <div>
                      <span>TRANSACTION HISTORY</span>

                      <h2>Sales Details</h2>
                    </div>

                  </div>

                  <div className="record-count">
                    {filteredSales.length} Records
                  </div>

                </div>

                {filteredSales.length === 0 ? (
                  <div className="no-sales">

                    <div className="empty-icon">
                      <FiSearch />
                    </div>

                    <h3>No Sales Found</h3>

                    <p>
                      No transactions match your
                      current filters.
                    </p>

                    <button
                      onClick={this.clearFilters}
                    >
                      Reset Filters
                    </button>

                  </div>
                ) : (
                  <div className="sales-table-wrapper">

                    <table className="sales-table">

                      <thead>

                        <tr>
                          <th>#</th>
                          <th>ITEM</th>
                          <th>TYPE</th>
                          <th>WEIGHT</th>
                          <th>CHARGES</th>
                          <th>MAKING</th>
                          <th>SOLD PRICE</th>
                          <th>CUSTOMER</th>
                          <th>SOLD AT</th>
                        </tr>

                      </thead>

                      <tbody>

                        {filteredSales.map(
                          (item, index) => {

                            const type =
                              item.item_type?.toLowerCase();

                            const isGold =
                              type === "kdm" ||
                              type === "hallmark";

                            return (
                              <tr key={item.id}>

                                <td>
                                  <span className="sale-number">
                                    {index + 1}
                                  </span>
                                </td>

                                <td>
                                  <div className="item-info">

                                    <strong>
                                      {item.item_name ||
                                        "-"}
                                    </strong>

                                    <small>
                                      ID:{" "}
                                      {item.item_id}
                                    </small>

                                  </div>
                                </td>

                                <td>
                                  <span
                                    className={`type-badge ${type}`}
                                  >
                                    {item.item_type}
                                  </span>
                                </td>

                                <td>

                                  <div className="weight-cell">

                                    <strong>
                                      {this.formatNumber(
                                        this.getWeight(
                                          item
                                        )
                                      )}{" "}
                                      g
                                    </strong>

                                    <small>
                                      {type ===
                                      "silver"
                                        ? "GROSS"
                                        : "NET"}
                                    </small>

                                  </div>

                                </td>

                                <td>

                                  {isGold ? (
                                    <div className="charge-cell">
                                      <strong>
                                        {this.formatNumber(
                                          this.getCharges(
                                            item
                                          )
                                        )}{" "}
                                        g
                                      </strong>

                                      <small>
                                        Charges
                                      </small>
                                    </div>
                                  ) : (
                                    <span className="not-applicable">
                                      —
                                    </span>
                                  )}

                                </td>

                                <td>
                                  <span className="making-value">
                                    {this.formatMoney(
                                      this.getMakingCost(
                                        item
                                      )
                                    )}
                                  </span>
                                </td>

                                <td>
                                  <strong className="sold-price">
                                    {this.formatMoney(
                                      this.getSoldPrice(
                                        item
                                      )
                                    )}
                                  </strong>
                                </td>

                                <td>
                                  <div className="customer-info">

                                    <div className="customer-name">
                                      <FiUser />

                                      <strong>
                                        {item.customer_name ||
                                          "Walk-in"}
                                      </strong>
                                    </div>

                                    {item.customer_phone && (
                                      <small>
                                        <FiPhone />
                                        {
                                          item.customer_phone
                                        }
                                      </small>
                                    )}

                                  </div>
                                </td>

                                <td>

                                  <div className="sold-time">

                                    <FiClock />

                                    <span>
                                      {this.formatDateTime(
                                        item.sold_at
                                      )}
                                    </span>

                                  </div>

                                </td>

                              </tr>
                            );
                          }
                        )}

                      </tbody>

                    </table>

                  </div>
                )}

              </section>

              {/* FOOTER */}

              <footer className="sales-footer">

                <div className="footer-brand">

                  <div className="footer-logo">
                    SVS
                  </div>

                  <span>
                    SVS JEWELLERY WORKS
                  </span>

                </div>

                <div className="footer-status">
                  <span></span>
                  Sales system operational
                </div>

              </footer>

            </>
          )}

        </div>
      </div>
    );
  }
}

export default Sales;