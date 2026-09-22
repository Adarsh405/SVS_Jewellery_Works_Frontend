import './PriceCalculater.css'
import {Component} from 'react'

const API_URL = 'https://svs-jewellery-works-backend.onrender.com/api/rates'

class PriceCalculater extends Component {
    state = {
        loading: true,
        apiSuccess: false,

        selectedType: 'old-silver',
        selectedGoldRate: 'hallmark',

        goldRate: 0,
        hallmarkRate: 0,
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
                    apiSuccess: true,
                    loading: false,
                    goldRate: Number(data.data.gold_rate),
                    hallmarkRate: Number(data.data.hallmark_rate),
                    silverRate: Number(data.data.silver_rate),
                })
            } else {
                this.setState({
                    loading: false,
                    apiSuccess: false,
                })
            }
        } catch (error) {
            console.error('Failed to fetch rates:', error)

            this.setState({
                loading: false,
                apiSuccess: false,
            })
        }
    }

    handlePageClick = () => {
        this.setState({isFocused: true})

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
        this.setState({isFocused: false})
    }

    handleTypeChange = type => {
        this.setState(
            {
                selectedType: type,
                result: null,
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

    handleGoldRateChange = rateType => {
        this.setState(
            {
                selectedGoldRate: rateType,
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
        const {weight, selectedType, selectedGoldRate} = this.state

        const enteredWeight = Number(weight)

        if (!enteredWeight || enteredWeight <= 0) {
            if (this.inputRef) {
                this.inputRef.focus()
            }

            return
        }

        if (selectedType === 'gold') {
            let makingCost = 0

            if (enteredWeight < 10) {
                makingCost = 1000
            } else if (enteredWeight <= 18) {
                makingCost = 2000
            } else {
                makingCost = 3000
            }

            const currentRate =
                selectedGoldRate === 'hallmark'
                    ? this.state.hallmarkRate
                    : this.state.goldRate

            const goldValue = enteredWeight * currentRate
            const finalPrice = goldValue + makingCost

            this.setState(
                {
                    result: {
                        type: 'gold',
                        totalWeight: enteredWeight,
                        calculatedWeight: enteredWeight,
                        percentage: 100,
                        makingCost,
                        currentRate,
                        metalValue: goldValue,
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
        } else {
            const calculatedWeight = enteredWeight * 0.60
            const price = calculatedWeight * this.state.silverRate

            this.setState(
                {
                    result: {
                        type: 'old-silver',
                        totalWeight: enteredWeight,
                        calculatedWeight,
                        percentage: 60,
                        makingCost: 0,
                        currentRate: this.state.silverRate,
                        metalValue: price,
                        price,
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
    }

    formatNumber = number => {
        return Number(number).toLocaleString('en-IN', {
            maximumFractionDigits: 2,
        })
    }

    renderLoading = () => {
        return (
            <div className="price-calculator-loading">
                <div className="svs-loader">
                    <span>SVS</span>
                </div>

                <div className="loading-text">
                    Loading Rates
                </div>
            </div>
        )
    }

    renderError = () => {
        return (
            <div className="price-calculator-error">
                <div className="error-logo">SVS</div>

                <h2>Unable to Load Rates</h2>

                <button
                    className="retry-button"
                    onClick={this.fetchRates}
                >
                    Retry
                </button>
            </div>
        )
    }

    renderGoldRateSelector = () => {
        const {
            selectedGoldRate,
            goldRate,
            hallmarkRate,
        } = this.state

        return (
            <div className="gold-rate-selector">

                <button
                    className={
                        selectedGoldRate === 'hallmark'
                            ? 'rate-option active'
                            : 'rate-option'
                    }
                    onClick={() =>
                        this.handleGoldRateChange('hallmark')
                    }
                >
                    Hallmark
                </button>

                <button
                    className={
                        selectedGoldRate === 'kdm'
                            ? 'rate-option active'
                            : 'rate-option'
                    }
                    onClick={() =>
                        this.handleGoldRateChange('kdm')
                    }
                >
                    KDM
                </button>

                <div className="current-rate-small">
                    ₹
                    {this.formatNumber(
                        selectedGoldRate === 'hallmark'
                            ? hallmarkRate
                            : goldRate
                    )}
                    /g
                </div>

            </div>
        )
    }

    renderResult = () => {
        const {result} = this.state

        if (!result) {
            return null
        }

        const isGold = result.type === 'gold'

        return (
            <div className="result-section">

                <div className="result-card weight-card">
                    <span className="result-label">
                        TOTAL WEIGHT
                    </span>

                    <strong>
                        {this.formatNumber(result.totalWeight)}
                        <small> g</small>
                    </strong>
                </div>

                <div className="result-card calculated-card">
                    <span className="result-label">
                        {isGold
                            ? 'CALCULATED WEIGHT'
                            : '60% WEIGHT'}
                    </span>

                    <strong>
                        {this.formatNumber(
                            result.calculatedWeight
                        )}
                        <small> g</small>
                    </strong>

                    {!isGold && (
                        <span className="percentage-badge">
                            60%
                        </span>
                    )}
                </div>

                {isGold && (
                    <div className="result-card making-card">
                        <span className="result-label">
                            MAKING COST
                        </span>

                        <strong>
                            ₹
                            {this.formatNumber(
                                result.makingCost
                            )}
                        </strong>
                    </div>
                )}

                <div className="result-card price-card">

                    <span className="result-label">
                        FINAL PRICE
                    </span>

                    <strong>
                        ₹{this.formatNumber(result.price)}
                    </strong>

                </div>

                <div className="calculation-summary">

                    <span>
                        {isGold
                            ? `${this.formatNumber(
                                  result.totalWeight
                              )} g × ₹${this.formatNumber(
                                  result.currentRate
                              )}`
                            : `${this.formatNumber(
                                  result.calculatedWeight
                              )} g × ₹${this.formatNumber(
                                  result.currentRate
                              )}`}
                    </span>

                    {isGold && (
                        <>
                            <span>+</span>

                            <span>
                                ₹
                                {this.formatNumber(
                                    result.makingCost
                                )}
                            </span>
                        </>
                    )}

                    <span>=</span>

                    <strong>
                        ₹{this.formatNumber(result.price)}
                    </strong>

                </div>

            </div>
        )
    }

    renderCalculator = () => {
        const {
            selectedType,
            weight,
            isFocused,
        } = this.state

        const isGold = selectedType === 'gold'

        return (
            <div
                className={
                    isFocused
                        ? 'calculator-page focused'
                        : 'calculator-page unfocused'
                }
            >

                <div className="top-section">

                    <div className="type-buttons">

                        <button
                            className={
                                !isGold
                                    ? 'type-button active'
                                    : 'type-button'
                            }
                            onClick={() =>
                                this.handleTypeChange(
                                    'old-silver'
                                )
                            }
                        >
                            Old-Silver
                        </button>

                        <button
                            className={
                                isGold
                                    ? 'type-button active'
                                    : 'type-button'
                            }
                            onClick={() =>
                                this.handleTypeChange('gold')
                            }
                        >
                            Gold
                        </button>

                    </div>

                    <div className="product-image">

                        <img
                            src={
                                isGold
                                    ? 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=600&q=85'
                                    : 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=600&q=85'
                            }
                            alt={
                                isGold
                                    ? 'Gold Necklace'
                                    : 'Silver Jewellery'
                            }
                        />

                    </div>

                </div>

                <div className="main-calculator">

                    <div className="input-area">

                        <div className="input-wrapper">

                            <input
                                ref={element =>
                                    (this.inputRef = element)
                                }
                                type="text"
                                inputMode="decimal"
                                value={weight}
                                onChange={this.handleInputChange}
                                onKeyDown={
                                    this.handleInputKeyDown
                                }
                                onBlur={this.handleInputBlur}
                                autoFocus
                                placeholder="Enter Weight"
                            />

                            <span className="input-unit">
                                grams
                            </span>

                        </div>

                    </div>

                    {isGold &&
                        this.renderGoldRateSelector()}

                    {this.renderResult()}

                </div>

                <div className="bottom-rate">

                    {isGold ? (
                        <>
                            Hallmark ₹
                            {this.formatNumber(
                                this.state.hallmarkRate
                            )}
                            /g&nbsp;&nbsp; • &nbsp;&nbsp;
                            KDM ₹
                            {this.formatNumber(
                                this.state.goldRate
                            )}
                            /g
                        </>
                    ) : (
                        <>
                            Silver ₹
                            {this.formatNumber(
                                this.state.silverRate
                            )}
                            /g&nbsp;&nbsp; • &nbsp;&nbsp;
                            60% calculation
                        </>
                    )}

                </div>

            </div>
        )
    }

    render() {
        const {
            loading,
            apiSuccess,
        } = this.state

        if (loading) {
            return this.renderLoading()
        }

        if (!apiSuccess) {
            return this.renderError()
        }

        return this.renderCalculator()
    }
}

export default PriceCalculater