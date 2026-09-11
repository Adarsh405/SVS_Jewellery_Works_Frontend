import React, { Component } from 'react'
import './Dashboard.css'

import ShopHeader from './ShopHeader'
import PriceSection from './PriceSection'
import SearchSection from './SearchSection'
import GoldItem from './GoldItem'
import SilverItem from './SilverItem'
import HMGoldItem from './HMGoldItem'
import Cart from './Cart'


class Dashboard extends Component {
  itemIdInputRef = React.createRef()

  state = {
    itemId: '',
    selectedItem: null,
    itemType: '',
    message: '',

    KDMItems: [],
    HallmarkItems: [],
    SilverItems: [],
    cartItems: [],

    loading: true,

    HMGoldRate: "",
    KDMGoldRate: "",
    silverRate: "",
    isSearchFocused: true
  }
  focusItemId = () => {
    if (this.itemIdInputRef.current) {
      this.itemIdInputRef.current.focus()
    }
  }

  componentDidMount() {
    this.getJewelleryDetails()
  }


  getJewelleryDetails = async () => {

      const API_URL =
        'https://svs-jewellery-works-backend.onrender.com'

      try {

        // ==========================================
        // GET ALL DATA AT THE SAME TIME
        // ==========================================

        const [
          kdmResponse,
          hallmarkResponse,
          silverResponse,
          ratesResponse
        ] = await Promise.all([

          fetch(`${API_URL}/api/kdm`),

          fetch(`${API_URL}/api/hallmark`),

          fetch(`${API_URL}/api/silver`),

          fetch(`${API_URL}/api/rates`)

        ])


        // ==========================================
        // CHECK API RESPONSES
        // ==========================================

        if (
          !kdmResponse.ok ||
          !hallmarkResponse.ok ||
          !silverResponse.ok ||
          !ratesResponse.ok
        ) {

          throw new Error(
            'Failed to fetch jewellery details'
          )

        }


        // ==========================================
        // CONVERT ALL RESPONSES TO JSON
        // ==========================================

        const [
          kdmData,
          hallmarkData,
          silverData,
          ratesData
        ] = await Promise.all([

          kdmResponse.json(),

          hallmarkResponse.json(),

          silverResponse.json(),

          ratesResponse.json()

        ])


        // ==========================================
        // STORE DATA IN STATE
        // ==========================================

        this.setState({

          // ----------------------------------------
          // KDM ITEMS
          // ----------------------------------------

          KDMItems: (kdmData.data || []).map(item => ({

            id: Number(item.id),

            name: item.name,

            itemType: item.item_type,

            netWeight:
              Number(item.net_weight),

            charges:
              Number(item.charges),

            makingCost:
              Number(item.making_cost),

            status:
              item.status

          })),


          // ----------------------------------------
          // HALLMARK ITEMS
          // ----------------------------------------

          HallmarkItems:
            (hallmarkData.data || []).map(item => ({

              id: Number(item.id),

              name: item.name,

              itemType: item.item_type,

              netWeight:
                Number(item.net_weight),

              charges:
                Number(item.charges),

              makingCost:
                Number(item.making_cost),

              status:
                item.status

            })),


          // ----------------------------------------
          // SILVER ITEMS
          // ----------------------------------------

          SilverItems:
            (silverData.data || []).map(item => ({

              id: Number(item.id),

              name: item.name,

              itemType: item.item_type,

              weight:
                Number(item.weight),

              makingCost:
                Number(item.making_cost),

              status:
                item.status

            })),


          // ----------------------------------------
          // RATES
          // ----------------------------------------

          KDMGoldRate:
            Number(ratesData.data.gold_rate),

          HMGoldRate:
            Number(ratesData.data.hallmark_rate),

          silverRate:
            Number(ratesData.data.silver_rate),


          // ----------------------------------------
          // LOADING COMPLETE
          // ----------------------------------------

          loading: false,

          message: ''

        })

      } catch (error) {

        console.error(
          'Error fetching jewellery details:',
          error
        )

        this.setState({

          loading: false,

          message:
            'Unable to load jewellery details'

        })

      }

    }


