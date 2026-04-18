import React from 'react';
import GlobalStyles from './GlobalStyles';

function AccessDeniedScreen({ email, onLogout }) {
  return (
    <div className="ms-screen">
      <GlobalStyles />
      <div className="ms-card">
        <h2 className="ms-title">Access denied</h2>
        <p style={{fontSize:'13px',color:'#605e5c',marginBottom:'20px'}}>
          <strong>{email}</strong> is not authorised to access Whereabouts.<br/>
          Please contact your administrator if you believe this is an error.
        </p>
        <button
          className="ms-btn"
          style={{background:'#f3f2f1',color:'#201f1e',border:'1px solid #8a8886'}}
          onClick={onLogout}
        >
          Sign out and try another account
        </button>
      </div>
    </div>
  );
}

export default AccessDeniedScreen;