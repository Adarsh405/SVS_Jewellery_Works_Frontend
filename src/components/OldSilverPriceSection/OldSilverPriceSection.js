import {Component} from 'react'
import './OldSilverPriceSection.css'

const API_URL = 'https://svs-jewellery-works-backend.onrender.com/api/rates'

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
                    silverRate: Number(
                        data.data.silver_rate
                    ),
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

        const calculatedWeight =
            totalWeight * 0.60

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
            }
        )
    }

    formatNumber = number => {
        return Number(number).toLocaleString('en-IN', {
            maximumFractionDigits: 2,
        })
    }

    renderLoading() {
        return (
            <div className="silver-loading">

                <div className="silver-svs-loader">
                    <span>SVS</span>
                </div>

                <div className="silver-loading-text">
                    Loading Rates
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

                {/* TOP */}

                <div className="silver-top">

                    <div className="silver-title-button">
                        Old-Silver
                    </div>

                    <div className="silver-image-box">

                        <img
                            src="https://tse3.mm.bing.net/th/id/OIP.TuyCbJAF-BENDqLJBs-60AHaF_?r=0&pid=Api&h=220&P=0"
                            alt="Silver Jewellery"
                        />

                    </div>

                </div>

                {/* INPUT */}

                <div className="silver-input-area">

                    <div className="silver-input-box">

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

                        <span>grams</span>

                    </div>

                </div>

                {/* RESULT */}

                {result && (
                    <div className="silver-result">

                        <div className="silver-result-card">

                            <span>
                                TOTAL WEIGHT
                            </span>

                            <strong>
                                {this.formatNumber(
                                    result.totalWeight
                                )}

                                <small> g</small>
                            </strong>

                        </div>

                        <div className="silver-result-card">

                            <span>
                                60% WEIGHT
                            </span>

                            <strong>
                                {this.formatNumber(
                                    result.calculatedWeight
                                )}

                                <small> g</small>
                            </strong>

                            <div className="silver-percentage">
                                60%
                            </div>

                        </div>

                        <div className="silver-result-card silver-price-card">

                            <span>
                                PRICE
                            </span>

                            <strong>
                                ₹
                                {this.formatNumber(
                                    result.price
                                )}
                            </strong>

                        </div>

                    </div>
                )}

                {/* CURRENT RATE */}

                <div className="silver-current-rate">

                    <span>
                        CURRENT SILVER RATE
                    </span>

                    <strong>
                        ₹
                        {this.formatNumber(silverRate)}

                        <small>/ gram</small>
                    </strong>

                </div>

            </div>
        )
    }
}

export default OldSilverPriceSection