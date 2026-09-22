import {Component} from 'react'
import './GoldPriceSection.css'

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
            this.handlePageClick
        )
    }

    componentWillUnmount() {
        document.removeEventListener(
            'click',
            this.handlePageClick
        )
    }

    /* =====================================================
       FETCH RATES
    ===================================================== */

    fetchRates = async () => {
        try {
            const response = await fetch(API_URL)

            const data = await response.json()

            if (data.success) {
                this.setState({
                    loading: false,
                    apiSuccess: true,

                    goldRate: Number(
                        data.data.gold_rate
                    ),

                    hallmarkRate: Number(
                        data.data.hallmark_rate
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
                error
            )

            this.setState({
                loading: false,
                apiSuccess: false,
            })
        }
    }

    /* =====================================================
       PAGE CLICK
    ===================================================== */

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

    /* =====================================================
       INPUT CHANGE
    ===================================================== */

    handleInputChange = event => {
        const value = event.target.value

        if (/^\d*\.?\d*$/.test(value)) {
            this.setState({
                weight: value,
                isFocused: true,
            })
        }
    }

    /* =====================================================
       INPUT KEY DOWN
    ===================================================== */

    handleInputKeyDown = event => {
        if (event.key === 'Enter') {
            event.preventDefault()

            this.calculatePrice()
        }
    }

    /* =====================================================
       INPUT BLUR
    ===================================================== */

    handleInputBlur = () => {
        this.setState({
            isFocused: false,
        })
    }

    /* =====================================================
       CHANGE RATE
    ===================================================== */

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

    /* =====================================================
       CALCULATE PRICE
    ===================================================== */

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

        /* ================================================
           MAKING COST
        ================================================ */

        let makingCost = 0

        if (enteredWeight < 10) {
            makingCost = 1000
        } else if (enteredWeight <= 18) {
            makingCost = 2000
        } else {
            makingCost = 3000
        }

        /* ================================================
           CURRENT RATE
        ================================================ */

        const currentRate =
            selectedRate === 'hallmark'
                ? hallmarkRate
                : goldRate

        /* ================================================
           GOLD VALUE
        ================================================ */

        const goldValue =
            enteredWeight * currentRate

        /* ================================================
           FINAL PRICE
        ================================================ */

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
            }
        )
    }

    /* =====================================================
       FORMAT NUMBER
    ===================================================== */

    formatNumber = number => {
        return Number(number).toLocaleString(
            'en-IN',
            {
                maximumFractionDigits: 2,
            }
        )
    }

    /* =====================================================
       GET JEWELLERY IMAGE
    ===================================================== */

    getJewelleryImage = () => {
        const {
            selectedRate,
        } = this.state

        if (selectedRate === 'hallmark') {
            return 'https://i.pinimg.com/originals/9a/ca/37/9aca37e75a774508218415133dd98f07.jpg'
        }

        return 'https://i.pinimg.com/originals/6c/4e/83/6c4e83d3e48bdeaf4b3dff9f0a0d8b45.jpg'
    }

    /* =====================================================
       GET IMAGE ALT
    ===================================================== */

    getImageAlt = () => {
        const {
            selectedRate,
        } = this.state

        return selectedRate === 'hallmark'
            ? 'Hallmark Gold Jewellery'
            : 'KDM Gold Jewellery'
    }

    /* =====================================================
       LOADING
    ===================================================== */

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

    /* =====================================================
       ERROR
    ===================================================== */

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

    /* =====================================================
       RENDER
    ===================================================== */

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

        /* =================================================
           LOADING
        ================================================= */

        if (loading) {
            return this.renderLoading()
        }

        /* =================================================
           ERROR
        ================================================= */

        if (!apiSuccess) {
            return this.renderError()
        }

        /* =================================================
           CURRENT RATE
        ================================================= */

        const currentRate =
            selectedRate === 'hallmark'
                ? hallmarkRate
                : goldRate

        /* =================================================
           MAIN PAGE
        ================================================= */

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
                            : ''
                    }
                `}
            >

                {/* =================================================
                   DECORATIVE SHOWROOM ELEMENTS
                ================================================= */}

                <div className="showroom-orb showroom-orb-one" />
                <div className="showroom-orb showroom-orb-two" />

                {/* =================================================
                   TOP SECTION
                ================================================= */}

                <div className="gold-top">

                    {/* =============================================
                       RATE BUTTONS
                    ============================================= */}

                    <div className="gold-rate-buttons">

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
                                    'hallmark'
                                )
                            }
                        >
                            <span className="button-icon">
                                ✦
                            </span>

                            <span>
                                Hallmark
                            </span>
                        </button>

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
                                    'kdm'
                                )
                            }
                        >
                            <span className="button-icon">
                                ◆
                            </span>

                            <span>
                                KDM
                            </span>
                        </button>

                    </div>

                    {/* =============================================
                       PREMIUM JEWELLERY SHOWROOM IMAGE
                    ============================================= */}

                    <div className="gold-image-wrapper">

                        <div className="image-label">
                            <span className="image-label-dot" />

                            PREMIUM
                        </div>

                        <div
                            className="
                                gold-image-box
                            "
                        >

                            <img
                                key={selectedRate}
                                src={
                                    this.getJewelleryImage()
                                }
                                alt={
                                    this.getImageAlt()
                                }
                            />

                            <div className="image-overlay">
                                <span>
                                    SVS JEWELLERY
                                </span>
                            </div>

                        </div>

                    </div>

                </div>

                {/* =================================================
                   INPUT AREA
                ================================================= */}

                <div className="gold-input-area">

                    <div className="input-heading">
                        <span className="input-heading-line" />

                        <span>
                            ENTER JEWELLERY WEIGHT
                        </span>

                        <span className="input-heading-line" />
                    </div>

                    <div className="gold-input-box">

                        <div className="input-side-icon">
                            ◆
                        </div>

                        <input
                            ref={element =>
                                (this.inputRef =
                                    element)
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
                        Press <strong>ENTER</strong> to calculate
                    </div>

                </div>

                {/* =================================================
                   RESULT
                ================================================= */}

                {result && (
                    <div className="gold-result">

                        {/* WEIGHT */}

                        <div className="gold-result-card">

                            <div className="result-card-icon">
                                ⚖
                            </div>

                            <span>
                                WEIGHT
                            </span>

                            <strong>
                                {this.formatNumber(
                                    result.weight
                                )}

                                <small>
                                    {' '}
                                    g
                                </small>
                            </strong>

                        </div>

                        {/* MAKING COST */}

                        <div className="gold-result-card">

                            <div className="result-card-icon">
                                ✦
                            </div>

                            <span>
                                MAKING COST
                            </span>

                            <strong>
                                ₹
                                {this.formatNumber(
                                    result.makingCost
                                )}
                            </strong>

                        </div>

                        {/* FINAL PRICE */}

                        <div
                            className="
                                gold-result-card
                                gold-price-card
                            "
                        >

                            <div className="result-card-icon">
                                ₹
                            </div>

                            <span>
                                FINAL PRICE
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

                {/* =================================================
                   CURRENT RATE
                ================================================= */}

                <div className="gold-current-rate">

                    <div className="live-indicator">
                        <span />
                    </div>

                    <span className="current-rate-label">
                        LIVE GOLD RATE
                    </span>

                    <div className="current-rate-divider" />

                    <strong>
                        ₹
                        {this.formatNumber(
                            currentRate
                        )}

                        <small>
                            / gram
                        </small>
                    </strong>

                    <span className="current-rate-type">
                        {selectedRate === 'hallmark'
                            ? 'HALLMARK'
                            : 'KDM'}
                    </span>

                </div>

                {/* =================================================
                   BRAND FOOTER
                ================================================= */}

                <div className="gold-brand-footer">
                    <span className="brand-line" />

                    <span>
                        SVS JEWELLERY
                    </span>

                    <span className="brand-line" />
                </div>

            </div>
        )
    }
}

export default GoldPriceSection