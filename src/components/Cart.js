import React from 'react'
import './Cart.css'

const Cart = ({ cartItems }) => {

  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.rate),
    0
  )

  return (
    <div className="cart">

      <div className="cart-header">
        <h2>🛒 Cart</h2>
        <span>{cartItems.length} Items</span>
      </div>

      {cartItems.length === 0 ? (

        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <p>Cart is empty</p>
          <span>Scan and add products</span>
        </div>

      ) : (

        <div className="cart-content">

          <div className="cart-items">

            {cartItems.map(item => (

              <div
                className="cart-item"
                key={item.id}
              >

                <div className="cart-item-info">

                  <span className="cart-item-id">
                    #{item.id}
                  </span>

                  <span className="cart-item-name">
                    {item.name}
                  </span>

                </div>

                <span className="cart-item-rate">
                  ₹{Number(item.rate).toLocaleString()}
                </span>

              </div>

            ))}

          </div>

          <div className="cart-total">

            <span>Total</span>

            <strong>
              ₹{total.toLocaleString()}
            </strong>

          </div>

        </div>

      )}

    </div>
  )
}

export default Cart
