import React from 'react'
import './shopheader.css'

const ShopHeader = ({ isFocused }) => {
  return (
    <div className={`shop-header ${isFocused ? 'header-focused' : ''}`}>
      
      <div>
        <p className="shop-small-title">WELCOME TO</p>

        <h1>Sri Venkateshwara Jewellers</h1>
      </div>

      <div className={`shop-icon ${isFocused ? 'icon-focused' : ''}`}>
        <img
          src="https://res.cloudinary.com/dhuby3rax/image/upload/v1727784528/Screenshot_2024-10-01_173800_diwyi3.png"
          alt="hanuman"
          className="hanuman-logo"
        />
      </div>

    </div>
  )
}

export default ShopHeader
