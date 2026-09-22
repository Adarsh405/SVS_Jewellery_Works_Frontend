import {Component} from 'react'
import './OldSilverPriceSection.css'

const API_URL =
    'https://svs-jewellery-works-backend.onrender.com/api/rates'

class OldSilverPriceSection extends Component {
    state = {
        loading: true,
        apiSuccess: false,
        silverRate: 0,
        weight: '',
        result: null,
        isFocused: true,
    }

    inputRef = null

    componentDidMount() {
        this.fetchRates()
        document.addEventListener('click', this.handlePageClick)
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handlePageClick)
    }

    fetchRates = async () => {
        try {
            const response = await fetch(API_URL)
            const data = await response.json()

            if (data.success) {
                this.setState({
                    loading: false,
                    apiSuccess: true,
                    silverRate: Number(data.data.silver_rate),
                })
            } else {
                this.setState({
                    loading: false,
                    apiSuccess: false,
                })
            }
        } catch (error) {
            console.error(error)

            this.setState({
                loading: false,
                apiSuccess: false,
            })
        }
    }

    handlePageClick = () => {
        this.setState({
            isFocused: true,
        })

        setTimeout(() => {
            if (this.inputRef) {
                this.inputRef.focus()
            }
        }, 0)
    }

    handleInputChange = event => {
        const value = event.target.value

        if (/^\d*\.?\d*$/.test(value)) {
            this.setState({
                weight: value,
                isFocused: true,
            })
        }
    }

    handleInputKeyDown = event => {
        if (event.key === 'Enter') {
            event.preventDefault()
            this.calculatePrice()
        }
    }

    handleInputBlur = () => {
        this.setState({
            isFocused: false,
        })
    }

    calculatePrice = () => {
        const {weight, silverRate} = this.state

        const totalWeight = Number(weight)

        if (!totalWeight || totalWeight <= 0) {
            if (this.inputRef) {
                this.inputRef.focus()
            }
            return
        }

        const calculatedWeight = totalWeight * 0.6

        const price = calculatedWeight * silverRate

        this.setState(
            {
                result: {
                    totalWeight,
                    calculatedWeight,
                    price,
                    currentRate: silverRate,
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

    formatNumber = number => {
        return Number(number).toLocaleString('en-IN', {
            maximumFractionDigits: 2,
        })
    }

    renderFloatingParticles() {
        return (
            <div className="silver-particles">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
            </div>
        )
    }

    renderLuxuryBackground() {
        return (
            <div className="silver-background-effects">
                <div className="silver-aurora silver-aurora-one"></div>
                <div className="silver-aurora silver-aurora-two"></div>
                <div className="silver-aurora silver-aurora-three"></div>

                <div className="silver-light-orb silver-orb-one"></div>
                <div className="silver-light-orb silver-orb-two"></div>
                <div className="silver-light-orb silver-orb-three"></div>

                <div className="silver-ring silver-ring-one"></div>
                <div className="silver-ring silver-ring-two"></div>

                <div className="silver-shine-line silver-shine-one"></div>
                <div className="silver-shine-line silver-shine-two"></div>
            </div>
        )
    }

    renderLoading() {
        return (
            <div className="silver-loading">
                <div className="silver-loading-orbit">
                    <div className="silver-loading-ring"></div>

                    <div className="silver-svs-loader">
                        SVS
                    </div>
                </div>

                <div className="silver-loading-text">
                    Loading Silver Rates
                </div>

                <div className="silver-loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        )
    }

    renderError() {
        return (
            <div className="silver-error">
                <div className="silver-error-logo">
                    SVS
                </div>

                <div className="silver-error-text">
                    Unable to load silver rate
                </div>

                <button
                    className="silver-retry"
                    onClick={this.fetchRates}
                >
                    Retry
                </button>
            </div>
        )
    }

    render() {
        const {
            loading,
            apiSuccess,
            weight,
            result,
            isFocused,
            silverRate,
        } = this.state

        if (loading) {
            return this.renderLoading()
        }

        if (!apiSuccess) {
            return this.renderError()
        }

        return (
            <div
                className={
                    isFocused
                        ? 'silver-page silver-focused'
                        : 'silver-page silver-unfocused'
                }
            >
                {this.renderLuxuryBackground()}
                {this.renderFloatingParticles()}

                {/* =================================================
                    TOP
                ================================================= */}

                <div className="silver-top">
                    <div className="silver-title-wrapper">
                        <div className="silver-title-button">
                            <span className="silver-title-icon">
                                ✦
                            </span>

                            <span>Old-Silver</span>

                            <span className="silver-title-sparkle">
                                ✦
                            </span>
                        </div>

                        <div className="silver-title-line"></div>
                    </div>

                    <div className="silver-image-wrapper">
                        <div className="silver-image-glow"></div>

                        <div className="silver-image-box">
                            <img
                                src="https://tse3.mm.bing.net/th/id/OIP.TuyCbJAF-BENDqLJBs-60AHaF_?r=0&pid=Api&h=220&P=0"
                                alt="Silver Jewellery"
                            />

                            <div className="silver-image-shine"></div>
                        </div>
                    </div>
                </div>

                {/* =================================================
                    INPUT
                ================================================= */}

                <div className="silver-input-area">
                    <div className="silver-input-aura"></div>

                    <div className="silver-input-box">
                        <div className="silver-input-corner corner-one"></div>
                        <div className="silver-input-corner corner-two"></div>
                        <div className="silver-input-corner corner-three"></div>
                        <div className="silver-input-corner corner-four"></div>

                        <div className="silver-input-shimmer"></div>

                        <input
                            ref={element =>
                                (this.inputRef = element)
                            }
                            autoFocus
                            type="text"
                            inputMode="decimal"
                            value={weight}
                            placeholder="Enter Weight"
                            onChange={this.handleInputChange}
                            onKeyDown={this.handleInputKeyDown}
                            onBlur={this.handleInputBlur}
                        />

                        <span>grams</span>

                        <div className="silver-enter-hint">
                            ENTER ↵
                        </div>
                    </div>

                    <div className="silver-input-pulse"></div>
                </div>

                {/* =================================================
                    RESULT
                ================================================= */}

                {result && (
                    <div className="silver-result">
                        <div className="silver-result-card">
                            <div className="silver-card-glow"></div>

                            <div className="silver-card-icon">
                                ⚖
                            </div>

                            <span>
                                TOTAL WEIGHT
                            </span>

                            <strong>
                                {this.formatNumber(
                                    result.totalWeight,
                                )}
                                <small> g</small>
                            </strong>

                            <div className="silver-card-line"></div>
                        </div>

                        <div className="silver-result-card">
                            <div className="silver-card-glow"></div>

                            <div className="silver-card-icon">
                                ◈
                            </div>

                            <span>
                                60% WEIGHT
                            </span>

                            <strong>
                                {this.formatNumber(
                                    result.calculatedWeight,
                                )}
                                <small> g</small>
                            </strong>

                            <div className="silver-percentage">
                                60%
                            </div>

                            <div className="silver-card-line"></div>
                        </div>

                        <div className="silver-result-card silver-price-card">
                            <div className="silver-card-glow"></div>

                            <div className="silver-card-icon">
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

                            <div className="silver-price-sparkle">
                                ✦
                            </div>

                            <div className="silver-card-line"></div>
                        </div>
                    </div>
                )}

                {/* =================================================
                    CURRENT RATE
                ================================================= */}

                <div className="silver-current-rate">
                    <div className="silver-rate-pulse"></div>

                    <span>
                        CURRENT SILVER RATE
                    </span>

                    <strong>
                        ₹{this.formatNumber(silverRate)}
                        <small>/ gram</small>
                    </strong>

                    <div className="silver-live">
                        <span></span>
                        LIVE
                    </div>
                </div>
            </div>
        )
    }
}

export default OldSilverPriceSection