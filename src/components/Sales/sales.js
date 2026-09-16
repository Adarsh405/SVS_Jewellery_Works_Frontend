import { Component } from "react";
import "./sales.css";

class Sales extends Component {
  state = {
    sales: [],
    loading: true,
    error: "",
    type: "All",
    period: "today",
    startDate: "",
    endDate: "",
  };

  componentDidMount() {
    this.fetchSales();
  }

  fetchSales = async () => {
    try {
      this.setState({ loading: true, error: "" });

      const response = await fetch(
        "https://svs-jewellery-works-backend.onrender.com/api/sold-items"
      );

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
        error: "Unable to load sales data",
      });
    }
  };

  // Convert UTC time from API to India time
  formatIndianDateTime = (dateString) => {
    if (!dateString) return "-";

    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(new Date(dateString));
  };

  // Get date in India timezone as YYYY-MM-DD
  getIndiaDate = (dateString) => {
    if (!dateString) return "";

    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date(dateString));

    const year = parts.find((p) => p.type === "year")?.value;
    const month = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;

    return `${year}-${month}-${day}`;
  };

  getTodayIndia = () => {
    return this.getIndiaDate(new Date().toISOString());
  };

  getStartOfWeek = () => {
    const todayString = this.getTodayIndia();
    const today = new Date(`${todayString}T00:00:00`);

    const day = today.getDay();

    // Monday = start of week
    const difference = day === 0 ? -6 : 1 - day;

    today.setDate(today.getDate() + difference);

    return this.formatLocalDate(today);
  };

  getStartOfMonth = () => {
    const todayString = this.getTodayIndia();
    const today = new Date(`${todayString}T00:00:00`);

    return `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-01`;
  };

  formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  handlePeriodChange = (event) => {
    const period = event.target.value;

    let startDate = "";
    let endDate = "";

    const today = this.getTodayIndia();

    if (period === "today") {
      startDate = today;
      endDate = today;
    }

    if (period === "week") {
      startDate = this.getStartOfWeek();
      endDate = today;
    }

    if (period === "month") {
      startDate = this.getStartOfMonth();
      endDate = today;
    }

    if (period === "custom") {
      startDate = this.state.startDate;
      endDate = this.state.endDate;
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

  handleTypeChange = (event) => {
    this.setState({
      type: event.target.value,
    });
  };

  getFilteredSales = () => {
    const {
      sales,
      type,
      startDate,
      endDate,
    } = this.state;

    return sales.filter((sale) => {
      // Type filter
      const saleType = sale.item_type?.toLowerCase();

      let typeMatch = true;

      if (type !== "All") {
        typeMatch =
          saleType === type.toLowerCase() ||
          (type === "HallMark" && saleType === "hallmark");
      }

      if (!typeMatch) {
        return false;
      }

      // Date filter
      const saleDate = this.getIndiaDate(sale.sold_at);

      if (startDate && saleDate < startDate) {
        return false;
      }

      if (endDate && saleDate > endDate) {
        return false;
      }

      return true;
    });
  };

  getWeight = (sale) => {
    if (sale.item_type?.toLowerCase() === "silver") {
      return Number(sale.gross_weight || 0);
    }

    return Number(sale.net_weight || 0);
  };

  calculateSummary = (items) => {
    return items.reduce(
      (summary, item) => {
        summary.weight += this.getWeight(item);
        summary.price += Number(item.sold_price || 0);

        return summary;
      },
      {
        weight: 0,
        price: 0,
      }
    );
  };

  renderSummaryCard = (
    title,
    value,
    subtitle,
    icon,
    className
  ) => {
    return (
      <div className={`sales-summary-card ${className}`}>
        <div className="summary-icon">{icon}</div>

        <div className="summary-content">
          <span>{title}</span>
          <strong>{value}</strong>
          <small>{subtitle}</small>
        </div>
      </div>
    );
  };

  renderTypeSummary = (type, title, icon) => {
    const { sales } = this.state;

    const items = sales.filter((sale) => {
      const saleType = sale.item_type?.toLowerCase();

      if (type === "HallMark") {
        return saleType === "hallmark";
      }

      return saleType === type.toLowerCase();
    });

    const filteredItems = items.filter((sale) => {
      const saleDate = this.getIndiaDate(sale.sold_at);
      const { startDate, endDate } = this.state;

      if (startDate && saleDate < startDate) return false;
      if (endDate && saleDate > endDate) return false;

      return true;
    });

    const summary = this.calculateSummary(filteredItems);

    return (
      <div className="type-card">
        <div className="type-card-header">
          <div className="type-icon">{icon}</div>

          <div>
            <h3>{title}</h3>
            <span>{filteredItems.length} sales</span>
          </div>
        </div>

        <div className="type-stat">
          <span>Total Weight</span>
          <strong>{summary.weight.toFixed(3)} g</strong>
        </div>

        <div className="type-stat">
          <span>Sold Amount</span>
          <strong>
            ₹{summary.price.toLocaleString("en-IN")}
          </strong>
        </div>
      </div>
    );
  };

  render() {
    const {
      loading,
      error,
      type,
      period,
      startDate,
      endDate,
    } = this.state;

    const filteredSales = this.getFilteredSales();

    const summary = this.calculateSummary(filteredSales);

    return (
      <div className="sales-page">

        {/* HEADER */}
        <div className="sales-header">
          <div>
            <span className="sales-eyebrow">
              SALES MANAGEMENT
            </span>

            <h1>Sales Analytics</h1>

            <p>
              Track jewellery sales, weights and revenue
            </p>
          </div>

          <button
            className="refresh-sales"
            onClick={this.fetchSales}
          >
            ↻ Refresh
          </button>
        </div>

        {/* FILTERS */}
        <div className="sales-filter-box">

          <div className="filter-group">
            <label>SALE TYPE</label>

            <select
              value={type}
              onChange={this.handleTypeChange}
            >
              <option value="All">All Sales</option>
              <option value="Silver">Silver</option>
              <option value="KDM">KDM Gold</option>
              <option value="HallMark">HallMark Gold</option>
            </select>
          </div>

          <div className="filter-group">
            <label>PERIOD</label>

            <select
              value={period}
              onChange={this.handlePeriodChange}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <div className="filter-group">
            <label>START DATE</label>

            <input
              type="date"
              value={startDate}
              onChange={this.handleStartDate}
            />
          </div>

          <div className="filter-group">
            <label>END DATE</label>

            <input
              type="date"
              value={endDate}
              onChange={this.handleEndDate}
            />
          </div>

        </div>

        {/* LOADING */}
        {loading && (
          <div className="sales-loading">
            <div className="sales-spinner"></div>
            <p>Loading sales...</p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="sales-error">
            ⚠ {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* MAIN SUMMARY */}
            <div className="sales-summary-grid">

              {this.renderSummaryCard(
                "TOTAL SALES",
                filteredSales.length,
                "Items sold",
                "🧾",
                "summary-sales"
              )}

              {this.renderSummaryCard(
                "TOTAL SOLD VALUE",
                `₹${summary.price.toLocaleString("en-IN")}`,
                "Revenue generated",
                "₹",
                "summary-money"
              )}

              {this.renderSummaryCard(
                "TOTAL WEIGHT",
                `${summary.weight.toFixed(3)} g`,
                "Jewellery sold",
                "⚖",
                "summary-weight"
              )}

              {this.renderSummaryCard(
                "AVERAGE SALE",
                filteredSales.length
                  ? `₹${Math.round(
                      summary.price / filteredSales.length
                    ).toLocaleString("en-IN")}`
                  : "₹0",
                "Average per item",
                "📊",
                "summary-average"
              )}

            </div>

            {/* TYPE BREAKDOWN */}
            {type === "All" && (
              <section className="type-section">

                <div className="section-title">
                  <div>
                    <span>BREAKDOWN</span>
                    <h2>Sales by Category</h2>
                  </div>
                </div>

                <div className="type-grid">

                  {this.renderTypeSummary(
                    "KDM",
                    "KDM Gold",
                    "💛"
                  )}

                  {this.renderTypeSummary(
                    "HallMark",
                    "HallMark Gold",
                    "🏆"
                  )}

                  {this.renderTypeSummary(
                    "Silver",
                    "Silver",
                    "🥈"
                  )}

                </div>
              </section>
            )}

            {/* TABLE */}
            <section className="sales-table-section">

              <div className="table-heading">

                <div>
                  <span>TRANSACTION HISTORY</span>
                  <h2>Sales Details</h2>
                </div>

                <div className="result-count">
                  {filteredSales.length} Records
                </div>

              </div>

              {filteredSales.length === 0 ? (
                <div className="empty-sales">
                  <div>📭</div>
                  <h3>No sales found</h3>
                  <p>
                    No sales match the selected filters.
                  </p>
                </div>
              ) : (
                <div className="table-wrapper">

                  <table className="sales-table">

                    <thead>
                      <tr>
                        <th>#</th>
                        <th>ITEM</th>
                        <th>TYPE</th>
                        <th>WEIGHT</th>
                        <th>MAKING</th>
                        <th>SOLD PRICE</th>
                        <th>CUSTOMER</th>
                        <th>SOLD AT</th>
                      </tr>
                    </thead>

                    <tbody>

                      {filteredSales.map((sale, index) => {

                        const weight =
                          this.getWeight(sale);

                        return (
                          <tr key={sale.id}>

                            <td>
                              <span className="sale-number">
                                {index + 1}
                              </span>
                            </td>

                            <td>
                              <div className="item-info">
                                <strong>
                                  {sale.item_name || "-"}
                                </strong>

                                <small>
                                  ID: {sale.item_id}
                                </small>
                              </div>
                            </td>

                            <td>
                              <span
                                className={`type-badge ${sale.item_type
                                  ?.toLowerCase()
                                  .replace(/\s/g, "")}`}
                              >
                                {sale.item_type}
                              </span>
                            </td>

                            <td>
                              <strong>
                                {weight.toFixed(3)} g
                              </strong>

                              {sale.item_type?.toLowerCase() ===
                                "silver" ? (
                                <small className="weight-label">
                                  Gross Weight
                                </small>
                              ) : (
                                <small className="weight-label">
                                  Net Weight
                                </small>
                              )}
                            </td>

                            <td>
                              ₹
                              {Number(
                                sale.making_cost || 0
                              ).toLocaleString("en-IN")}
                            </td>

                            <td>
                              <strong className="sold-price">
                                ₹
                                {Number(
                                  sale.sold_price || 0
                                ).toLocaleString("en-IN")}
                              </strong>
                            </td>

                            <td>
                              <div className="customer-info">
                                <strong>
                                  {sale.customer_name || "Walk-in"}
                                </strong>

                                <small>
                                  {sale.customer_phone || "-"}
                                </small>
                              </div>
                            </td>

                            <td>
                              <span className="sale-time">
                                {this.formatIndianDateTime(
                                  sale.sold_at
                                )}
                              </span>
                            </td>

                          </tr>
                        );
                      })}

                    </tbody>

                  </table>

                </div>
              )}

            </section>
          </>
        )}
      </div>
    );
  }
}

export default Sales;