  // SEARCH ITEM FROM LOCAL STATE
  searchItem = () => {

    const {
      itemId,
      KDMItems,
      HallmarkItems,
      SilverItems
    } = this.state


    // Empty input

    if (!itemId.trim()) {

      this.setState({

        selectedItem: null,

        itemType: '',

        message:
          'Please enter an item ID'

      })

      return

    }


    const id = Number(itemId.trim())


    // Clear input box

    this.setState({

      itemId: ''

    })


    // Invalid number

    if (!Number.isInteger(id)) {

      this.setState({

        selectedItem: null,

        itemType: '',

        message:
          'Please enter a valid item ID'

      })

      return

    }


    // --------------------------------
    // SILVER
    // 1000 - 4999
    // --------------------------------

    if (id >= 1000 && id <= 4999) {

      const silverItem =
        SilverItems.find(
          item => Number(item.id) === id
        )


      if (silverItem) {

        this.setState({

          selectedItem: silverItem,

          itemType: silverItem.itemType,

          message: ''

        })

      } else {

        this.setState({

          selectedItem: null,

          itemType: '',

          message:
            'Silver item not found'

        })

      }

      return

    }

    // --------------------------------
    // KDM
    // 5000 - 8999
    // --------------------------------

    if (id >= 5000 && id <= 8999) {

      const kdmItem =
        KDMItems.find(
          item => Number(item.id) === id
        )


      if (kdmItem) {

        this.setState({

          selectedItem: kdmItem,

          itemType: kdmItem.itemType,

          message: ''

        })

      } else {

        this.setState({

          selectedItem: null,

          itemType: '',

          message:
            'KDM item not found'

        })

      }

      return

    }


    // --------------------------------
    // HALLMARK
    // 9000 - 9999
    // --------------------------------

    if (id >= 9000 && id <= 9999) {

      const hallmarkItem =
        HallmarkItems.find(
          item => Number(item.id) === id
        )


      if (hallmarkItem) {

        this.setState({

          selectedItem: hallmarkItem,

          itemType: hallmarkItem.itemType,

          message: ''

        })

      } else {

        this.setState({

          selectedItem: null,

          itemType: '',

          message:
            'HallMark item not found'

        })

      }

      return

    }


    // --------------------------------
    // INVALID ID RANGE
    // --------------------------------

    this.setState({

      selectedItem: null,

      itemType: '',

      message:
        'Invalid item ID. Please enter an ID between 1000 and 9999.'

    })

  }


  // ITEM ID INPUT

  onChangeItemId = event => {

    this.setState({

      itemId: event.target.value,

      message: ''

    })

  }


  // ENTER KEY SEARCH

