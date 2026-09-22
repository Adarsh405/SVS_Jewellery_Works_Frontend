import {Component} from 'react'
import './GoldPriceSection.css'

const API_URL = 'https://svs-jewellery-backend.onrender.com/api/rates'

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
                    goldRate: Number(data.data.gold_rate),
                    hallmarkRate: Number(data.data.hallmark_rate),
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
            }
        )
    }

    calculatePrice = () => {
        const {
            weight,
            selectedRate,
            goldRate,
            hallmarkRate,
        } = this.state

        const enteredWeight = Number(weight)

        if (!enteredWeight || enteredWeight <= 0) {
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

        const goldValue = enteredWeight * currentRate

        const finalPrice = goldValue + makingCost

        this.setState(
            {
                result: {
                    weight: enteredWeight,
                    makingCost,
                    currentRate,
                    price: finalPrice,
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

    renderError() {
        return (
            <div className="gold-error">
                <div className="gold-error-logo">
                    SVS
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

        return (
            <div
                className={
                    isFocused
                        ? 'gold-page gold-focused'
                        : 'gold-page gold-unfocused'
                }
            >
                {/* TOP */}

                <div className="gold-top">

                    <div className="gold-rate-buttons">

                        <button
                            className={
                                selectedRate === 'hallmark'
                                    ? 'gold-rate-button active'
                                    : 'gold-rate-button'
                            }
                            onClick={() =>
                                this.handleRateChange(
                                    'hallmark'
                                )
                            }
                        >
                            Hallmark
                        </button>

                        <button
                            className={
                                selectedRate === 'kdm'
                                    ? 'gold-rate-button active'
                                    : 'gold-rate-button'
                            }
                            onClick={() =>
                                this.handleRateChange('kdm')
                            }
                        >
                            KDM
                        </button>

                    </div>

                    <div className="gold-image-box">

                        <img
                            src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=700&q=85"
                            alt="Gold Necklace"
                        />

                    </div>

                </div>

                {/* INPUT */}

                <div className="gold-input-area">

                    <div className="gold-input-box">

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
                    <div className="gold-result">

                        <div className="gold-result-card">

                            <span>WEIGHT</span>

                            <strong>
                                {this.formatNumber(
                                    result.weight
                                )}

                                <small> g</small>
                            </strong>

                        </div>

                        <div className="gold-result-card">

                            <span>MAKING COST</span>

                            <strong>
                                ₹
                                {this.formatNumber(
                                    result.makingCost
                                )}
                            </strong>

                        </div>

                        <div className="gold-result-card gold-price-card">

                            <span>PRICE</span>

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

                <div className="gold-current-rate">

                    <span>
                        CURRENT RATE
                    </span>

                    <strong>
                        ₹
                        {this.formatNumber(
                            selectedRate === 'hallmark'
                                ? hallmarkRate
                                : goldRate
                        )}

                        <small>/ gram</small>
                    </strong>

                </div>

            </div>
        )
    }
}

export default GoldPriceSection