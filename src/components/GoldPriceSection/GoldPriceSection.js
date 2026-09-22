import {Component} from 'react'
import './GoldPriceSection.css'
import HallmarkImage from './Hallmark.png'
import kdmImage from './Kdm.png'

const API_URL =
  'https://svs-jewellery-works-backend.onrender.com/api/rates'

class GoldPriceSection extends Component {
  state = {
    loading: true,
    apiSuccess: false,

    goldRate: 0,
    hallmarkRate: 0,

    selectedRate: 'hallmark',

    weight: '',
    result: null,

    isFocused: true,
  }

  inputRef = null

  componentDidMount() {
    this.fetchRates()

    document.addEventListener(
      'click',
      this.handlePageClick,
    )
  }

  componentWillUnmount() {
    document.removeEventListener(
      'click',
      this.handlePageClick,
    )
  }

  // =========================================================
  // FETCH RATES
  // =========================================================

  fetchRates = async () => {
    try {
      const response = await fetch(API_URL)
      const data = await response.json()

      if (data.success) {
        this.setState({
          loading: false,
          apiSuccess: true,

          goldRate: Number(data.data.gold_rate),

          hallmarkRate: Number(
            data.data.hallmark_rate,
          ),
        })
      } else {
        this.setState({
          loading: false,
          apiSuccess: false,
        })
      }
    } catch (error) {
      console.error(
        'Error fetching gold rates:',
        error,
      )

      this.setState({
        loading: false,
        apiSuccess: false,
      })
    }
  }

  // =========================================================
  // PAGE CLICK
  // =========================================================

  handlePageClick = event => {
    if (
      event.target.closest(
        '.gold-rate-button',
      )
    ) {
      return
    }

    this.setState({
      isFocused: true,
    })

    setTimeout(() => {
      if (this.inputRef) {
        this.inputRef.focus()
      }
    }, 0)
  }

  // =========================================================
  // INPUT CHANGE
  // =========================================================

  handleInputChange = event => {
    const value = event.target.value

    if (/^\d*\.?\d*$/.test(value)) {
      this.setState({
        weight: value,
        isFocused: true,
      })
    }
  }

  // =========================================================
  // ENTER KEY
  // =========================================================

  handleInputKeyDown = event => {
    if (event.key === 'Enter') {
      event.preventDefault()

      this.calculatePrice()
    }
  }

  // =========================================================
  // INPUT BLUR
  // =========================================================

  handleInputBlur = () => {
    this.setState({
      isFocused: false,
    })
  }

  // =========================================================
  // CHANGE GOLD TYPE
  // =========================================================

  handleRateChange = rate => {
    this.setState(
      {
        selectedRate: rate,
        result: null,
        isFocused: true,
      },
      () => {
        if (this.inputRef) {
          this.inputRef.focus()
        }
      },
    )
  }

  // =========================================================
  // CALCULATE
  // =========================================================

  calculatePrice = () => {
    const {
      weight,
      selectedRate,
      goldRate,
      hallmarkRate,
    } = this.state

    const enteredWeight = Number(weight)

    if (
      !enteredWeight ||
      enteredWeight <= 0
    ) {
      if (this.inputRef) {
        this.inputRef.focus()
      }

      return
    }

    let makingCost = 0

    if (enteredWeight < 10) {
      makingCost = 1000
    } else if (enteredWeight <= 18) {
      makingCost = 2000
    } else {
      makingCost = 3000
    }

    const currentRate =
      selectedRate === 'hallmark'
        ? hallmarkRate
        : goldRate

    const goldValue =
      enteredWeight * currentRate

    const finalPrice =
      goldValue + makingCost

    this.setState(
      {
        result: {
          weight: enteredWeight,
          makingCost,
          currentRate,
          goldValue,
          price: finalPrice,
        },

        weight: '',

        isFocused: true,
      },
      () => {
        if (this.inputRef) {
          this.inputRef.focus()
        }
      },
    )
  }

  // =========================================================
  // FORMAT
  // =========================================================

  formatNumber = number => {
    return Number(number).toLocaleString(
      'en-IN',
      {
        maximumFractionDigits: 2,
      },
    )
  }

  // =========================================================
  // JEWELLERY IMAGE
  // =========================================================