  onKeyDown = event => {

    if (event.key === 'Enter') {

      this.searchItem()

    }

  }
  handleSilverItemSold = (itemId) => {

  this.setState(prevState => {

    const updatedSilverItems =
      prevState.SilverItems.map(item => {

        if (Number(item.id) === Number(itemId)) {

          return {
            ...item,
            status: 'sold'
          }

        }

        return item

      })


    let updatedSelectedItem =
      prevState.selectedItem


    if (
      updatedSelectedItem &&
      Number(updatedSelectedItem.id) ===
        Number(itemId)
    ) {

      updatedSelectedItem = {
        ...updatedSelectedItem,
        status: 'sold'
      }

    }


    return {

      SilverItems:
        updatedSilverItems,

      selectedItem:
        updatedSelectedItem

    }

  })

  }
  handleHallmarkItemSold = (itemId) => {

    this.setState(prevState => {

      const updatedHallmarkItems =
        prevState.HallmarkItems.map(item => {

          if (
            Number(item.id) ===
            Number(itemId)
          ) {

            return {
              ...item,
              status: 'sold'
            }

          }

          return item

        })


      let updatedSelectedItem =
        prevState.selectedItem


      if (
        updatedSelectedItem &&
        Number(updatedSelectedItem.id) ===
          Number(itemId)
      ) {

        updatedSelectedItem = {
          ...updatedSelectedItem,
          status: 'sold'
        }

      }


      return {

        HallmarkItems:
          updatedHallmarkItems,

        selectedItem:
          updatedSelectedItem

      }

    })

  }
  handleItemSold = (itemId) => {

    this.setState(prevState => {

      const updatedKDMItems =
        prevState.KDMItems.map(item => {

          if (Number(item.id) === Number(itemId)) {

            return {
              ...item,
              status: 'sold'
            }

          }

          return item

        })


      let updatedSelectedItem =
        prevState.selectedItem


      if (
        updatedSelectedItem &&
        Number(updatedSelectedItem.id) ===
          Number(itemId)
      ) {

        updatedSelectedItem = {
          ...updatedSelectedItem,
          status: 'sold'
        }

      }


      return {

        KDMItems:
          updatedKDMItems,

        selectedItem:
          updatedSelectedItem

      }

    })

  }
  addToCart = (item, price) => {

  this.setState(prevState => {

    const alreadyExists =
      prevState.cartItems.some(
        cartItem =>
          Number(cartItem.id) === Number(item.id)
      )

    if (alreadyExists) {

      return {
        message: 'Item already in cart'
      }

    }

    return {
      cartItems: [
        ...prevState.cartItems,

        {
          id: item.id,
          name: item.name,
          itemType: item.itemType,
          rate: Number(price)
        }
      ],

      message: ''
    }

  })

}
  render() {

    const {
      itemId,
      selectedItem,
      itemType,
      message,
      HMGoldRate,
      KDMGoldRate,
      silverRate,
      loading,
      cartItems,
      isSearchFocused
    } = this.state


    return (

      <div className="dashboard" onClick={this.focusItemId}>

        <ShopHeader isFocused={isSearchFocused}/>
        <div className="dashboard-main">

          <div className="dashboard-left">
        
            <PriceSection
              HMGoldRate={HMGoldRate}
              KDMGoldRate={KDMGoldRate}
              silverRate={silverRate}
            />
        
            {loading ? (
        
              <div className="loading-message">
                Loading jewellery items...
              </div>
        
            ) : (
        
              <SearchSection
                itemId={itemId}
                message={message}
                onChangeItemId={this.onChangeItemId}
                onKeyDown={this.onKeyDown}
                searchItem={this.searchItem}
                inputRef={this.itemIdInputRef}
                setIsFocused={(focused) =>
                  this.setState({ isSearchFocused: focused })
                }
              />
        
            )}
        
            {selectedItem && (
        
              <div
                className="result-section"
                key={selectedItem.id}
              >
        
                {/* your existing Hallmark / KDM / Silver components */}
        
              </div>
        
            )}
        
          </div>
        
        
          <div className="dashboard-right">
        
            <Cart cartItems={cartItems} />
        
          </div>
        
        </div>

        {selectedItem && (

          <div className="result-section" key={selectedItem.id}>


            {/* HALLMARK */}

            {itemType === 'HallMark' && (

              <HMGoldItem

                item={selectedItem}

                HMGoldrate={HMGoldRate}
                onSold={this.handleHallmarkItemSold}
                onAdd={this.addToCart}
                focusItemId={this.focusItemId}

              />

            )}


            {/* KDM */}

            {itemType === 'KDM' && (

              <GoldItem

                item={selectedItem}

                KDMGoldrate={KDMGoldRate}
                onSold={this.handleItemSold}
                onAdd={this.addToCart}
                focusItemId={this.focusItemId}

              />

            )}


            {/* SILVER */}

            {itemType === 'Silver' && (

              <SilverItem

                item={selectedItem}

                SilverRate={silverRate}

                onSold={this.handleSilverItemSold}
                onAdd={this.addToCart}
                focusItemId={this.focusItemId}

              />

            )}
            


          </div>

        )}

      </div>

    )

  }

}


export default Dashboard
