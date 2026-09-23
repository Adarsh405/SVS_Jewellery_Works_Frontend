import {Component} from 'react'
import axios from 'axios'
import {
  FiX,
  FiUploadCloud,
  FiTrash2,
  FiCheck,
  FiUser,
  FiCalendar,
  FiPackage,
  FiArrowLeft,
} from 'react-icons/fi'
import './AddOrder.css'

const API_URL ='https://svs-jewellery-works-backend.onrender.com/api/orders';

const calculateTotal = form => {
  const making = Number(form.makingCost || 0)

  if (form.orderType === 'silver') {
    return (
      Number(form.weight || 0) *
        Number(form.silverRate || 0)
    ) + making
  }

  return (
    (
      Number(form.netWeight || 0) +
      Number(form.charges || 0)
    ) *
      Number(form.goldRate || 0)
  ) + making
}

const money = value =>
  `₹${Number(value || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  })}`

class AddOrder extends Component {
  state = {
    step: 'type',

    orderType:
      this.props.order?.order_type ||
      'kdm',

    customerName:
      this.props.order?.customer_name ||
      '',

    mobileNumber:
      this.props.order?.mobile_number ||
      '',

    itemName:
      this.props.order?.item_name ||
      '',

    netWeight:
      this.props.order?.net_weight ||
      '',

    goldRate:
      this.props.order?.gold_rate ||
      '',

    charges:
      this.props.order?.charges ||
      '',

    weight:
      this.props.order?.weight ||
      '',

    silverRate:
      this.props.order?.silver_rate ||
      '',

    makingCost:
      this.props.order?.making_cost ||
      '',

    advancePaid:
      this.props.order?.advance_paid ||
      '',

    orderDate:
      this.props.order?.order_date
        ? String(
            this.props.order.order_date,
          ).slice(0, 10)
        : new Date()
            .toISOString()
            .slice(0, 10),

    imageFile: null,

    imagePreview:
      this.props.order?.image || null,

    removeExistingImage: false,

    submitting: false,

    error: '',
  }

  componentDidMount() {
    if (this.props.order) {
      this.setState({
        step: 'form',
      })
    }
  }

  handleChange = event => {
    const {name, value} =
      event.target

    this.setState({
      [name]: value,
      error: '',
    })
  }

  selectType = type => {
    this.setState({
      orderType: type,
      step: 'form',
      error: '',
    })
  }

  handleImage = event => {
    const file =
      event.target.files?.[0]

    if (!file) return

    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/jpg',
    ]

