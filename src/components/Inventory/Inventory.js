import React, { Component } from "react";
import "./Inventory.css";

class Inventory extends Component {
  constructor(props) {
    super(props);

    this.state = {
      kdmItems: [],
      hallmarkItems: [],
      silverItems: [],

      rates: {
        gold_rate: 0,
        hallmark_rate: 0,
        silver_rate: 0,
      },

      selectedType: "all",
      loading: true,
      error: "",
    };
  }

  componentDidMount() {
    this.fetchInventoryData();
  }

  fetchInventoryData = async () => {
    try {
      this.setState({
        loading: true,
        error: "",
      });

      const [
        kdmResponse,
        hallmarkResponse,
        silverResponse,
        ratesResponse,
      ] = await Promise.all([
        fetch(
          "https://svs-jewellery-works-backend.onrender.com/api/kdm"
        ),
        fetch(
          "https://svs-jewellery-works-backend.onrender.com/api/Hallmark"
        ),
        fetch(
          "https://svs-jewellery-works-backend.onrender.com/api/silver"
        ),
        fetch(
          "https://svs-jewellery-works-backend.onrender.com/api/rates"
        ),
      ]);

      if (
        !kdmResponse.ok ||
        !hallmarkResponse.ok ||
        !silverResponse.ok ||
        !ratesResponse.ok
      ) {
        throw new Error("Failed to fetch inventory data");
      }

      const [
        kdmItems,
        hallmarkItems,
        silverItems,
        rates,
      ] = await Promise.all([
        kdmResponse.json(),
        hallmarkResponse.json(),
        silverResponse.json(),
        ratesResponse.json(),
      ]);

      this.setState({
        kdmItems: Array.isArray(kdmItems) ? kdmItems : [],
        hallmarkItems: Array.isArray(hallmarkItems)
          ? hallmarkItems
          : [],
        silverItems: Array.isArray(silverItems)
          ? silverItems
          : [],

        rates: {
          gold_rate: Number(rates.gold_rate) || 0,
          hallmark_rate: Number(rates.hallmark_rate) || 0,
          silver_rate: Number(rates.silver_rate) || 0,
        },

        loading: false,
      });
    } catch (error) {
      console.error(error);

      this.setState({
        loading: false,
        error: "Unable to load inventory details.",
      });
    }
  };

  handleTypeChange = (event) => {
    this.setState({
      selectedType: event.target.value,
    });
  };

  getGoldPrice = (item, rate) => {
    const weight = Number(item.net_weight) || 0;
    const charges = Number(item.charges) || 0;
    const makingCost = Number(item.making_cost) || 0;

    return (weight + charges) * rate + makingCost;
  };

  getSilverPrice = (item) => {
    const weight = Number(item.weight) || 0;
    const makingCost = Number(item.making_cost) || 0;
    const rate = Number(this.state.rates.silver_rate) || 0;

    return weight * rate + makingCost;
  };

  formatWeight = (value) => {
    return `${Number(value || 0).toFixed(3)} g`;
  };

  formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  getSelectedItems = () => {
    const {
      kdmItems,
      hallmarkItems,
      silverItems,
      selectedType,
    } = this.state;

    if (selectedType === "kdm") {
      return kdmItems.map((item) => ({
        ...item,
        category: "KDM",
      }));
    }

    if (selectedType === "hallmark") {
      return hallmarkItems.map((item) => ({
        ...item,
        category: "Hallmark",
      }));
    }

    if (selectedType === "silver") {
      return silverItems.map((item) => ({
        ...item,
        category: "Silver",
      }));
    }

    return [
      ...kdmItems.map((item) => ({
        ...item,
        category: "KDM",
      })),

      ...hallmarkItems.map((item) => ({
        ...item,
        category: "Hallmark",
      })),

      ...silverItems.map((item) => ({
        ...item,
        category: "Silver",
      })),
    ];
  };

