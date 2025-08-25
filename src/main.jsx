import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "../context/ThemeContext.jsx";
import { UserProvider } from "../context/userContext.jsx";
import { ToastContainer } from 'react-toastify';
  import 'react-toastify/dist/ReactToastify.css';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>   {/* 👈 Outer */}
      <UserProvider>  {/* 👈 Inner */}
        <BrowserRouter>
          <ToastContainer />
          <App />
        </BrowserRouter>
      </UserProvider>
    </ThemeProvider>
  </React.StrictMode>
);

