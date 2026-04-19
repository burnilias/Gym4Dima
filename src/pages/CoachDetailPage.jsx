import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PaymentModal from '../components/PaymentModal';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import { supabase } from '../supabaseClient';
import './CoachDetailPage.css'; // We'll create this CSS file next

// Placeholder data - in a real app, this would come from a backend or a more detailed data source
const coachDetailsData = {
  chris: {
    name: 'COACH Samson',
    image: 'https://hosstile.com/cdn/shop/articles/bodybuilder_Samson-Dauda_Chest_Workout.jpg?v=1690585405', // Replace with actual image URL
    bio: 'Samson Dauda earned his IFBB Pro card in 2017 after winning the overall title at the IFBB Amateur Diamond Cup Rome, marking a turning point in his bodybuilding career.',
    specialties: ['Strength Training', 'Muscle Building', 'Nutritional Guidance'],
    contact: 'SAMSON@gym4dima.com'
  },
  david: {
    name: 'COACH HILALI',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRYT9DeacuEUkvv5Ys0NI2fBGfsiktAIAekA&s', // Replace with actual image URL
    bio: 'Abdo Hilali, Ex-champion Européen Bodybuilder, coach sportif international spécialisé en nutrition et préparation physique.',
    specialties: ['Coaching sportifNutrition sportive', 'Sports Performance'],
    contact: 'ABDO@gym4dima.com'
  },
  hany: {
    name: 'COACH HANY',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtSYnARJNI05YpQmn-QO8NVmyNX5J0KCCD7Q&s', // Replace with actual image URL
    bio: 'Hany is a renowned body-building coach known for his meticulous approach to physique transformation. He has worked with numerous professional athletes, helping them sculpt their bodies for competition. Hany emphasizes precision in training and diet to achieve optimal results.',
    specialties: ['Bodybuilding', 'Physique Transformation', 'Contest Preparation'],
    contact: 'HANI@gym4dima.com'
  }
};