  getGoldAnalytics = (items, rate) => {
    const totalItems = items.length;

    const availableItems = items.filter(
      (item) =>
        String(item.status).toLowerCase() !== "sold"
    );

    const soldItems = items.filter(
      (item) =>
        String(item.status).toLowerCase() === "sold"
    );

    const totalWeight = items.reduce(
      (sum, item) =>
        sum + (Number(item.net_weight) || 0),
      0
    );

    const availableWeight = availableItems.reduce(
      (sum, item) =>
        sum + (Number(item.net_weight) || 0),
      0
    );

    const soldWeight = soldItems.reduce(
      (sum, item) =>
        sum + (Number(item.net_weight) || 0),
      0
    );

    const totalCharges = items.reduce(
      (sum, item) =>
        sum + (Number(item.charges) || 0),
      0
    );

    const totalMakingCost = items.reduce(
      (sum, item) =>
        sum + (Number(item.making_cost) || 0),
      0
    );

    const availablePrice = availableItems.reduce(
      (sum, item) =>
        sum + this.getGoldPrice(item, rate),
      0
    );

    const totalPrice = items.reduce(
      (sum, item) =>
        sum + this.getGoldPrice(item, rate),
      0
    );

    return {
      totalItems,
      availableItems: availableItems.length,
      soldItems: soldItems.length,
      totalWeight,
      availableWeight,
      soldWeight,
      totalCharges,
      totalMakingCost,
      availablePrice,
      totalPrice,
    };
  };

  getSilverAnalytics = () => {
    const {
      silverItems,
      rates,
    } = this.state;

    const availableItems = silverItems.filter(
      (item) =>
        String(item.status).toLowerCase() !== "sold"
    );

    const soldItems = silverItems.filter(
      (item) =>
        String(item.status).toLowerCase() === "sold"
    );

    const totalWeight = silverItems.reduce(
      (sum, item) =>
        sum + (Number(item.weight) || 0),
      0
    );

    const availableWeight = availableItems.reduce(
      (sum, item) =>
        sum + (Number(item.weight) || 0),
      0
    );

    const soldWeight = soldItems.reduce(
      (sum, item) =>
        sum + (Number(item.weight) || 0),
      0
    );

    const totalMakingCost = silverItems.reduce(
      (sum, item) =>
        sum + (Number(item.making_cost) || 0),
      0
    );

    const availablePrice = availableItems.reduce(
      (sum, item) =>
        sum + this.getSilverPrice(item),
      0
    );

    const totalPrice = silverItems.reduce(
      (sum, item) =>
        sum + this.getSilverPrice(item),
      0
    );

    return {
      totalItems: silverItems.length,
      availableItems: availableItems.length,
      soldItems: soldItems.length,
      totalWeight,
      availableWeight,
      soldWeight,
      totalMakingCost,
      availablePrice,
      totalPrice,
      rate: rates.silver_rate,
    };
  };

  renderRateBar = () => {
    const { rates } = this.state;

    return (
      <div className="inventory-rates">
        <div className="inventory-rate-item">
          <span className="rate-label">
            KDM Gold
          </span>

          <strong>
            {this.formatCurrency(rates.gold_rate)}
          </strong>

          <small>/ gram</small>
        </div>

        <div className="inventory-rate-divider" />

        <div className="inventory-rate-item">
          <span className="rate-label">
            Hallmark Gold
          </span>

          <strong>
            {this.formatCurrency(
              rates.hallmark_rate
            )}
          </strong>

          <small>/ gram</small>
        </div>

        <div className="inventory-rate-divider" />

        <div className="inventory-rate-item silver-rate">
          <span className="rate-label">
            Silver
          </span>

          <strong>
            {this.formatCurrency(
              rates.silver_rate
            )}
          </strong>

          <small>/ gram</small>
        </div>
      </div>
    );
  };

  renderSelector = (className = "") => {
    return (
      <div
        className={`inventory-selector-wrapper ${className}`}
      >
        <label>View Inventory</label>

        <select
          value={this.state.selectedType}
          onChange={this.handleTypeChange}
          className="inventory-selector"
        >
          <option value="all">
            All Items
          </option>

          <option value="kdm">
            KDM Gold
          </option>

          <option value="hallmark">
            Hallmark Gold
          </option>

          <option value="silver">
            Silver
          </option>
        </select>
      </div>
    );
  };

