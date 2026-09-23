import {Component} from 'react'
import axios from 'axios'
import {
  FiPlus,
  FiSearch,
  FiEdit3,
  FiTrash2,
  FiCheckCircle,
  FiClock,
  FiEye,
  FiX,
  FiRefreshCw,
} from 'react-icons/fi'
import AddOrder from './AddOrder'
import './Orders.css'

const API_URL ='https://svs-jewellery-works-backend.onrender.com/api/orders';

const calculateTotal = order => {
  const type = String(order.order_type || order.orderType || '').toLowerCase()

  const makingCost = Number(order.making_cost || order.makingCost || 0)

  if (type === 'silver') {
    return (
      Number(order.weight || 0) *
        Number(order.silver_rate || order.silverRate || 0)
    ) + makingCost
  }

  return (
    (
      Number(order.net_weight || order.netWeight || 0) +
      Number(order.charges || 0)
    ) *
      Number(order.gold_rate || order.goldRate || 0)
  ) + makingCost
}

const calculateDue = order =>
  calculateTotal(order) -
  Number(order.advance_paid || order.advancePaid || 0)

const money = value =>
  `₹${Number(value || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  })}`

const getTypeName = type => {
  switch (String(type).toLowerCase()) {
    case 'kdm':
      return 'KDM Gold'
    case 'hallmark':
      return 'Hallmark Gold'
    case 'silver':
      return 'Silver'
    default:
      return type || '-'
  }
}

const getImage = image => {
  if (!image) return null

  if (image.startsWith('http')) return image

  if (image.startsWith('/')) return image

  return `/${image}`
}

class Orders extends Component {
  state = {
    orders: [],
    loading: true,
    error: '',
    search: '',
    status: 'pending',
    orderType: 'all',
    dateFilter: 'all',

    showAddOrder: false,
    editingOrder: null,

    selectedOrder: null,

    deleteId: null,

    updatingStatus: null,
  }

  componentDidMount() {
    this.fetchOrders()
  }

  fetchOrders = async () => {
    try {
      this.setState({
        loading: true,
        error: '',
      })

      const {
        search,
        status,
        orderType,
        dateFilter,
      } = this.state

      const params = {}

      if (search.trim()) {
        params.search = search.trim()
      }

      if (status !== 'all') {
        params.status = status
      }

      if (orderType !== 'all') {
        params.order_type = orderType
      }

      const dates = this.getDateRange(dateFilter)

      if (dates.from) params.from_date = dates.from
      if (dates.to) params.to_date = dates.to

      const response = await axios.get(API_URL, {
        params,
        withCredentials: true,
      })

      this.setState({
        orders: response.data.orders || [],
        loading: false,
      })
    } catch (error) {
      console.error(error)

      this.setState({
        loading: false,
        error:
          error.response?.data?.message ||
          'Failed to load orders',
      })
    }
  }

  getDateRange = filter => {
    if (filter === 'all') {
      return {
        from: '',
        to: '',
      }
    }

    const today = new Date()

    const format = date => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')

      return `${year}-${month}-${day}`
    }

    const from = new Date(today)

    if (filter === 'today') {
      return {
        from: format(today),
        to: format(today),
      }
    }

    if (filter === 'week') {
      const day = from.getDay()
      const difference = day === 0 ? 6 : day - 1

      from.setDate(from.getDate() - difference)

      return {
        from: format(from),
        to: format(today),
      }
    }

    if (filter === 'month') {
      from.setDate(1)

      return {
        from: format(from),
        to: format(today),
      }
    }

