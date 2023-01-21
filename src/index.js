import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(//react strict mode renders components twice,removing it will render components once
  <React.StrictMode> 
    <App />
  </React.StrictMode>
);

