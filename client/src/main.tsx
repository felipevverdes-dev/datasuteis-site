import { createRoot } from "react-dom/client";
import { applyDocumentLanguage, readStoredLanguage } from "@/lib/site";
import App from "./App";
import "./index.css";

applyDocumentLanguage(readStoredLanguage());

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/service-worker.js");
  });
}

createRoot(document.getElementById("root")!).render(<App />);
