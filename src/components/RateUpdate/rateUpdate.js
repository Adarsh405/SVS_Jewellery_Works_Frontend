import { Component } from 'react'
import './rateUpdate.css'

class RateUpdate extends Component {
  state = {
    goldRate: '',
    hallmarkRate: '',
    silverRate: '',

    loading: true,
    saving: false,

    message: '',
    error: '',
  }

  componentDidMount() {
    this.getRates()
  }

  // ==========================================
  // GET CURRENT RATES
  // ==========================================

  getRates = async () => {
    try {
      const response = await fetch(
        'https://svs-jewellery-works-backend.onrender.com/api/rates'
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to get rates'
        )
      }

      this.setState({
        goldRate: String(
          Math.trunc(Number(data.data.gold_rate))
        ),

        hallmarkRate: String(
          Math.trunc(Number(data.data.hallmark_rate))
        ),

        silverRate: String(
          Math.trunc(Number(data.data.silver_rate))
        ),

        loading: false,
        error: '',
      })
    } catch (error) {
      console.error('Get rates error:', error)

      this.setState({
        loading: false,
        error: 'Unable to load current rates',
      })
    }
  }

  // ==========================================
  // INTEGER ONLY
  // ==========================================

  isIntegerValue = value => {
    return /^\d*$/.test(value)
  }

  // ==========================================
  // KDM GOLD RATE
  // ==========================================

  onChangeGoldRate = event => {
    const value = event.target.value

    if (!this.isIntegerValue(value)) {
      return
    }

    this.setState({
      goldRate: value,
      message: '',
      error: '',
    })
  }

  // ==========================================
  // HALLMARK GOLD RATE
  // ==========================================

  onChangeHallmarkRate = event => {
    const value = event.target.value

    if (!this.isIntegerValue(value)) {
      return
    }

    this.setState({
      hallmarkRate: value,
      message: '',
      error: '',
    })
  }

  // ==========================================
  // SILVER RATE
  // ==========================================

  onChangeSilverRate = event => {
    const value = event.target.value

    if (!this.isIntegerValue(value)) {
      return
    }

    this.setState({
      silverRate: value,
      message: '',
      error: '',
    })
  }

  // ==========================================
  // UPDATE RATES
  // ==========================================

  updateRates = async event => {
    event.preventDefault()

    const {
      goldRate,
      hallmarkRate,
      silverRate,
    } = this.state

    // ========================================
    // EMPTY CHECK
    // ========================================

    if (
      goldRate.trim() === '' ||
      hallmarkRate.trim() === '' ||
      silverRate.trim() === ''
    ) {
      this.setState({
        error: 'Please enter all rates',
        message: '',
      })

      return
    }

    // ========================================
    // CONVERT TO NUMBERS
    // ========================================

    const gold = Number(goldRate)
    const hallmark = Number(hallmarkRate)
    const silver = Number(silverRate)

    // ========================================
    // INTEGER CHECK
    // ========================================

    if (
      !Number.isInteger(gold) ||
      !Number.isInteger(hallmark) ||
      !Number.isInteger(silver)
    ) {
      this.setState({
        error: 'Rates must contain only whole numbers',
        message: '',
      })

      return
    }

    // ========================================
    // KDM GOLD > 12000
    // ========================================

    if (gold <= 12000) {
      this.setState({
        error:
          'KDM Gold rate must be greater than ₹12,000',
        message: '',
      })

      return
    }

    // ========================================
    // HALLMARK GOLD > 12000
    // ========================================

    if (hallmark <= 12000) {
      this.setState({
        error:
          'HallMark Gold rate must be greater than ₹12,000',
        message: '',
      })

      return
    }

    // ========================================
    // SILVER > 180
    // ========================================

    if (silver <= 180) {
      this.setState({
        error:
          'Silver rate must be greater than ₹180',
        message: '',
      })

      return
    }

    // ========================================
    // CONFIRMATION
    // ========================================

    const confirmed = window.confirm(
      `Are you sure you want to update the rates?\n\n` +
        `KDM Gold: ₹${gold.toLocaleString('en-IN')}\n` +
        `HallMark Gold: ₹${hallmark.toLocaleString(
          'en-IN'
        )}\n` +
        `Silver: ₹${silver.toLocaleString('en-IN')}`
    )

    if (!confirmed) {
      return
    }

    // ========================================
    // START SAVING
    // ========================================

    this.setState({
      saving: true,
      message: '',
      error: '',
    })

    // ========================================
    // UPDATE DATABASE
    // ========================================

    try {
      const response = await fetch(
        'https://svs-jewellery-backend.onrender.com/api/rates',
        {
          method: 'PUT',

          headers: {
            'Content-Type': 'application/json',
          },

          // Send HttpOnly JWT cookie
          credentials: 'include',

          body: JSON.stringify({
            gold_rate: gold,
            hallmark_rate: hallmark,
            silver_rate: silver,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'Failed to update rates'
        )
      }

      // ========================================
      // UPDATE FRONTEND STATE
      // ========================================

      this.setState({
        goldRate: String(
          Math.trunc(
            Number(data.data.gold_rate)
          )
        ),

        hallmarkRate: String(
          Math.trunc(
            Number(data.data.hallmark_rate)
          )
        ),

        silverRate: String(
          Math.trunc(
            Number(data.data.silver_rate)
          )
        ),

        saving: false,

        message:
          'Rates updated successfully ✓',

        error: '',
      })
    } catch (error) {
      console.error(
        'Update rates error:',
        error
      )

      this.setState({
        saving: false,

        error:
          error.message ||
          'Unable to update rates',
      })
    }
  }

  // ==========================================
  // RENDER
  // ==========================================

  render() {
    const {
      goldRate,
      hallmarkRate,
      silverRate,
      loading,
      saving,
      message,
      error,
    } = this.state

    // ========================================
    // LOADING
    // ========================================

    if (loading) {
      return (
        <div className="rate-page">
          <div className="rate-loading">
            Loading current rates...
          </div>
        </div>
      )
    }

    return (
      <div className="rate-page">
        <div className="rate-card">

          {/* HEADER */}

          <div className="rate-header">
            <div>
              <span className="rate-small-title">
                SVS JEWELLERY
              </span>

              <h1>
                Gold & Silver Rates
              </h1>

              <p>
                Update today's jewellery rates
              </p>
            </div>

            <div className="rate-icon">
              ₹
            </div>
          </div>

          {/* FORM */}

          <form onSubmit={this.updateRates}>

            {/* KDM GOLD */}

            <div className="rate-input-group">

              <label>
                KDM Gold Rate
              </label>

              <div className="rate-input-wrapper">

                <span>₹</span>

                <input
                  type="text"
                  inputMode="numeric"
                  value={goldRate}
                  onChange={
                    this.onChangeGoldRate
                  }
                  placeholder="Enter KDM gold rate"
                  disabled={saving}
                />

                <small>
                  / gram
                </small>

              </div>

              <div className="rate-hint">
                Must be greater than ₹12,000
              </div>

            </div>

            {/* HALLMARK GOLD */}

            <div className="rate-input-group">

              <label>
                HallMark Gold Rate
              </label>

              <div className="rate-input-wrapper">

                <span>₹</span>

                <input
                  type="text"
                  inputMode="numeric"
                  value={hallmarkRate}
                  onChange={
                    this.onChangeHallmarkRate
                  }
                  placeholder="Enter HallMark gold rate"
                  disabled={saving}
                />

                <small>
                  / gram
                </small>

              </div>

              <div className="rate-hint">
                Must be greater than ₹12,000
              </div>

            </div>

            {/* SILVER */}

            <div className="rate-input-group">

              <label>
                Silver Rate
              </label>

              <div className="rate-input-wrapper">

                <span>₹</span>

                <input
                  type="text"
                  inputMode="numeric"
                  value={silverRate}
                  onChange={
                    this.onChangeSilverRate
                  }
                  placeholder="Enter silver rate"
                  disabled={saving}
                />

                <small>
                  / gram
                </small>

              </div>

              <div className="rate-hint">
                Must be greater than ₹180
              </div>

            </div>

            {/* SUCCESS */}

            {message && (
              <div className="rate-success">
                {message}
              </div>
            )}

            {/* ERROR */}

            {error && (
              <div className="rate-error">
                {error}
              </div>
            )}

            {/* UPDATE BUTTON */}

            <button
              type="submit"
              className="rate-update-button"
              disabled={saving}
            >
              {saving
                ? 'UPDATING...'
                : 'UPDATE RATES'}
            </button>

          </form>

          {/* FOOTER */}

          <div className="rate-footer">
            🔒 Admin access required
          </div>

        </div>
      </div>
    )
  }
}

export default RateUpdate