  getJewelleryImage = () => {
    const {selectedRate} = this.state

    // Hallmark selected → Hallmark.png
    // KDM selected → Kdm.png

    return selectedRate === 'hallmark'
      ? HallmarkImage
      : kdmImage
  }

  // =========================================================
  // IMAGE ALT
  // =========================================================

  getImageAlt = () => {
    const {selectedRate} = this.state

    return selectedRate === 'hallmark'
      ? 'Hallmark Gold Jewellery'
      : 'KDM Gold Jewellery'
  }

  // =========================================================
  // BRANDING BACKGROUND
  // =========================================================

  renderBrandingBackground() {
    const {selectedRate} = this.state

    const isHallmark =
      selectedRate === 'hallmark'

    return (
      <div
        className={
          isHallmark
            ? 'branding-background hallmark-branding'
            : 'branding-background kdm-branding'
        }
      >
        {/* MAIN WATERMARK */}

        <div className="main-brand-watermark">
          <div className="watermark-symbol">
            {isHallmark ? '✦' : '◆'}
          </div>

          <div className="watermark-title">
            {isHallmark
              ? 'HALLMARK'
              : 'KDM'}
          </div>

          <div className="watermark-subtitle">
            {isHallmark
              ? 'CERTIFIED GOLD'
              : 'TRADITIONAL GOLD'}
          </div>

          <div className="watermark-shop">
            SVS JEWELLERY
          </div>
        </div>

        {/* FLOATING MARK 1 */}

        <div className="floating-brand brand-one">
          {isHallmark
            ? 'HALLMARK'
            : 'KDM'}
        </div>

        {/* FLOATING MARK 2 */}

        <div className="floating-brand brand-two">
          {isHallmark
            ? '✦'
            : '◆'}
        </div>

        {/* FLOATING MARK 3 */}

        <div className="floating-brand brand-three">
          {isHallmark
            ? '916'
            : 'KDM'}
        </div>

        {/* FLOATING MARK 4 */}

        <div className="floating-brand brand-four">
          {isHallmark
            ? '✦'
            : '◆'}
        </div>

        {/* FLOATING MARK 5 */}

        <div className="floating-brand brand-five">
          {isHallmark
            ? 'H'
            : 'K'}
        </div>

        {/* GOLD RINGS */}

        <div className="branding-ring ring-one" />

        <div className="branding-ring ring-two" />

        <div className="branding-ring ring-three" />
      </div>
    )
  }

  // =========================================================
  // LOADING
  // =========================================================

  renderLoading() {
    return (
      <div className="gold-loading">
        <div className="gold-svs-loader">
          <span>SVS</span>
        </div>

        <div className="gold-loading-text">
          Loading Rates
        </div>
      </div>
    )
  }

  // =========================================================
  // ERROR
  // =========================================================

  renderError() {
    return (
      <div className="gold-error">
        <div className="gold-error-logo">
          SVS
        </div>

        <div className="gold-error-title">
          Unable to load gold rates
        </div>

        <div className="gold-error-subtitle">
          Please check your internet connection
        </div>

        <button
          className="gold-retry"
          onClick={this.fetchRates}
        >
          Retry
        </button>
      </div>
    )
  }

  // =========================================================
  // RENDER
  // =========================================================

