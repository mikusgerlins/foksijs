import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ProfileProvider } from "./contexts/ProfileContext";
import { restoreAndroidProgress } from "./hooks/useProgress";
import "./index.css";

function mount() {
  createRoot(document.getElementById("root")!).render(
    <ProfileProvider>
      <App />
    </ProfileProvider>,
  );
}

// A browser starts from its own localStorage. On Android, restore the last
// confirmed native write even when WebView was killed before flushing its copy.
void restoreAndroidProgress().then(mount, mount);
