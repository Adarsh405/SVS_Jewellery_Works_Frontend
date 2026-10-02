
import React, { useEffect, useState } from 'react'
import './priceSection.css'
const PriceSection = (props) => {
  const {KDMGoldRate, silverRate } = props

  const [liveKDMGold, setLiveKDMGold] = useState(KDMGoldRate)
  const [liveSilver, setLiveSilver] = useState(silverRate)

  const [kdmDirection, setKdmDirection] = useState('increase')
  const [silverDirection, setSilverDirection] = useState('increase')

  useEffect(() => {
    setLiveKDMGold(KDMGoldRate)
    setLiveSilver(silverRate)
  }, [ KDMGoldRate, silverRate])

  useEffect(() => {
    if (
      !KDMGoldRate ||
      !silverRate
    ) {
      return
    }

    const interval = setInterval(() => {

      // Randomly choose increase or decrease
      const kdmChange = Math.floor(Math.random() * 40) + 1
      const silverChange = Math.floor(Math.random() * 2) + 1

      // Random direction
      const kdmIncrease = Math.random() > 0.5
      const silverIncrease = Math.random() > 0.5


      // KDM Gold
      setLiveKDMGold(prev => {
        let newValue

        if (kdmIncrease) {
          newValue = Math.min(
            prev + kdmChange,
            Number(KDMGoldRate) + 100
          )

          setKdmDirection('increase')
        } else {
          newValue = Math.max(
            prev - kdmChange,
            Number(KDMGoldRate)
          )

          setKdmDirection('decrease')
        }

        return newValue
      })

      // Silver
      setLiveSilver(prev => {
        let newValue

        if (silverIncrease) {
          newValue = Math.min(
            prev + silverChange,
            Number(silverRate) + 10
          )

          setSilverDirection('increase')
        } else {
          newValue = Math.max(
            prev - silverChange,
            Number(silverRate)
          )

          setSilverDirection('decrease')
        }

        return newValue
      })

    }, 500) // changes every 2 seconds

    return () => clearInterval(interval)

  }, [KDMGoldRate, silverRate])


  return (
    <div className="price-section">

      <h2>Today's Price</h2>

      <div className="price-container">


        {/* KDM Gold */}
        <div className={`rate-card kdm ${kdmDirection}`}>

          <p>Gold Price</p>

          <h3>
            ₹{Number(liveKDMGold).toLocaleString()}
          </h3>

          <span className="price-arrow">
            {kdmDirection === 'increase' ? '▲' : '▼'}
          </span>

        </div>


        {/* Silver */}
        <div className={`rate-card silver ${silverDirection}`}>

          <p>Silver Price</p>

          <h3>
            ₹{Number(liveSilver).toLocaleString()}
          </h3>

          <span className="price-arrow">
            {silverDirection === 'increase' ? '▲' : '▼'}
          </span>

        </div>

      </div>

    </div>
  )
}

export default PriceSection
