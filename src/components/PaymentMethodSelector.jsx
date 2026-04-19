import React, { useState } from 'react';
import './PaymentMethodSelector.css';

const PaymentMethodSelector = ({ onPaymentComplete, onCancel, coachId }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, success, error
  const [errors, setErrors] = useState({});

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails({
      ...cardDetails,
      [name]: value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!cardDetails.cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!/^\d{16}$/.test(cardDetails.cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }
    
    if (!cardDetails.cardHolder.trim()) {
      newErrors.cardHolder = 'Cardholder name is required';
    }
    
    if (!cardDetails.expiryDate.trim()) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
      newErrors.expiryDate = 'Use format MM/YY';
    }
    
    if (!cardDetails.cvv.trim()) {
      newErrors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
      newErrors.cvv = 'CVV must be 3 or 4 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setPaymentStatus('processing');
    
    // Simulate payment processing
    setTimeout(() => {
      setPaymentStatus('success');
      
      // Notify parent component that payment is complete with the coachId
      setTimeout(() => {
        onPaymentComplete(coachId);
      }, 1500);
    }, 2000);
  };

  const renderPaymentForm = () => {
    if (paymentStatus === 'processing') {
      return (
        <div className="payment-processing-container">
          <div className="payment-spinner"></div>
          <h3>Processing Payment</h3>
          <p>Please do not close this window...</p>
        </div>
      );
    }
    
    if (paymentStatus === 'success') {
      return (
        <div className="payment-success-container">
          <div className="payment-success-icon">✓</div>
          <h3>Payment Successful!</h3>
          <p>Your payment has been processed successfully.</p>
          <p>Connecting you to your coach...</p>
        </div>
      );
    }
    
    if (!selectedMethod) {
      return (
        <div className="payment-methods-container">
          <h3>Select Payment Method</h3>
          <div className="payment-methods-grid">
            <div 
              className="payment-method-card" 
              onClick={() => handleMethodSelect('credit-card')}
            >
              <div className="payment-method-icon credit-card-icon"></div>
              <span>Credit Card</span>
            </div>
            <div 
              className="payment-method-card" 
              onClick={() => handleMethodSelect('paypal')}
            >
              <div className="payment-method-icon paypal-icon"></div>
              <span>PayPal</span>
            </div>
            <div 
              className="payment-method-card" 
              onClick={() => handleMethodSelect('bank-transfer')}
            >
              <div className="payment-method-icon bank-transfer-icon"></div>
              <span>Bank Transfer</span>
            </div>
            <div 
              className="payment-method-card" 
              onClick={() => handleMethodSelect('apple-pay')}
            >
              <div className="payment-method-icon apple-pay-icon"></div>
              <span>Apple Pay</span>
            </div>
          </div>
        </div>
      );
    }
    
    // Credit Card Form
    if (selectedMethod === 'credit-card') {
      return (
        <div className="credit-card-form-container">
          <button className="back-button" onClick={() => setSelectedMethod(null)}>
            ← Back to Payment Methods
          </button>
          <h3>Enter Card Details</h3>
          <form onSubmit={handleSubmit} className="credit-card-form">
            <div className="form-group">
              <label>Card Number</label>
              <input
                type="text"
                name="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardDetails.cardNumber}
                onChange={handleInputChange}
                maxLength="19"
              />
              {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
            </div>
            
            <div className="form-group">
              <label>Cardholder Name</label>
              <input
                type="text"
                name="cardHolder"
                placeholder="John Doe"
                value={cardDetails.cardHolder}
                onChange={handleInputChange}
              />
              {errors.cardHolder && <span className="error-message">{errors.cardHolder}</span>}
            </div>
            
            <div className="form-row">
              <div className="form-group half">
                <label>Expiry Date</label>
                <input
                  type="text"
                  name="expiryDate"
                  placeholder="MM/YY"
                  value={cardDetails.expiryDate}
                  onChange={handleInputChange}
                  maxLength="5"
                />
                {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
              </div>
              
              <div className="form-group half">
                <label>CVV</label>
                <input
                  type="text"
                  name="cvv"
                  placeholder="123"
                  value={cardDetails.cvv}
                  onChange={handleInputChange}
                  maxLength="4"
                />
                {errors.cvv && <span className="error-message">{errors.cvv}</span>}
              </div>
            </div>
            
            <button type="submit" className="pay-button">
              Pay 999 MAD
            </button>
          </form>
        </div>
      );
    }
    
    // Other payment methods (simplified for demo)
    return (
      <div className="other-payment-method-container">
        <button className="back-button" onClick={() => setSelectedMethod(null)}>
          ← Back to Payment Methods
        </button>
        <h3>{selectedMethod === 'paypal' ? 'PayPal' : selectedMethod === 'bank-transfer' ? 'Bank Transfer' : 'Apple Pay'}</h3>
        <p>You'll be redirected to complete your payment.</p>
        <button className="proceed-button" onClick={handleSubmit}>
          Proceed to Payment
        </button>
      </div>
    );
  };

  return (
    <div className="payment-method-selector">
      <div className="payment-method-header">
        <h2>Complete Your Payment</h2>
        <button className="close-button" onClick={onCancel}>×</button>
      </div>
      
      <div className="payment-amount-summary">
        <div>
          <h3>Lifetime Coach Access</h3>
          <p>One-time payment</p>
        </div>
        <div className="payment-amount">999 MAD</div>
      </div>
      
      {renderPaymentForm()}
      
      <div className="payment-method-footer">
        <p>Your payment is secured with 256-bit encryption</p>
        <div className="security-badges">
          <span className="security-badge"></span>
          <span className="security-badge"></span>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
