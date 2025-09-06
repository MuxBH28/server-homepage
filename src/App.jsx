import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.css";

import Preloader from "./components/Preloader";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import Links from "./components/Links";
import Network from "./components/Network";
import Tools from "./components/Tools";
import Info from "./components/Info";
import Settings from "./components/Settings";
import Welcome from "./components/Welcome";

function App() {
  const [settings, setSettings] = useState({
    login: false,
    diskPaths: [],
    refreshInterval: 5,
    rss: "",
    bgPath: "",
    appVersions: { local: "N/A", github: "N/A" }
  });
  const [showWelcome, setShowWelcome] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (data) setSettings(data);

        if (!data?.welcome) {
          setShowWelcome(true);
        }

        const refreshInput = document.getElementById("refreshInterval");
        if (refreshInput) refreshInput.value = data.refreshInterval;
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };

    loadSettings();
  }, []);

  const saveSettings = async () => {
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      console.log("Settings saved to backend.");
    } catch (err) {
      console.error("Failed to save settings:", err);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const active = document.activeElement;
      if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) return;

      if (e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        if (settings.favouriteLink) {
          window.open(settings.favouriteLink, "_blank");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [settings.favouriteLink]);


  return (
    <Router>
      <div className="font-sans min-h-screen flex bg-gradient-to-br from-[#1f1f2e] to-[#2c2c3a] text-white">
        <Sidebar server={settings.server} appVersions={settings.appVersions} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
          <Header name={settings.name} onMobileToggle={() => setMobileOpen(!mobileOpen)} />
          <main className="flex-1 p-6 space-y-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/links" element={<Links />} />
              <Route path="/network" element={<Network refreshInterval={settings.refreshInterval} />} />
              <Route path="/tools" element={<Tools refreshInterval={settings.refreshInterval} tools={settings.tools} />} />
              <Route path="/info" element={<Info />} />
              <Route path="/settings" element={<Settings settings={settings} setSettings={setSettings} />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </main>
        </div>

        <Preloader />
        {showWelcome && (
          <Welcome
            isOpen={showWelcome}
            onClose={() => setShowWelcome(false)}
            settings={settings}
            saveSettings={saveSettings}
          />
        )}
      </div>
    </Router>
  );
}

export default App;
