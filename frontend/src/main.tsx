import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthProvider";
import App from "@/App";
import "@/index.css";

/* VITE_STATIC_PREVIEW=1 produces a build that runs straight off the file
   system (double-click index.html) for sharing with clients. Everything
   else uses normal history routing. */
const Router = import.meta.env.VITE_STATIC_PREVIEW ? HashRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  </React.StrictMode>,
);
