
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import { AuthorizationProvider } from "./app/authorization/AuthorizationContext.tsx";
  import { Toaster } from "./app/components/ui/sonner.tsx";
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(
    <AuthorizationProvider>
      <App />
      <Toaster richColors position="bottom-right" />
    </AuthorizationProvider>
  );
