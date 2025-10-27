import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AppDataProvider } from "./lib/app-data-context";
import { AuthProvider } from "./lib/auth-context";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <AppDataProvider>
      <App />
    </AppDataProvider>
  </AuthProvider>
);
