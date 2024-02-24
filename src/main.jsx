import React from "react";
import ReactDOM from "react-dom/client";
import { createRoot } from "react-dom/client";
import { store } from "./app/store";
import App from "./App.jsx";
import { Provider } from "react-redux";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
