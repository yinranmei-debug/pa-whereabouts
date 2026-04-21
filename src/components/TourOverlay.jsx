import React, { useState } from 'react';

export default function TourOverlay({ onDone }) {
  const [step, setStep] = useState(0);
  
  // Adjust this number to match the actual number of steps you have in your tour
  const totalSteps = 4; 

  // Safe wrapper to ensure state updates don't break the component unmounting
  const handleAction = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDone();
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (step < totalSteps - 1) {
      setStep(prev => prev + 1);
    } else {
      // If we are on the final step, call the cleanup function
      handleAction(e);
    }
  };

  return (
    <div className="tour-overlay-card dsz" style={{
      position: 'fixed', 
      inset: 0, 
      zIndex: 11500, // Important: keep below WelcomeConfetti (12000)
      background: 'rgba(15,23,42,0.6)', 
      backdropFilter: 'blur(4px)',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff', 
        borderRadius: '24px', 
        padding: '32px',
        width: '400px', 
        maxWidth: '90vw', 
        boxShadow: '0 24px 64px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ margin: '0 0 16px', fontSize: '22px', color: '#111827' }}>
          Tour Step {step + 1}
        </h2>
        
        <p style={{ margin: '0 0 24px', fontSize: '15px', color: '#4b5563', lineHeight: 1.5 }}>
          {/* Replace this with your actual tour content */}
          Welcome to the Whereabouts app! This is placeholder content for step {step + 1}.
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            onClick={handleAction} 
            style={{
              background: 'transparent', 
              border: 'none', 
              color: '#64748b', 
              cursor: 'pointer', 
              fontWeight: '600',
              padding: '8px'
            }}
          >
            Skip
          </button>
          
          <button 
            onClick={handleNext} 
            style={{
              background: 'linear-gradient(135deg,#009bff,#770bff)', 
              border: 'none', 
              color: '#fff', 
              padding: '10px 24px', 
              borderRadius: '12px', 
              cursor: 'pointer', 
              fontWeight: '700'
            }}
          >
            {step === totalSteps - 1 ? "Let's go" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}