const CoachDetailPage = () => {
  const { coachId } = useParams(); // e.g., 'chris', 'david', 'hany'
  const coach = coachDetailsData[coachId];
  const navigate = useNavigate();
  
  // Move all useState hooks to the top of the component before any conditional returns
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPaymentMethodSelectorOpen, setIsPaymentMethodSelectorOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, success, failed
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [hasPaid, setHasPaid] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Check if user is logged in and if they've paid for this coach
  useEffect(() => {
    const checkUserAndPayments = async () => {
      try {
        setLoading(true);
        
        // First check localStorage for payment records (for persistence between sessions)
        const localPaidCoaches = JSON.parse(localStorage.getItem('paidCoaches') || '[]');
        if (localPaidCoaches.includes(coachId)) {
          setHasPaid(true);
          setLoading(false);
          return; // Already paid according to localStorage
        }
        
        // Get current user session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Don't redirect to login, just set loading to false
          setLoading(false);
          return;
        }
        
        setCurrentUser(session.user);
        
        // Check if this user has paid for this coach in Supabase
        try {
          const { data: payments, error } = await supabase
            .from('coach_payments')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('coach_id', coachId);
          
          if (error) {
            console.error('Error checking payments:', error);
          } else {
            // If there are any payment records for this coach, user has paid
            if (payments && payments.length > 0) {
              setHasPaid(true);
              
              // Also store in localStorage for persistence between sessions
              if (!localPaidCoaches.includes(coachId)) {
                localPaidCoaches.push(coachId);
                localStorage.setItem('paidCoaches', JSON.stringify(localPaidCoaches));
              } 
            }
          }
        } catch (dbError) {
          console.error('Database error when checking payments:', dbError);
        }
      } catch (error) {
        console.error('Error checking user session or payments:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkUserAndPayments();
  }, [coachId]);

  const handleWhatsAppClick = async () => {
    // Check if user is logged in first
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      alert('You need to log in before accessing coach WhatsApp.');
      navigate('/login');
      return;
    }
    
    // Skip the info modal and go directly to payment method selector
    setIsPaymentMethodSelectorOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsPaymentModalOpen(false);
  };

  if (!coach) {
    return (
      <div className="coach-detail-page-container">
        <Navbar showProfile={true} />
        <div className="coach-detail-content">
          <h1>Coach Not Found</h1>
          <p>The coach you are looking for does not exist.</p>
          <Link to="/coach" className="back-to-coaches-button">Back to Coaches</Link>
        </div>
      </div>
    );
  }

  const handleProceedPayment = () => {
    // Close the payment info modal
    setIsPaymentModalOpen(false);
    
    // Open the payment method selector
    setIsPaymentMethodSelectorOpen(true);
  };
  
  const handlePaymentComplete = async (paidCoachId) => {
    if (!currentUser) {
      // For testing purposes, allow payment without login
      console.log('No user logged in, but continuing with payment flow for testing');
    }
    
    try {
      // Set payment as successful immediately for the current session
      setHasPaid(true);
      
      // Try to record the payment in Supabase, but don't block the flow if it fails
      if (currentUser) {
        try {
          const { error } = await supabase
            .from('coach_payments')
            .insert([
              { 
                user_id: currentUser.id, 
                coach_id: coachId,
                amount: 999, // Amount in MAD
                payment_date: new Date().toISOString(),
                plan_type: 'lifetime'
              }
            ]);
          
          if (error) {
            console.error('Error recording payment in database:', error);
            // Continue with the payment flow even if database recording fails
          }
        } catch (dbError) {
          console.error('Database error:', dbError);
          // Continue with payment flow despite database error
        }
      } else {
        // For testing: Store in localStorage if no user is logged in
        const paidCoaches = JSON.parse(localStorage.getItem('paidCoaches') || '[]');
        if (!paidCoaches.includes(coachId)) {
          paidCoaches.push(coachId);
          localStorage.setItem('paidCoaches', JSON.stringify(paidCoaches));
        }
      }
      
      // Close the payment method selector
      setTimeout(() => {
        setIsPaymentMethodSelectorOpen(false);
        
        // After successful payment, redirect to WhatsApp
        setTimeout(() => {
          // Use the coach's phone number if available, or a default
          const phoneNumber = getCoachPhoneNumber(coachId);
          const whatsappUrl = `https://wa.me/${phoneNumber}`;
          
          // Open WhatsApp in a new tab
          window.open(whatsappUrl, '_blank');
        }, 500);
      }, 1500);
    } catch (error) {
      console.error('Error in payment process:', error);
      // Even if there's an error, let's continue with the flow for demo purposes
      setHasPaid(true);
      
      setTimeout(() => {
        setIsPaymentMethodSelectorOpen(false);
        
        setTimeout(() => {
          const phoneNumber = getCoachPhoneNumber(coachId);
          const whatsappUrl = `https://wa.me/${phoneNumber}`;
          window.open(whatsappUrl, '_blank');
        }, 500);
      }, 1500);
    }
  };
  
  const handleCancelPayment = () => {
    setIsPaymentMethodSelectorOpen(false);
  };
  
  // Function to get coach phone number based on coach ID
  const getCoachPhoneNumber = (id) => {
    // You can replace these with actual coach phone numbers
    const phoneNumbers = {
      chris: '+212632731678',
      david: '+212612910010',
      hany: '+212612910010'
    };
    
    return phoneNumbers[id] || '+212612910010'; // Default number if coach ID not found
  };

  return (
    <div className="coach-detail-page-container">
      <Navbar showProfile={true} />
      <div className="coach-detail-content">
        <div className="coach-detail-header">
          <img src={coach.image} alt={coach.name} className="coach-detail-image" />
          <h1 className="coach-detail-name">{coach.name}</h1>
        </div>
        <div className="coach-detail-body">
          <h2>Biography</h2>
          <p>{coach.bio}</p>
          
          <h2>Specialties</h2>
          <ul>
            {coach.specialties.map(specialty => (
              <li key={specialty}>{specialty}</li>
            ))}
          </ul>
          
          <h2>Contact</h2>
          <p>Email: <a href={`mailto:${coach.contact}`}>{coach.contact}</a></p>
          
          {hasPaid ? (
            <a 
              href={`https://wa.me/${getCoachPhoneNumber(coachId)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-button"
            >
              <i className="fab fa-whatsapp"></i> Chat on WhatsApp
            </a>
          ) : (
            <button className="whatsapp-button" onClick={handleWhatsAppClick}>
              <i className="fab fa-whatsapp"></i> Get WhatsApp Access
            </button>
          )}
        </div>
        <Link to="/coach" className="back-to-coaches-button">Back to Coaches List</Link>
      </div>
      
      {/* Payment Info Modal */}
      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={handleCloseModal}
        coachName={coach.name}
        onProceed={handleProceedPayment}
        paymentStatus={paymentStatus}
        selectedPlan={selectedPlan}
      />
      
      {/* Payment Method Selector */}
      {isPaymentMethodSelectorOpen && (
        <div className="payment-method-overlay">
          <PaymentMethodSelector 
            onPaymentComplete={handlePaymentComplete}
            onCancel={handleCancelPayment}
            coachId={coachId}
          />
        </div>
      )}    </div>
  );
};

export default CoachDetailPage;