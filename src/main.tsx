import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { App } from "./App";
import { Landing } from "./Landing";
import { LangProvider } from "./i18n/LangContext";

function Root() {
  const [showLanding, setShowLanding] = useState(true);

  if (showLanding) {
    return <Landing onEnter={() => setShowLanding(false)} />;
  }

  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LangProvider>
      <Root />
    </LangProvider>
  </React.StrictMode>,
);
