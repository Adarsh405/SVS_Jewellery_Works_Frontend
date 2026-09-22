import "./PriceCalculater.css";
import { Component, createRef } from "react";

const API_URL =
  "https://svs-jewellery-works-backend.onrender.com/api/rates";

class PriceCalculater extends Component {
  constructor(props) {
    super(props);

    this.state = {
      rates: null,
      loading: true,
      selectedType: null,
      rateType: "hallmark",
      weight: "",
      result: null,
      apiError: false,
    };

    this.inputRef = createRef();
  }

  componentDidMount() {
    this.fetchRates();
  }

  fetchRates = async () => {
    try {
      this.setState({
        loading: true,
        apiError: false,
      });

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const result = await response.json();

      if (
        result.success &&
        result.data &&
        result.data.gold_rate &&
        result.data.hallmark_rate &&
        result.data.silver_rate
      ) {
        this.setState({
          rates: result.data,
          loading: false,
          apiError: false,
        });
      } else {
        throw new Error("Invalid rate data");
      }
    } catch (error) {
      console.error("Rate API Error:", error);

      this.setState({
        rates: null,
        loading: false,
        apiError: true,
      });
    }
  };

  focusInput = () => {
    setTimeout(() => {
      if (this.inputRef.current) {
        this.inputRef.current.focus();
      }
    }, 100);
  };

  selectType = (type) => {
    this.setState(
      {
        selectedType: type,
        weight: "",
        result: null,
        rateType: "hallmark",
      },
      this.focusInput
    );
  };

  selectRate = (rateType) => {
    this.setState(
      {
        rateType,
        result: null,
      },
      this.focusInput
    );
  };