    if (!validTypes.includes(file.type)) {
      this.setState({
        error:
          'Please upload JPG, PNG or WEBP image.',
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      this.setState({
        error:
          'Image must be less than 5MB.',
      })
      return
    }

    const preview =
      URL.createObjectURL(file)

    this.setState({
      imageFile: file,
      imagePreview: preview,
      removeExistingImage: false,
      error: '',
    })
  }

  removeImage = () => {
    this.setState({
      imageFile: null,
      imagePreview: null,
      removeExistingImage: true,
    })
  }

  validate = () => {
    const {
      customerName,
      mobileNumber,
      itemName,
      orderDate,
      advancePaid,
      orderType,
      netWeight,
      goldRate,
      charges,
      makingCost,
      weight,
      silverRate,
    } = this.state

    if (!customerName.trim()) {
      return 'Customer name is required.'
    }

    if (!mobileNumber.trim()) {
      return 'Mobile number is required.'
    }

    if (!/^[0-9]{10}$/.test(mobileNumber.trim())) {
      return 'Enter a valid 10 digit mobile number.'
    }

    if (!itemName.trim()) {
      return 'Item name is required.'
    }

    if (!orderDate) {
      return 'Order date is required.'
    }

    if (
      advancePaid === '' ||
      Number(advancePaid) < 0
    ) {
      return 'Enter a valid advance amount.'
    }

    if (orderType === 'silver') {
      if (
        weight === '' ||
        Number(weight) < 0
      ) {
        return 'Enter a valid silver weight.'
      }

      if (
        silverRate === '' ||
        Number(silverRate) < 0
      ) {
        return 'Enter a valid silver rate.'
      }

      if (
        makingCost === '' ||
        Number(makingCost) < 0
      ) {
        return 'Enter a valid making cost.'
      }
    } else {
      if (
        netWeight === '' ||
        Number(netWeight) < 0
      ) {
        return 'Enter a valid net weight.'
      }

      if (
        goldRate === '' ||
        Number(goldRate) < 0
      ) {
        return 'Enter a valid gold rate.'
      }

      if (
        charges === '' ||
        Number(charges) < 0
      ) {
        return 'Enter valid charges.'
      }

      if (
        makingCost === '' ||
        Number(makingCost) < 0
      ) {
        return 'Enter a valid making cost.'
      }
    }

    const total =
      calculateTotal(this.state)

    if (Number(advancePaid) > total) {
      return 'Advance paid cannot exceed total value.'
    }

    return ''
  }

  submit = async event => {
    event.preventDefault()

    const validationError =
      this.validate()

    if (validationError) {
      this.setState({
        error: validationError,
      })
      return
    }

    const {
      orderType,
      customerName,
      mobileNumber,
      itemName,
      netWeight,
      goldRate,
      charges,
      weight,
      silverRate,
      makingCost,
      advancePaid,
      orderDate,
      imageFile,
      removeExistingImage,
    } = this.state

    try {
      this.setState({
        submitting: true,
        error: '',
      })

      const formData =
        new FormData()

      formData.append(
        'order_type',
        orderType,
      )

      formData.append(
        'customer_name',
        customerName.trim(),
      )

      formData.append(
        'mobile_number',
        mobileNumber.trim(),
      )

      formData.append(
        'item_name',
        itemName.trim(),
      )

      formData.append(
        'making_cost',
        makingCost,
      )

      formData.append(
        'advance_paid',
        advancePaid,
      )

      formData.append(
        'order_date',
        orderDate,
      )

      formData.append(
        'status',
        this.props.order?.status ||
          'pending',
      )

      if (orderType === 'silver') {
        formData.append(
          'weight',
          weight,
        )

        formData.append(
          'silver_rate',
          silverRate,
        )
      } else {
        formData.append(
          'net_weight',
          netWeight,
        )

        formData.append(
          'gold_rate',
          goldRate,
        )

        formData.append(
          'charges',
          charges,
        )
      }

      /*
        IMPORTANT:
        totalValue is NOT appended.
        dueAmount is NOT appended.
      */

      if (imageFile) {
        formData.append(
          'image',
          imageFile,
        )
      } else if (
        this.props.order &&
        removeExistingImage
      ) {
        formData.append(
          'image',
          '',
        )
      }

      let response

      if (this.props.order) {
        response = await axios.put(
          `${API_URL}/${this.props.order.id}`,
          formData,
          {
            withCredentials: true,
          },
        )
      } else {
        response = await axios.post(
          API_URL,
          formData,
          {
            withCredentials: true,
          },
        )
      }

      if (!response.data.success) {
        throw new Error(
          response.data.message ||
            'Operation failed',
        )
      }

      this.props.onSaved()
    } catch (error) {
      console.error(error)

      this.setState({
        submitting: false,
        error:
          error.response?.data?.message ||
          error.message ||
          'Failed to save order.',
      })
    }
  }

  renderTypeSelection = () => (
    <div className="type-screen">
      <div className="add-header">
        <div>
          <span>
            SVS JEWELLERY WORKS
          </span>

          <h2>
            {this.props.order
              ? 'Edit Order'
              : 'Create New Order'}
          </h2>

          <p>
            Select the jewellery order
            category.
          </p>
        </div>

        <button
          className="close-add"
          onClick={
            this.props.onClose
          }
        >
          <FiX />
        </button>
      </div>

      <div className="type-cards">
        <button
          className="type-card gold"
          onClick={() =>
            this.selectType('kdm')
          }
        >
          <div className="type-icon">
            ✦
          </div>

          <strong>KDM GOLD</strong>

          <span>
            Traditional gold jewellery
          </span>
        </button>

        <button
          className="type-card hallmark"
          onClick={() =>
            this.selectType('hallmark')
          }
        >
          <div className="type-icon">
            ◈
          </div>

          <strong>
            HALLMARK GOLD
          </strong>

          <span>
            Certified gold jewellery
          </span>
        </button>

        <button
          className="type-card silver"
          onClick={() =>
            this.selectType('silver')
          }
        >
          <div className="type-icon">
            ◆
          </div>

          <strong>SILVER</strong>

          <span>
            Premium silver jewellery
          </span>
        </button>
      </div>
    </div>
  )

  renderImage = () => {
    const {
      imagePreview,
    } = this.state

    return (
      <div className="image-upload">
        <label
          className={`upload-area ${
            imagePreview
              ? 'has-image'
              : ''
          }`}
        >
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Jewellery preview"
            />
          ) : (
            <>
              <FiUploadCloud />

              <strong>
                Upload Jewellery Image
              </strong>

              <span>
                JPG, PNG or WEBP · Max 5MB
              </span>
            </>
          )}

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={
              this.handleImage
            }
          />
        </label>

        {imagePreview && (
          <button
            type="button"
            className="remove-image"
            onClick={
              this.removeImage
            }
          >
            <FiTrash2 />
            Remove Image
          </button>
        )}
      </div>
    )
  }

  renderCalculation = () => {
    const total =
      calculateTotal(this.state)

    const advance =
      Number(
        this.state.advancePaid || 0,
      )

    const due =
      total - advance

    const silver =
      this.state.orderType ===
      'silver'

    return (
      <div className="calculation-panel">
        <div className="calc-title">
          <span>
            LIVE CALCULATION
          </span>

          <small>
            Frontend calculation
          </small>
        </div>

        <div className="calc-lines">
          <div>
            <span>
              {silver
                ? 'Weight'
                : 'Net Weight'}
            </span>

            <strong>
              {silver
                ? `${this.state.weight || 0} g`
                : `${this.state.netWeight || 0} g`}
            </strong>
          </div>

          {!silver && (
            <div>
              <span>Charges</span>
              <strong>
                {this.state.charges ||
                  0}
              </strong>
            </div>
          )}

          <div>
            <span>
              {silver
                ? 'Silver Rate'
                : 'Gold Rate'}
            </span>

            <strong>
              {money(
                silver
                  ? this.state
                      .silverRate
                  : this.state.goldRate,
              )}
            </strong>
          </div>

          <div>
            <span>
              Making Cost
            </span>

            <strong>
              {money(
                this.state.makingCost,
              )}
            </strong>
          </div>
        </div>

        <div className="calc-total">
          <span>Total Value</span>
          <strong>
            {money(total)}
          </strong>
        </div>

        <div className="calc-advance">
          <span>Advance Paid</span>
          <strong>
            {money(advance)}
          </strong>
        </div>

        <div className="calc-due">
          <span>Due Amount</span>
          <strong>
            {money(
              Math.max(0, due),
            )}
          </strong>
        </div>
      </div>
    )
  }

  renderForm = () => {
    const {
      orderType,
      customerName,
      mobileNumber,
      itemName,
      netWeight,
      goldRate,
      charges,
      weight,
      silverRate,
      makingCost,
      advancePaid,
      orderDate,
      error,
      submitting,
    } = this.state

    const silver =
      orderType === 'silver'

    return (
      <div className="form-screen">
        <div className="add-header">
          <div>
            <button
              type="button"
              className="back-button"
              onClick={() =>
                this.setState({
                  step: 'type',
                })
              }
            >
              <FiArrowLeft />
              Change Type
            </button>

            <div className="selected-type">
              {silver
                ? 'SILVER'
                : orderType ===
                    'hallmark'
                  ? 'HALLMARK GOLD'
                  : 'KDM GOLD'}
            </div>

            <h2>
              {this.props.order
                ? 'Edit Order'
                : 'Add Jewellery Order'}
            </h2>
          </div>

          <button
            className="close-add"
            onClick={
              this.props.onClose
            }
          >
            <FiX />
          </button>
        </div>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <form
          className="order-form"
          onSubmit={this.submit}
        >
          <div className="form-left">
            <div className="form-section">
              <div className="section-title">
                <FiUser />
                Customer Information
              </div>

              <div className="field-grid">
                <label>
                  <span>
                    Customer Name *
                  </span>

                  <input
                    name="customerName"
                    value={
                      customerName
                    }
                    onChange={
                      this.handleChange
                    }
                    placeholder="Enter customer name"
                  />
                </label>

                <label>
                  <span>
                    Mobile Number *
                  </span>

                  <input
                    name="mobileNumber"
                    value={
                      mobileNumber
                    }
                    onChange={
                      this.handleChange
                    }
                    placeholder="10 digit mobile number"
                    maxLength="10"
                    inputMode="numeric"
                  />
                </label>
              </div>
            </div>

            <div className="form-section">
              <div className="section-title">
                <FiPackage />
                Jewellery Information
              </div>

              <div className="field-grid">
                <label className="full">
                  <span>
                    Item Name *
                  </span>

                  <input
                    name="itemName"
                    value={
                      itemName
                    }
                    onChange={
                      this.handleChange
                    }
                    placeholder="Example: Gold Chain"
                  />
                </label>

                {silver ? (
                  <>
                    <label>
                      <span>
                        Weight (g) *
                      </span>

                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        name="weight"
                        value={
                          weight
                        }
                        onChange={
                          this.handleChange
                        }
                        placeholder="0.00"
                      />
                    </label>

                    <label>
                      <span>
                        Silver Rate *
                      </span>

                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        name="silverRate"
                        value={
                          silverRate
                        }
                        onChange={
                          this.handleChange
                        }
                        placeholder="Rate per gram"
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <label>
                      <span>
                        Net Weight (g) *
                      </span>

                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        name="netWeight"
                        value={
                          netWeight
                        }
                        onChange={
                          this.handleChange
                        }
                        placeholder="0.00"
                      />
                    </label>

                    <label>
                      <span>
                        Gold Rate *
                      </span>

                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        name="goldRate"
                        value={
                          goldRate
                        }
                        onChange={
                          this.handleChange
                        }
                        placeholder="Rate per gram"
                      />
                    </label>

                    <label>
                      <span>
                        Charges *
                      </span>

                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        name="charges"
                        value={
                          charges
                        }
                        onChange={
                          this.handleChange
                        }
                        placeholder="Charges"
                      />
                    </label>
                  </>
                )}

                <label>
                  <span>
                    Making Cost *
                  </span>

                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="makingCost"
                    value={
                      makingCost
                    }
                    onChange={
                      this.handleChange
                    }
                    placeholder="Making cost"
                  />
                </label>
              </div>
            </div>

            <div className="form-section">
              <div className="section-title">
                <FiCalendar />
                Order &amp; Payment
              </div>

              <div className="field-grid">
                <label>
                  <span>
                    Order Date *
                  </span>

                  <input
                    type="date"
                    name="orderDate"
                    value={
                      orderDate
                    }
                    onChange={
                      this.handleChange
                    }
                  />
                </label>

                <label>
                  <span>
                    Advance Paid *
                  </span>

                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="advancePaid"
                    value={
                      advancePaid
                    }
                    onChange={
                      this.handleChange
                    }
                    placeholder="Advance amount"
                  />
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={
                  this.props.onClose
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-button"
                disabled={
                  submitting
                }
              >
                <FiCheck />

                {submitting
                  ? 'Saving...'
                  : this.props.order
                    ? 'Update Order'
                    : 'Save Order'}
              </button>
            </div>
          </div>

          <div className="form-right">
            {this.renderImage()}

            {this.renderCalculation()}
          </div>
        </form>
      </div>
    )
  }

  render() {
    return (
      <div className="add-order-backdrop">
        <div className="add-order-modal">
          {this.state.step ===
          'type'
            ? this.renderTypeSelection()
            : this.renderForm()}
        </div>
      </div>
    )
  }
}

export default AddOrder