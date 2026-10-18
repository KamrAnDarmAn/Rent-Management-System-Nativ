import { AppContent } from "./src/bootstrap/AppContent";
import { AppProviders } from "./src/bootstrap/AppProviders";
import "./src/global.css";
import "./src/i18n";

export default function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}
