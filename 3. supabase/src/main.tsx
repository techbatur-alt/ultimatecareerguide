import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AuthProvider } from "./hooks/useAuth";
import "./index.css";

if (typeof window !== "undefined") {
  (window as Window & { __SUPABASE_CONFIGURED__?: boolean }).__SUPABASE_CONFIGURED__ = false;
}

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
