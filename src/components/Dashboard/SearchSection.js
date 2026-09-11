
import React from 'react'

const SearchSection = ({
  itemId,
  message,
  onChangeItemId,
  onKeyDown,
  searchItem,
  inputRef,
  setIsFocused
}) => {

  const handleChange = (e) => {
    const value = e.target.value

    // Allow only numbers and maximum 6 digits
    if (/^\d{0,6}$/.test(value)) {
      onChangeItemId(e)
    }
  }

  return (
    <div className="search-section">

      <h2>Find Jewellery</h2>

      <div className="search-container">

        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={itemId}
          onChange={handleChange}
          id="item-id-input"
          onKeyDown={onKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Enter ID / Scan Barcode"
          autoFocus
        />

        <button
          type="button"
          onClick={searchItem}
        >
          Search
        </button>

      </div>

      <p className="scanner-info">
        📷 Scan barcode or press Enter
      </p>

      {message && (
        <p className="error-message">
          {message}
        </p>
      )}

    </div>
  )
}

export default SearchSection
