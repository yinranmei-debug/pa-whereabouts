import React from 'react';
import GlobalStyles from './GlobalStyles';

function LoginScreen({ onLogin, isInitializing, error }) {
  return (
    <div className="ms-screen">
      <GlobalStyles />
      <div className="ms-card">
        <div style={{display:'flex',justifyContent:'center',marginBottom:28}}>
          <img src="https://i.ibb.co/YTQHg15F/Pattern-Logo.png" alt="Pattern" style={{height:40,objectFit:'contain'}}/>
        </div>
        <h2 className="ms-title">Sign in</h2>
        <p className="ms-sub">Use your Pattern Asia work account to continue</p>
        {isInitializing
          ? <div style={{fontSize:'13px',color:'#605e5c',textAlign:'center'}}>Initializing...</div>
          : (
            <button className="ms-btn" onClick={onLogin} style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
              <svg width="18" height="18" viewBox="0 0 21 21" fill="none">
                <rect x="1" y="1" width="9" height="9" fill="rgba(255,255,255,0.95)"/>
                <rect x="11" y="1" width="9" height="9" fill="rgba(255,255,255,0.7)"/>
                <rect x="1" y="11" width="9" height="9" fill="rgba(255,255,255,0.7)"/>
                <rect x="11" y="11" width="9" height="9" fill="rgba(255,255,255,0.5)"/>
              </svg>
              Sign in with Microsoft
            </button>
          )
        }
        {error && <div className="ms-err">{error}</div>}
        <div className="ms-app-row">
          <div className="ms-app-icon">P</div>
          <div>
            <div style={{fontSize:'13px',fontWeight:'600',color:'#201f1e'}}>Whereabouts</div>
            <div style={{fontSize:'11px',color:'#605e5c'}}>Pattern Asia Pacific</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;