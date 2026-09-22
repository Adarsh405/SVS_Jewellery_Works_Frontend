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
    pageRef = null

    componentDidMount() {
        this.fetchRates()
    }

    fetchRates = async () => {
        try {
            this.setState({
                loading: true,
            })

            const response = await fetch(API_URL)

            if (!response.ok) {
                throw new Error('Failed to fetch silver rate')
            }

            const data = await response.json()

            if (
                data.success &&
                data.data &&
                data.data.silver_rate !== undefined
            ) {
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
            console.error('Silver rate error:', error)

            this.setState({
                loading: false,
                apiSuccess: false,
            })
        }
    }

    handlePageClick = event => {
        if (
            this.pageRef &&
            this.pageRef.contains(event.target)
        ) {
            this.setState({
                isFocused: true,
            })
        }
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

    handleInputFocus = () => {
        this.setState({
            isFocused: true,
        })
    }

    handleInputBlur = () => {
        this.setState({
            isFocused: false,
        })
    }

    calculatePrice = () => {
        const {
            weight,
            silverRate,
        } = this.state

        const totalWeight = Number(weight)

        if (!totalWeight || totalWeight <= 0) {
            if (this.inputRef) {
                this.inputRef.focus()
            }

            return
        }

        /*
         * Old silver calculation:
         * 60% of entered weight
         */
        const calculatedWeight =
            totalWeight * 0.6

        const price =
            calculatedWeight * silverRate

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
        return Number(number).toLocaleString(
            'en-IN',
            {
                maximumFractionDigits: 2,
            },
        )
    }

    renderFloatingParticles() {
        return (
            <div
                className="silver-particles"
                aria-hidden="true"
            >
                {Array.from(
                    {length: 18},
                    (_, index) => (
                        <span
                            key={index}
                            className={`silver-particle-${index + 1}`}
                        ></span>
                    ),
                )}
            </div>
        )
    }

    renderLuxuryBackground() {
        return (
            <div
                className="silver-background-effects"
                aria-hidden="true"
            >
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

                <div className="silver-grid"></div>
            </div>
        )
    }

    renderLoading() {
        return (
            <div className="silver-loading">
                <div className="silver-loading-orbit">
                    <div className="silver-loading-ring"></div>

                    <div className="silver-loading-ring silver-loading-ring-two"></div>

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
                ref={element => {
                    this.pageRef = element
                }}
                className={
                    isFocused
                        ? 'silver-page silver-focused'
                        : 'silver-page silver-unfocused'
                }
                onClick={this.handlePageClick}
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

                            <span>
                                Old-Silver
                            </span>

                            <span className="silver-title-sparkle">
                                ✦
                            </span>
                        </div>

                        <div className="silver-title-subtitle">
                            PRECIOUS METAL CALCULATOR
                        </div>
                    </div>

                    <div className="silver-image-box">
                        <div className="silver-image-overlay"></div>

                        <img
                            src="https://tse3.mm.bing.net/th/id/OIP.TuyCbJAF-BENDqLJBs-60AHaF_?r=0&pid=Api&h=220&P=0"
                            alt="Silver Jewellery"
                        />

                        <div className="silver-image-label">
                            SILVER
                        </div>
                    </div>
                </div>

                {/* =================================================
                    INPUT
                ================================================= */}

                <div className="silver-input-area">
                    <div className="silver-input-caption">
                        ENTER OLD SILVER WEIGHT
                    </div>

                    <div className="silver-input-box">
                        <div className="silver-input-glow"></div>

                        <div className="silver-input-icon">
                            ◈
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
                            onFocus={
                                this.handleInputFocus
                            }
                            onBlur={
                                this.handleInputBlur
                            }
                        />

                        <span>
                            grams
                        </span>

                        <div className="silver-enter-hint">
                            PRESS ENTER
                        </div>
                    </div>
                </div>

                {/* =================================================
                    RESULT
                ================================================= */}

                {result && (
                    <div className="silver-result">
                        {/* TOTAL WEIGHT */}

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

                                <small>
                                    {' '}
                                    g
                                </small>
                            </strong>

                            <div className="silver-card-line"></div>
                        </div>

                        {/* 60% WEIGHT */}

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

                                <small>
                                    {' '}
                                    g
                                </small>
                            </strong>

                            <div className="silver-percentage">
                                60%
                            </div>

                            <div className="silver-card-line"></div>
                        </div>

                        {/* PRICE */}

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
                        ₹
                        {this.formatNumber(
                            silverRate,
                        )}

                        <small>
                            / gram
                        </small>
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