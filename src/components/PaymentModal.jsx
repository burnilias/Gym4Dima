import React from 'react';
import './PaymentModal.css';

const PaymentModal = ({ isOpen, onClose, coachName, onProceed, paymentStatus = 'pending', selectedPlan = null }) => {
  if (!isOpen) return null;

  // Content based on payment status
  const renderContent = () => {
    switch(paymentStatus) {
      case 'processing':
        return (
          <div className="payment-processing">
            <div className="spinner"></div>
            <h3>Processing Payment</h3>
            <p>Please wait while we process your payment...</p>
          </div>
        );
      case 'success':
        return (
          <div className="payment-success">
            <div className="success-icon">✓</div>
            <h3>Payment Successful!</h3>
            <p>Your lifetime access has been activated.</p>
            <p>You will be redirected to WhatsApp shortly...</p>
          </div>
        );
      case 'failed':
        return (
          <div className="payment-failed">
            <div className="failed-icon">✗</div>
            <h3>Payment Failed</h3>
            <p>There was an issue processing your payment. Please try again.</p>
            <button className="retry-button" onClick={() => onProceed('lifetime')}>Retry Payment</button>
          </div>
        );
      default: // pending
        return (
          <>
            <p className="payment-description">
              To chat directly with <span className="coach-name-highlight">{coachName}</span> on WhatsApp, 
              you need to purchase a Premium Coaching Access Pass.
            </p>
            
            <div className="payment-benefits">
              <h3>Benefits Include:</h3>
              <ul>
                <li>Lifetime WhatsApp access to your coach</li>
                <li>Priority responses within 24 hours</li>
                <li>Personalized fitness advice</li>
                <li>Nutrition guidance and meal planning</li>
                <li>Unlimited workout plan updates</li>
                <li>Access to exclusive training videos</li>
              </ul>
            </div>
            
            <div className="payment-option-single">
              <div className="lifetime-badge">LIFETIME ACCESS</div>
              <h2>Premium Coach Access</h2>
              <p className="price-large">999 MAD</p>
              <p className="one-time-payment">One-time payment only</p>
              <button className="payment-button-large" onClick={() => onProceed('lifetime')}>
                Pay Now & Get Access
              </button>
              <p className="payment-methods">We accept: Visa, Mastercard, PayPal</p>
            </div>
          </>
        );
    }
  };

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <div className="payment-modal-header">
          <h2>Premium Coach Access</h2>
          {paymentStatus === 'pending' && (
            <button className="close-button" onClick={onClose}>×</button>
          )}
        </div>
        <div className="payment-modal-content">
          {renderContent()}
        </div>
        
        <div className="payment-modal-footer">
          {paymentStatus === 'pending' && (
            <p className="guarantee">100% Satisfaction Guarantee. Cancel anytime.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