  renderMetric = (
    label,
    value,
    subText = ""
  ) => {
    return (
      <div className="inventory-metric">
        <span>{label}</span>

        <strong>{value}</strong>

        {subText && (
          <small>{subText}</small>
        )}
      </div>
    );
  };

  renderGoldCard = (
    title,
    items,
    rate,
    typeClass
  ) => {
    const data =
      this.getGoldAnalytics(
        items,
        rate
      );

    return (
      <div
        className={`inventory-category-card ${typeClass}`}
      >
        <div className="category-card-shine" />

        <div className="category-card-header">
          <div>
            <span className="category-kicker">
              GOLD COLLECTION
            </span>

            <h3>{title}</h3>
          </div>

          <div className="category-rate">
            <span>Current Rate</span>

            <strong>
              {this.formatCurrency(rate)}
              /g
            </strong>
          </div>
        </div>

        <div className="inventory-metrics-grid">
          {this.renderMetric(
            "Total Items",
            data.totalItems,
            `${data.availableItems} available`
          )}

          {this.renderMetric(
            "Total Weight",
            this.formatWeight(
              data.totalWeight
            )
          )}

          {this.renderMetric(
            "Available Weight",
            this.formatWeight(
              data.availableWeight
            )
          )}

          {this.renderMetric(
            "Sold Weight",
            this.formatWeight(
              data.soldWeight
            )
          )}

          {this.renderMetric(
            "Total Charges",
            this.formatWeight(
              data.totalCharges
            )
          )}

          {this.renderMetric(
            "Making Cost",
            this.formatCurrency(
              data.totalMakingCost
            )
          )}
        </div>

        <div className="category-price-footer">
          <div>
            <span>
              Current Stock Value
            </span>

            <strong>
              {this.formatCurrency(
                data.availablePrice
              )}
            </strong>
          </div>

          <div>
            <span>
              All Items Value
            </span>

            <strong>
              {this.formatCurrency(
                data.totalPrice
              )}
            </strong>
          </div>
        </div>

        <div className="category-status">
          <span className="available-dot" />

          {data.availableItems} Available

          <span className="status-separator">
            •
          </span>

          {data.soldItems} Sold
        </div>
      </div>
    );
  };

  renderSilverCard = () => {
    const data =
      this.getSilverAnalytics();

    return (
      <div className="inventory-category-card silver-category-card">
        <div className="category-card-shine" />

        <div className="category-card-header">
          <div>
            <span className="category-kicker">
              SILVER COLLECTION
            </span>

            <h3>Silver Items</h3>
          </div>

          <div className="category-rate silver-category-rate">
            <span>Current Rate</span>

            <strong>
              {this.formatCurrency(
                data.rate
              )}
              /g
            </strong>
          </div>
        </div>

        <div className="inventory-metrics-grid">
          {this.renderMetric(
            "Total Items",
            data.totalItems,
            `${data.availableItems} available`
          )}

          {this.renderMetric(
            "Total Weight",
            this.formatWeight(
              data.totalWeight
            )
          )}

          {this.renderMetric(
            "Available Weight",
            this.formatWeight(
              data.availableWeight
            )
          )}

          {this.renderMetric(
            "Sold Weight",
            this.formatWeight(
              data.soldWeight
            )
          )}

          {this.renderMetric(
            "Making Cost",
            this.formatCurrency(
              data.totalMakingCost
            )
          )}

          {this.renderMetric(
            "Sold Items",
            data.soldItems
          )}
        </div>

        <div className="category-price-footer">
          <div>
            <span>
              Current Stock Value
            </span>

            <strong>
              {this.formatCurrency(
                data.availablePrice
              )}
            </strong>
          </div>

          <div>
            <span>
              All Items Value
            </span>

            <strong>
              {this.formatCurrency(
                data.totalPrice
              )}
            </strong>
          </div>
        </div>

        <div className="category-status">
          <span className="silver-dot" />

          {data.availableItems} Available

          <span className="status-separator">
            •
          </span>

          {data.soldItems} Sold
        </div>
      </div>
    );
  };