    return {
      from: '',
      to: '',
    }
  }

  handleSearch = event => {
    this.setState(
      {
        search: event.target.value,
      },
      this.fetchOrders,
    )
  }

  handleStatusFilter = status => {
    this.setState(
      {
        status,
      },
      this.fetchOrders,
    )
  }

  handleTypeFilter = orderType => {
    this.setState(
      {
        orderType,
      },
      this.fetchOrders,
    )
  }

  handleDateFilter = dateFilter => {
    this.setState(
      {
        dateFilter,
      },
      this.fetchOrders,
    )
  }

  openAdd = () => {
    this.setState({
      showAddOrder: true,
      editingOrder: null,
    })
  }

  openEdit = order => {
    this.setState({
      showAddOrder: true,
      editingOrder: order,
      selectedOrder: null,
    })
  }

  closeAdd = () => {
    this.setState({
      showAddOrder: false,
      editingOrder: null,
    })
  }

  handleSaved = () => {
    this.closeAdd()
    this.fetchOrders()
  }

  openDetails = order => {
    this.setState({
      selectedOrder: order,
    })
  }

  closeDetails = () => {
    this.setState({
      selectedOrder: null,
    })
  }

  updateStatus = async (id, status) => {
    try {
      this.setState({
        updatingStatus: id,
      })

      await axios.patch(
        `${API_URL}/${id}/status`,
        {
          status,
        },
        {
          withCredentials: true,
        },
      )

      this.setState({
        updatingStatus: null,
      })

      this.fetchOrders()

      if (this.state.selectedOrder?.id === id) {
        this.closeDetails()
      }
    } catch (error) {
      console.error(error)

      this.setState({
        updatingStatus: null,
      })

      alert(
        error.response?.data?.message ||
          'Failed to update status',
      )
    }
  }

  confirmDelete = id => {
    this.setState({
      deleteId: id,
    })
  }

  cancelDelete = () => {
    this.setState({
      deleteId: null,
    })
  }

  deleteOrder = async () => {
    const {deleteId} = this.state

    if (!deleteId) return

    try {
      await axios.delete(
        `${API_URL}/${deleteId}`,
        {
          withCredentials: true,
        },
      )

      this.setState({
        deleteId: null,
        selectedOrder: null,
      })

      this.fetchOrders()
    } catch (error) {
      console.error(error)

      this.setState({
        deleteId: null,
      })

      alert(
        error.response?.data?.message ||
          'Failed to delete order',
      )
    }
  }

  renderSummary = () => {
    const {orders} = this.state

    const pending = orders.filter(
      order => order.status === 'pending',
    ).length

    const completed = orders.filter(
      order => order.status === 'completed',
    ).length

    const advance = orders.reduce(
      (sum, order) =>
        sum +
        Number(
          order.advance_paid ||
            order.advancePaid ||
            0,
        ),
      0,
    )

    const due = orders.reduce(
      (sum, order) =>
        sum + Math.max(0, calculateDue(order)),
      0,
    )

    return (
      <div className="orders-summary">
        <div className="summary-card">
          <span>Total Orders</span>
          <strong>{orders.length}</strong>
          <FiEye />
        </div>

        <div className="summary-card pending-card">
          <span>Pending Orders</span>
          <strong>{pending}</strong>
          <FiClock />
        </div>

        <div className="summary-card completed-card">
          <span>Completed</span>
          <strong>{completed}</strong>
          <FiCheckCircle />
        </div>

        <div className="summary-card">
          <span>Total Advance</span>
          <strong>{money(advance)}</strong>
          <FiCheckCircle />
        </div>

        <div className="summary-card due-card">
          <span>Total Due</span>
          <strong>{money(due)}</strong>
          <FiClock />
        </div>
      </div>
    )
  }

  renderCard = order => {
    const image = getImage(order.image)

    const total = calculateTotal(order)

    const advance = Number(
      order.advance_paid ||
        order.advancePaid ||
        0,
    )

    const due = Math.max(
      0,
      total - advance,
    )

    const type =
      order.order_type ||
      order.orderType

    return (
      <div
        className="order-card"
        key={order.id}
      >
        <div
          className="order-image"
          onClick={() =>
            this.openDetails(order)
          }
        >
          {image ? (
            <img
              src={image}
              alt={order.item_name}
            />
          ) : (
            <div className="image-placeholder">
              <span>SVS</span>
              <small>Jewellery</small>
            </div>
          )}

          <div className="image-overlay">
            <FiEye />
            View Details
          </div>

          <div className="type-badge">
            {getTypeName(type)}
          </div>
        </div>

        <div className="order-content">
          <div className="order-heading">
            <div>
              <h3>{order.item_name}</h3>
              <p>{order.customer_name}</p>
            </div>

            <span
              className={`status-badge ${order.status}`}
            >
              {order.status}
            </span>
          </div>

          <div className="order-mobile">
            {order.mobile_number}
          </div>

          <div className="order-info-grid">
            <div>
              <span>
                {String(type).toLowerCase() ===
                'silver'
                  ? 'Weight'
                  : 'Net Weight'}
              </span>

              <strong>
                {String(type).toLowerCase() ===
                'silver'
                  ? `${order.weight || 0} g`
                  : `${order.net_weight || 0} g`}
              </strong>
            </div>

            <div>
              <span>Rate</span>

              <strong>
                {money(
                  String(type).toLowerCase() ===
                    'silver'
                    ? order.silver_rate
                    : order.gold_rate,
                )}
              </strong>
            </div>

            <div>
              <span>Making Cost</span>
              <strong>
                {money(order.making_cost)}
              </strong>
            </div>

            {String(type).toLowerCase() !==
              'silver' && (
              <div>
                <span>Charges</span>
                <strong>
                  {order.charges || 0}
                </strong>
              </div>
            )}
          </div>

          <div className="financial-box">
            <div>
              <span>Total Value</span>
              <strong>
                {money(total)}
              </strong>
            </div>

            <div>
              <span>Advance Paid</span>
              <strong>
                {money(advance)}
              </strong>
            </div>

            <div className="due">
              <span>Due Amount</span>
              <strong>
                {money(due)}
              </strong>
            </div>
          </div>

          <div className="order-footer">
            <span>
              {order.order_date
                ? new Date(
                    order.order_date,
                  ).toLocaleDateString(
                    'en-IN',
                  )
                : '-'}
            </span>

            <div className="card-actions">
              <button
                title="View"
                onClick={() =>
                  this.openDetails(order)
                }
              >
                <FiEye />
              </button>

              <button
                title="Edit"
                onClick={() =>
                  this.openEdit(order)
                }
              >
                <FiEdit3 />
              </button>

              <button
                className="delete-action"
                title="Delete"
                onClick={() =>
                  this.confirmDelete(
                    order.id,
                  )
                }
              >
                <FiTrash2 />
              </button>

              <button
                className="status-action"
                disabled={
                  this.state
                    .updatingStatus ===
                  order.id
                }
                onClick={() =>
                  this.updateStatus(
                    order.id,
                    order.status ===
                      'pending'
                      ? 'completed'
                      : 'pending',
                  )
                }
              >
                {order.status ===
                'pending' ? (
                  <FiCheckCircle />
                ) : (
                  <FiClock />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  renderSkeletons = () => (
    <div className="orders-grid">
      {[1, 2, 3, 4, 5, 6].map(item => (
        <div
          className="order-skeleton"
          key={item}
        >
          <div className="skeleton-image" />

          <div className="skeleton-content">
            <div className="skeleton-line large" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-box" />
          </div>
        </div>
      ))}
    </div>
  )

  renderDetails = () => {
    const {selectedOrder} =
      this.state

    if (!selectedOrder) return null

    const image =
      getImage(selectedOrder.image)

    const total =
      calculateTotal(selectedOrder)

    const advance =
      Number(
        selectedOrder.advance_paid ||
          0,
      )

    const due =
      Math.max(
        0,
        total - advance,
      )

    const type =
      selectedOrder.order_type

    const silver =
      String(type).toLowerCase() ===
      'silver'

    return (
      <div
        className="details-backdrop"
        onClick={this.closeDetails}
      >
        <div
          className="details-modal"
          onClick={event =>
            event.stopPropagation()
          }
        >
          <button
            className="modal-close"
            onClick={this.closeDetails}
          >
            <FiX />
          </button>

          <div className="details-image">
            {image ? (
              <img
                src={image}
                alt={
                  selectedOrder.item_name
                }
              />
            ) : (
              <div className="image-placeholder">
                <span>SVS</span>
              </div>
            )}
          </div>

          <div className="details-body">
            <div className="details-top">
              <div>
                <span className="details-type">
                  {getTypeName(type)}
                </span>

                <h2>
                  {selectedOrder.item_name}
                </h2>

                <p>
                  {selectedOrder.customer_name}
                </p>
              </div>

              <span
                className={`status-badge ${selectedOrder.status}`}
              >
                {selectedOrder.status}
              </span>
            </div>

            <div className="details-grid">
              <div>
                <span>Mobile</span>
                <strong>
                  {
                    selectedOrder.mobile_number
                  }
                </strong>
              </div>

              <div>
                <span>Order Date</span>
                <strong>
                  {new Date(
                    selectedOrder.order_date,
                  ).toLocaleDateString(
                    'en-IN',
                  )}
                </strong>
              </div>

              <div>
                <span>
                  {silver
                    ? 'Weight'
                    : 'Net Weight'}
                </span>

                <strong>
                  {silver
                    ? `${selectedOrder.weight} g`
                    : `${selectedOrder.net_weight} g`}
                </strong>
              </div>

              <div>
                <span>Rate</span>

                <strong>
                  {money(
                    silver
                      ? selectedOrder.silver_rate
                      : selectedOrder.gold_rate,
                  )}
                </strong>
              </div>

              {!silver && (
                <div>
                  <span>Charges</span>
                  <strong>
                    {selectedOrder.charges}
                  </strong>
                </div>
              )}

              <div>
                <span>Making Cost</span>
                <strong>
                  {money(
                    selectedOrder.making_cost,
                  )}
                </strong>
              </div>
            </div>

            <div className="details-financial">
              <div>
                <span>Total Value</span>
                <strong>
                  {money(total)}
                </strong>
              </div>

              <div>
                <span>Advance Paid</span>
                <strong>
                  {money(advance)}
                </strong>
              </div>

              <div>
                <span>Due Amount</span>
                <strong>
                  {money(due)}
                </strong>
              </div>
            </div>

            <div className="details-actions">
              <button
                className="secondary-button"
                onClick={() =>
                  this.openEdit(
                    selectedOrder,
                  )
                }
              >
                <FiEdit3 />
                Edit
              </button>

              <button
                className="primary-button"
                onClick={() =>
                  this.updateStatus(
                    selectedOrder.id,
                    selectedOrder.status ===
                      'pending'
                      ? 'completed'
                      : 'pending',
                  )
                }
              >
                {selectedOrder.status ===
                'pending' ? (
                  <>
                    <FiCheckCircle />
                    Mark Completed
                  </>
                ) : (
                  <>
                    <FiClock />
                    Mark Pending
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  render() {
    const {
      orders,
      loading,
      error,
      search,
      status,
      orderType,
      dateFilter,
      showAddOrder,
      editingOrder,
      deleteId,
    } = this.state

    return (
      <div className="orders-page">
        <div className="orders-header">
          <div>
            <span className="page-eyebrow">
              SVS JEWELLERY WORKS
            </span>

            <h1>
              Orders &amp; Advance Orders
            </h1>

            <p>
              Manage jewellery orders,
              advances and pending
              customer balances.
            </p>
          </div>

          <button
            className="add-order-button"
            onClick={this.openAdd}
          >
            <FiPlus />
            Add Order
          </button>
        </div>

        {this.renderSummary()}

        <div className="orders-toolbar">
          <div className="search-box">
            <FiSearch />

            <input
              value={search}
              onChange={this.handleSearch}
              placeholder="Search customer, mobile or item..."
            />
          </div>

          <div className="filter-group">
            {[
              ['pending', 'Pending'],
              ['all', 'All'],
              ['completed', 'Completed'],
            ].map(([value, label]) => (
              <button
                key={value}
                className={
                  status === value
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  this.handleStatusFilter(
                    value,
                  )
                }
              >
                {label}
              </button>
            ))}
          </div>

          <select
            value={orderType}
            onChange={event =>
              this.handleTypeFilter(
                event.target.value,
              )
            }
          >
            <option value="all">
              All Types
            </option>
            <option value="kdm">
              KDM Gold
            </option>
            <option value="hallmark">
              Hallmark Gold
            </option>
            <option value="silver">
              Silver
            </option>
          </select>

          <select
            value={dateFilter}
            onChange={event =>
              this.handleDateFilter(
                event.target.value,
              )
            }
          >
            <option value="all">
              All Dates
            </option>
            <option value="today">
              Today
            </option>
            <option value="week">
              This Week
            </option>
            <option value="month">
              This Month
            </option>
          </select>

          <button
            className="refresh-button"
            onClick={this.fetchOrders}
          >
            <FiRefreshCw />
          </button>
        </div>

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        {loading ? (
          this.renderSkeletons()
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              ♢
            </div>

            <h2>
              No{' '}
              {status === 'pending'
                ? 'Pending '
                : status ===
                    'completed'
                  ? 'Completed '
                  : ''}
              Orders
            </h2>

            <p>
              Your showroom currently
              has no matching advance
              orders.
            </p>

            <button
              className="add-order-button"
              onClick={this.openAdd}
            >
              <FiPlus />
              Add New Order
            </button>
          </div>
        ) : (
          <div className="orders-grid">
            {orders.map(
              this.renderCard,
            )}
          </div>
        )}

        {this.renderDetails()}

        {showAddOrder && (
          <AddOrder
            order={editingOrder}
            onClose={this.closeAdd}
            onSaved={this.handleSaved}
          />
        )}

        {deleteId && (
          <div className="confirm-backdrop">
            <div className="confirm-modal">
              <div className="confirm-icon">
                <FiTrash2 />
              </div>

              <h2>
                Delete this order?
              </h2>

              <p>
                This action cannot be
                undone.
              </p>

              <div className="confirm-actions">
                <button
                  onClick={
                    this.cancelDelete
                  }
                  className="secondary-button"
                >
                  Cancel
                </button>

                <button
                  onClick={
                    this.deleteOrder
                  }
                  className="danger-button"
                >
                  Delete Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default Orders