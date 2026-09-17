import { Component } from "react";
import "./Payment.css";
import PhonePeQr from './phonepe-qr.png'
class Payment extends Component {
  render() {
    return (
      <div className="payment-page">
        <div className="payment-card">

          {/* Header */}
          <div className="payment-header">
            <div className="payment-logo">SVS</div>

            <div>
              <h1>SVS JEWELLERY</h1>
              <p>Trusted Jewellery • Timeless Elegance</p>
            </div>
          </div>

          <div className="payment-divider"></div>

          {/* Payment Title */}
          <div className="payment-title">
            <span>SECURE PAYMENT</span>
            <h2>Scan & Pay</h2>
            <p>Use PhonePe to complete your payment</p>
          </div>

          {/* QR Section */}
          <div className="qr-container">

            <div className="qr-frame">
              <img
                src= {PhonePeQr}
                alt="SVS Jewellery PhonePe QR Code"
                className="payment-qr"
              />
            </div>

            <div className="scan-text">
              <strong>Scan QR Code</strong>
              <span>Open PhonePe and scan the QR code</span>
            </div>

          </div>

          {/* Payment Details */}
          <div className="payment-info">

            <div className="info-item">
              <span className="info-label">PAYMENT METHOD</span>
              <strong>PhonePe UPI</strong>
            </div>

            <div className="info-item">
              <span className="info-label">MERCHANT</span>
              <strong>SVS Jewellery</strong>
            </div>

          </div>

          {/* Footer */}
          <div className="payment-footer">
            <span>◆</span>
            <p>Please verify the merchant name before making payment</p>
            <span>◆</span>
          </div>

        </div>
      </div>
    );
  }
}

export default Payment;