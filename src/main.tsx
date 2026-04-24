import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ProfileProvider } from "./contexts/ProfileContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ProfileProvider>
    <App />
  </ProfileProvider>,
);