  renderAllOverview = () => {
    const {
      kdmItems,
      hallmarkItems,
    } = this.state;

    const kdm =
      this.getGoldAnalytics(
        kdmItems,
        this.state.rates.gold_rate
      );

    const hallmark =
      this.getGoldAnalytics(
        hallmarkItems,
        this.state.rates.hallmark_rate
      );

    const silver =
      this.getSilverAnalytics();

    const totalItems =
      kdm.totalItems +
      hallmark.totalItems +
      silver.totalItems;

    const availableItems =
      kdm.availableItems +
      hallmark.availableItems +
      silver.availableItems;

    const soldItems =
      kdm.soldItems +
      hallmark.soldItems +
      silver.soldItems;

    const totalStockValue =
      kdm.availablePrice +
      hallmark.availablePrice +
      silver.availablePrice;

    return (
      <div className="all-overview-card">
        <div className="overview-decoration" />

        <div className="all-overview-heading">
          <div>
            <span className="category-kicker">
              SHOWROOM INVENTORY
            </span>

            <h3>
              Complete Collection
            </h3>
          </div>

          <div className="inventory-health">
            <span className="health-dot" />
            Inventory Live
          </div>
        </div>

        <div className="all-overview-grid">
          <div>
            <span>Total Items</span>
            <strong>{totalItems}</strong>
          </div>

          <div>
            <span>Available Items</span>
            <strong>
              {availableItems}
            </strong>
          </div>

          <div>
            <span>Sold Items</span>
            <strong>{soldItems}</strong>
          </div>

          <div>
            <span>
              Current Stock Value
            </span>

            <strong>
              {this.formatCurrency(
                totalStockValue
              )}
            </strong>
          </div>
        </div>

        <div className="collection-breakdown">
          <div className="breakdown-item">
            <span className="breakdown-icon kdm-icon">
              K
            </span>

            <div>
              <small>KDM Gold</small>

              <strong>
                {kdm.availableItems}
                {" "}Available
              </strong>
            </div>
          </div>

          <div className="breakdown-item">
            <span className="breakdown-icon hm-icon">
              H
            </span>

            <div>
              <small>Hallmark Gold</small>

              <strong>
                {hallmark.availableItems}
                {" "}Available
              </strong>
            </div>
          </div>

          <div className="breakdown-item">
            <span className="breakdown-icon silver-icon">
              S
            </span>

            <div>
              <small>Silver</small>

              <strong>
                {silver.availableItems}
                {" "}Available
              </strong>
            </div>
          </div>
        </div>
      </div>
    );
  };