  render() {
    const {
      loading,
      apiSuccess,
      selectedRate,
      weight,
      result,
      isFocused,
      hallmarkRate,
      goldRate,
    } = this.state

    if (loading) {
      return this.renderLoading()
    }

    if (!apiSuccess) {
      return this.renderError()
    }

    const currentRate =
      selectedRate === 'hallmark'
        ? hallmarkRate
        : goldRate

    return (
      <div
        className={`
          gold-page
          ${
            isFocused
              ? 'gold-focused'
              : 'gold-unfocused'
          }
          ${
            selectedRate === 'kdm'
              ? 'kdm-theme'
              : 'hallmark-theme'
          }
        `}
      >
        {/* =================================================
            BRANDING BACKGROUND
        ================================================= */}

        {this.renderBrandingBackground()}

        {/* =================================================
            DECORATIVE LIGHT
        ================================================= */}

        <div className="gold-decoration gold-decoration-one" />

        <div className="gold-decoration gold-decoration-two" />

        {/* =================================================
            TOP
        ================================================= */}

        <div className="gold-top">

          {/* LEFT CONTROLS */}

          <div className="gold-controls">

            <div className="gold-section-label">
              <span className="label-line" />

              GOLD TYPE

              <span className="label-line" />
            </div>

            <div className="gold-rate-buttons">

              {/* HALLMARK */}

              <button
                type="button"
                className={`
                  gold-rate-button
                  hallmark-button
                  ${
                    selectedRate ===
                    'hallmark'
                      ? 'active'
                      : ''
                  }
                `}
                onClick={() =>
                  this.handleRateChange(
                    'hallmark',
                  )
                }
              >
                <span className="button-symbol">
                  ✦
                </span>

                <span>
                  Hallmark
                </span>
              </button>

              {/* KDM */}

              <button
                type="button"
                className={`
                  gold-rate-button
                  kdm-button
                  ${
                    selectedRate === 'kdm'
                      ? 'active'
                      : ''
                  }
                `}
                onClick={() =>
                  this.handleRateChange(
                    'kdm',
                  )
                }
              >
                <span className="button-symbol">
                  ◆
                </span>

                <span>
                  KDM
                </span>
              </button>

            </div>
          </div>

          {/* RIGHT IMAGE */}

          <div className="gold-image-wrapper">

            <div className="image-premium-label">
              <span />

              {selectedRate ===
              'hallmark'
                ? 'HALLMARK'
                : 'KDM'}
            </div>

            <div className="gold-image-box">

              <img
                key={selectedRate}
                src={this.getJewelleryImage()}
                alt={this.getImageAlt()}
              />

              <div className="image-bottom-label">
                SVS JEWELLERY
              </div>

            </div>
          </div>
        </div>

        {/* =================================================
            INPUT
        ================================================= */}

        <div className="gold-input-area">

          <div className="input-heading">
            <span />

            ENTER JEWELLERY WEIGHT

            <span />
          </div>

          <div className="gold-input-box">

            <div className="input-symbol">
              ◆
            </div>

            <input
              ref={element =>
                (this.inputRef = element)
              }
              autoFocus
              type="text"
              inputMode="decimal"
              value={weight}
              placeholder="Enter Weight"
              onChange={
                this.handleInputChange
              }
              onKeyDown={
                this.handleInputKeyDown
              }
              onBlur={
                this.handleInputBlur
              }
            />

            <span className="input-unit">
              grams
            </span>
          </div>

          <div className="input-hint">
            Press <strong>ENTER</strong> to
            calculate
          </div>
        </div>

        {/* =================================================
            RESULT
        ================================================= */}

        {result && (
          <div className="gold-result">

            <div className="gold-result-card">

              <div className="result-icon">
                ⚖
              </div>

              <span>
                WEIGHT
              </span>

              <strong>
                {this.formatNumber(
                  result.weight,
                )}

                <small>
                  {' '}
                  g
                </small>
              </strong>

            </div>

            <div className="gold-result-card">

              <div className="result-icon">
                ✦
              </div>

              <span>
                MAKING COST
              </span>

              <strong>
                ₹
                {this.formatNumber(
                  result.makingCost,
                )}
              </strong>

            </div>

            <div
              className="
                gold-result-card
                gold-price-card
              "
            >
              <div className="result-icon">
                ₹
              </div>

              <span>
                FINAL PRICE
              </span>

              <strong>
                ₹
                {this.formatNumber(
                  result.price,
                )}
              </strong>
            </div>

          </div>
        )}

        {/* =================================================
            LIVE RATE
        ================================================= */}

        <div className="gold-current-rate">

          <span className="live-dot" />

          <span className="live-text">
            LIVE RATE
          </span>

          <span className="rate-divider" />

          <strong>
            ₹
            {this.formatNumber(
              currentRate,
            )}

            <small>
              / gram
            </small>
          </strong>

          <span className="rate-type">
            {selectedRate === 'hallmark'
              ? 'HALLMARK'
              : 'KDM'}
          </span>

        </div>

        {/* =================================================
            BRAND
        ================================================= */}

        <div className="gold-brand">
          SVS JEWELLERY
        </div>

      </div>
    )
  }
}

export default GoldPriceSection