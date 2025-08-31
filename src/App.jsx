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
import Modal from "./components/Welcome";

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

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (data) setSettings(data);

        if (data?.welcome !== false) {
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

  return (
    <Router>
      <div className="font-sans min-h-screen flex bg-gradient-to-br from-[#1f1f2e] to-[#2c2c3a] text-white">
        <Sidebar server={settings.server} appVersions={settings.appVersions} />

        <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
          <Header name={settings.name} />
          <main className="flex-1 p-6 space-y-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/links" element={<Links />} />
              <Route path="/network" element={<Network refreshInterval={settings.refreshInterval} />} />
              <Route path="/tools" element={<Tools settings={settings} />} />
              <Route path="/info" element={<Info />} />
              <Route path="/settings" element={<Settings settings={settings} />} />
            </Routes>
          </main>
        </div>

        <Preloader />
        {showWelcome && <Modal />}
      </div>
    </Router>
  );
}

export default App;
