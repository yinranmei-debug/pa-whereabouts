import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import TestDimensional from './TestDimensional';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  window.location.search.includes('test=dimensional')
    ? <TestDimensional />
    : <App />
);