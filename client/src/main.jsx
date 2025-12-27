import {createRoot} from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import {BrowserRouter} from "react-router-dom";
import {ClerkProvider} from "@clerk/clerk-react";
import {AppProvider} from "./context/AppContext.jsx";

const PUBLISHED_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHED_KEY) {
  throw new Error("Missing PUBLISHED KEY");
}

createRoot(document.getElementById("root")).render(
  <ClerkProvider publishableKey={PUBLISHED_KEY}>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </ClerkProvider>
);