  handleWeightChange = (event) => {
    const value = event.target.value;

    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      this.setState({
        weight: value,
      });
    }
  };

  calculateGold = () => {
    const { rates, weight, rateType } = this.state;

    if (!rates) return;

    const parsedWeight = parseFloat(weight);

    if (!parsedWeight || parsedWeight <= 0) {
      this.focusInput();
      return;
    }

    const currentRate =
      rateType === "kdm"
        ? parseFloat(rates.gold_rate)
        : parseFloat(rates.hallmark_rate);

    let makingCost = 0;

    if (parsedWeight < 10) {
      makingCost = 1000;
    } else if (parsedWeight <= 18) {
      makingCost = 2000;
    } else {
      makingCost = 3000;
    }

    const goldValue = parsedWeight * currentRate;
    const totalPrice = goldValue + makingCost;

    this.setState(
      {
        result: {
          type: "gold",
          weight: parsedWeight,
          rate: currentRate,
          goldValue,
          makingCost,
          totalPrice,
          rateName:
            rateType === "kdm"
              ? "KDM Gold Rate"
              : "Hallmark Gold Rate",
        },

        weight: "",
      },
      this.focusInput
    );
  };

  calculateSilver = () => {
    const { rates, weight } = this.state;

    if (!rates) return;

    const totalWeight = parseFloat(weight);

    if (!totalWeight || totalWeight <= 0) {
      this.focusInput();
      return;
    }

    const percentage = 60;

    const calculatedWeight =
      totalWeight * (percentage / 100);

    const silverRate = parseFloat(rates.silver_rate);

    const totalPrice = calculatedWeight * silverRate;

    this.setState(
      {
        result: {
          type: "silver",
          totalWeight,
          percentage,
          calculatedWeight,
          rate: silverRate,
          totalPrice,
        },

        weight: "",
      },
      this.focusInput
    );
  };

  handleKeyDown = (event) => {
    if (event.key !== "Enter") return;

    event.preventDefault();

    const { selectedType } = this.state;

    if (selectedType === "gold") {
      this.calculateGold();
    }

    if (selectedType === "silver") {
      this.calculateSilver();
    }
  };

  formatMoney = (value) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);
  };

  renderLoading = () => {
    return (
      <div className="price-calculator-page loading-page">
        <div className="price-loader">
          <div className="loader-ring"></div>

          <div className="svs-loader-logo">
            <span>SVS</span>
          </div>
        </div>
      </div>
    );
  };

  renderError = () => {
    return (
      <div className="price-calculator-page loading-page">
        <div className="api-error-box">
          <div className="error-logo">SVS</div>

          <h2>Unable to load rates</h2>

          <button
            className="retry-button"
            onClick={this.fetchRates}
          >
            TRY AGAIN
          </button>
        </div>
      </div>
    );
  };

  renderGold = () => {
    const {
      rates,
      rateType,
      weight,
      result,
    } = this.state;

    if (!rates) return null;

    const currentRate =
      rateType === "kdm"
        ? Number(rates.gold_rate)
        : Number(rates.hallmark_rate);

    return (
      <div className="calculator-content">
        <div className="calculator-left">

          <div className="section-heading">
            <div className="heading-icon">
              ✦
            </div>

            <div>
              <h2>Gold Price Calculator</h2>
              <p>
                Enter weight and press ENTER
              </p>
            </div>
          </div>

          <div className="weight-input-card">
            <label>GOLD WEIGHT</label>

            <div className="weight-input-wrapper">
              <input
                ref={this.inputRef}
                type="text"
                inputMode="decimal"
                value={weight}
                onChange={this.handleWeightChange}
                onKeyDown={this.handleKeyDown}
                placeholder="0.00"
                autoFocus
              />

              <span>grams</span>
            </div>

            <div className="enter-hint">
              Press <strong>ENTER</strong> to calculate
            </div>
          </div>

          <div className="rate-selector">

            <button
              type="button"
              className={`rate-option ${
                rateType === "hallmark"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                this.selectRate("hallmark")
              }
            >
              <span className="rate-radio">
                {rateType === "hallmark" ? "✓" : ""}
              </span>

              <div>
                <small>HALLMARK</small>

                <strong>
                  ₹
                  {this.formatMoney(
                    rates.hallmark_rate
                  )}
                </strong>
              </div>
            </button>

            <button
              type="button"
              className={`rate-option ${
                rateType === "kdm"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                this.selectRate("kdm")
              }
            >
              <span className="rate-radio">
                {rateType === "kdm" ? "✓" : ""}
              </span>

              <div>
                <small>KDM GOLD</small>

                <strong>
                  ₹
                  {this.formatMoney(
                    rates.gold_rate
                  )}
                </strong>
              </div>
            </button>

          </div>

          <div className="current-rate-box">
            <div>
              <span>
                CURRENT CALCULATED RATE
              </span>

              <small className="rate-name">
                {rateType === "kdm"
                  ? "KDM GOLD"
                  : "HALLMARK"}
              </small>
            </div>

            <strong>
              ₹{this.formatMoney(currentRate)}
              <small>/ gram</small>
            </strong>
          </div>

        </div>

        <div className="calculator-right">

          <div className="jewellery-image-card">
            <img
              src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1000&q=85"
              alt="Gold Necklace"
            />

            <div className="image-overlay">
              <span>SVS JEWELLERY</span>
              <strong>GOLD</strong>
            </div>
          </div>

          {result && (
            <div className="result-card">

              <div className="result-title">
                <span>
                  CALCULATED PRICE
                </span>

                <div className="success-check">
                  ✓
                </div>
              </div>

              <div className="main-price">
                ₹
                {this.formatMoney(
                  result.totalPrice
                )}
              </div>

              <div className="result-grid">

                <div>
                  <small>WEIGHT</small>
                  <strong>
                    {result.weight} g
                  </strong>
                </div>

                <div>
                  <small>RATE</small>
                  <strong>
                    ₹
                    {this.formatMoney(
                      result.rate
                    )}
                  </strong>
                </div>

                <div>
                  <small>GOLD VALUE</small>
                  <strong>
                    ₹
                    {this.formatMoney(
                      result.goldValue
                    )}
                  </strong>
                </div>

                <div>
                  <small>MAKING COST</small>
                  <strong>
                    ₹
                    {this.formatMoney(
                      result.makingCost
                    )}
                  </strong>
                </div>

              </div>

              <div className="result-footer">
                <span>
                  {result.rateName}
                </span>

                <strong>
                  ₹
                  {this.formatMoney(
                    result.totalPrice
                  )}
                </strong>
              </div>

            </div>
          )}

        </div>
      </div>
    );
  };

  renderSilver = () => {
    const {
      rates,
      weight,
      result,
    } = this.state;

    if (!rates) return null;

    return (
      <div className="calculator-content">

        <div className="calculator-left">

          <div className="section-heading">

            <div className="heading-icon silver-icon">
              ✦
            </div>

            <div>
              <h2>
                Old Silver Calculator
              </h2>

              <p>
                Enter weight and press ENTER
              </p>
            </div>

          </div>

          <div className="weight-input-card silver-input-card">

            <label>
              OLD SILVER WEIGHT
            </label>

            <div className="weight-input-wrapper">

              <input
                ref={this.inputRef}
                type="text"
                inputMode="decimal"
                value={weight}
                onChange={this.handleWeightChange}
                onKeyDown={this.handleKeyDown}
                placeholder="0.00"
                autoFocus
              />

              <span>grams</span>

            </div>

            <div className="enter-hint">
              Press <strong>ENTER</strong> to calculate
            </div>

          </div>

          <div className="silver-rate-box">

            <div>
              <span>
                CURRENT SILVER RATE
              </span>

              <small className="rate-name silver-rate-name">
                SILVER
              </small>
            </div>

            <strong>
              ₹
              {this.formatMoney(
                rates.silver_rate
              )}

              <small>
                / gram
              </small>
            </strong>

          </div>

        </div>

        <div className="calculator-right">

          <div className="jewellery-image-card silver-image">

            <img
              src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1000&q=85"
              alt="Silver Jewellery"
            />

            <div className="image-overlay">
              <span>
                SVS JEWELLERY
              </span>

              <strong>
                OLD SILVER
              </strong>
            </div>

          </div>

          {result && (
            <div className="result-card silver-result">

              <div className="result-title">
                <span>
                  CALCULATED PRICE
                </span>

                <div className="success-check">
                  ✓
                </div>
              </div>

              <div className="main-price">
                ₹
                {this.formatMoney(
                  result.totalPrice
                )}
              </div>

              <div className="silver-details">

                <div className="silver-detail">
                  <span>
                    TOTAL WEIGHT
                  </span>

                  <strong>
                    {result.totalWeight} g
                  </strong>
                </div>

                <div className="percentage-detail">
                  <span>
                    PERCENTAGE
                  </span>

                  <strong>
                    {result.percentage}%
                  </strong>
                </div>

                <div className="silver-detail highlight">
                  <span>
                    AFTER 60%
                  </span>

                  <strong>
                    {result.calculatedWeight.toFixed(
                      2
                    )} g
                  </strong>
                </div>

                <div className="silver-detail">
                  <span>
                    SILVER RATE
                  </span>

                  <strong>
                    ₹
                    {this.formatMoney(
                      result.rate
                    )}
                  </strong>
                </div>

              </div>

              <div className="silver-formula">

                <span>
                  {result.calculatedWeight.toFixed(
                    2
                  )} g × ₹
                  {this.formatMoney(
                    result.rate
                  )}
                </span>

                <strong>
                  ₹
                  {this.formatMoney(
                    result.totalPrice
                  )}
                </strong>

              </div>

            </div>
          )}

        </div>

      </div>
    );
  };

  render() {
    const {
      loading,
      apiError,
      rates,
      selectedType,
    } = this.state;

    /*
      IMPORTANT:
      Never render calculator content until
      valid API data exists.
    */

    if (loading || !rates) {
      if (apiError) {
        return this.renderError();
      }

      return this.renderLoading();
    }

    return (
      <div className="price-calculator-page">

        <div className="calculator-top">

          <button
            type="button"
            className={`type-button ${
              selectedType === "gold"
                ? "selected"
                : ""
            }`}
            onClick={() =>
              this.selectType("gold")
            }
          >
            <span className="button-symbol">
              ♢
            </span>

            GOLD
          </button>

          <button
            type="button"
            className={`type-button ${
              selectedType === "silver"
                ? "selected"
                : ""
            }`}
            onClick={() =>
              this.selectType("silver")
            }
          >
            <span className="button-symbol">
              ◇
            </span>

            OLD-SILVER
          </button>

        </div>

        {selectedType === "gold" &&
          this.renderGold()}

        {selectedType === "silver" &&
          this.renderSilver()}

      </div>
    );
  }
}

export default PriceCalculater;