
  import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AppDataProvider } from "./lib/app-data-context";

createRoot(document.getElementById("root")!).render(
  <AppDataProvider>
    <App />
  </AppDataProvider>
);
  