  renderItemTable = () => {
    const items =
      this.getSelectedItems();

    return (
      <div className="inventory-list-section">
        <div className="inventory-list-header">
          <div>
            <span className="category-kicker">
              ITEM REGISTER
            </span>

            <h3>
              Inventory Items
            </h3>

            <p>
              {items.length} items shown
            </p>
          </div>

          {this.renderSelector()}
        </div>

        <div className="inventory-table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Item</th>
                <th>Category</th>
                <th>Weight</th>
                <th>Charges</th>
                <th>Making Cost</th>
                <th>Current Price</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="empty-inventory"
                  >
                    No items available
                  </td>
                </tr>
              ) : (
                items.map(
                  (item, index) => {
                    const isSilver =
                      item.category ===
                      "Silver";

                    const isSold =
                      String(
                        item.status
                      ).toLowerCase() ===
                      "sold";

                    const price =
                      isSilver
                        ? this.getSilverPrice(
                            item
                          )
                        : this.getGoldPrice(
                            item,
                            item.category ===
                              "KDM"
                              ? this.state.rates
                                  .gold_rate
                              : this.state.rates
                                  .hallmark_rate
                          );

                    return (
                      <tr
                        key={`${item.category}-${item.id}`}
                        style={{
                          "--row-index": index,
                        }}
                      >
                        <td>
                          <span className="item-id">
                            #{item.id}
                          </span>
                        </td>

                        <td>
                          <div className="item-name-cell">
                            <strong>
                              {item.name}
                            </strong>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`category-pill ${item.category.toLowerCase()}`}
                          >
                            {item.category}
                          </span>
                        </td>

                        <td>
                          {this.formatWeight(
                            isSilver
                              ? item.weight
                              : item.net_weight
                          )}
                        </td>

                        <td>
                          {isSilver
                            ? "—"
                            : this.formatWeight(
                                item.charges
                              )}
                        </td>

                        <td>
                          {this.formatCurrency(
                            item.making_cost
                          )}
                        </td>

                        <td>
                          <strong className="table-price">
                            {this.formatCurrency(
                              price
                            )}
                          </strong>
                        </td>

                        <td>
                          <span
                            className={`status-pill ${
                              isSold
                                ? "sold"
                                : "available"
                            }`}
                          >
                            {isSold
                              ? "Sold"
                              : "Available"}
                          </span>
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  render() {
    const {
      loading,
      error,
      selectedType,
      kdmItems,
      hallmarkItems,
      rates,
    } = this.state;

    if (loading) {
      return (
        <div className="inventory-page">
          <div className="inventory-loading">
            <div className="inventory-loader">
              <span />
            </div>

            <h3>
              Preparing your inventory
            </h3>

            <p>
              Fetching the latest showroom
              stock...
            </p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="inventory-page">
          <div className="inventory-error">
            <div className="error-icon">
              !
            </div>

            <h3>
              Inventory unavailable
            </h3>

            <p>{error}</p>

            <button
              onClick={
                this.fetchInventoryData
              }
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="inventory-page">
        <div className="inventory-container">

          {/* HERO */}
          <div className="inventory-hero">
            <div className="hero-content">
              <span className="inventory-eyebrow">
                SVS JEWELLERY • STOCK CONTROL
              </span>

              <h1>
                Inventory Overview
              </h1>

              <p>
                A live view of your KDM,
                Hallmark Gold and Silver
                collection.
              </p>
            </div>

            {this.renderSelector(
              "hero-selector"
            )}
          </div>

          {/* RATES */}
          {this.renderRateBar()}

          {/* ALL */}
          {selectedType === "all" && (
            <>
              {this.renderAllOverview()}

              <div className="category-section-title">
                <span>
                  COLLECTIONS
                </span>

                <h2>
                  Gold & Silver Stock
                </h2>
              </div>

              <div className="inventory-category-grid">
                {this.renderGoldCard(
                  "KDM Gold",
                  kdmItems,
                  rates.gold_rate,
                  "kdm-category-card"
                )}

                {this.renderGoldCard(
                  "Hallmark Gold",
                  hallmarkItems,
                  rates.hallmark_rate,
                  "hallmark-category-card"
                )}

                {this.renderSilverCard()}
              </div>
            </>
          )}

          {/* KDM */}
          {selectedType === "kdm" && (
            <div className="single-category-layout">
              {this.renderGoldCard(
                "KDM Gold",
                kdmItems,
                rates.gold_rate,
                "kdm-category-card"
              )}
            </div>
          )}

          {/* HALLMARK */}
          {selectedType === "hallmark" && (
            <div className="single-category-layout">
              {this.renderGoldCard(
                "Hallmark Gold",
                hallmarkItems,
                rates.hallmark_rate,
                "hallmark-category-card"
              )}
            </div>
          )}

          {/* SILVER */}
          {selectedType === "silver" && (
            <div className="single-category-layout">
              {this.renderSilverCard()}
            </div>
          )}

          {/* ITEM REGISTER */}
          {this.renderItemTable()}
        </div>
      </div>
    );
  }
}

export default Inventory;