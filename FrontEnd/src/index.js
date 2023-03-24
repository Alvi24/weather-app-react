import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  //react strict mode renders components twice,removing it will render components once
  <StrictMode>
    <App />
  </StrictMode>
);
