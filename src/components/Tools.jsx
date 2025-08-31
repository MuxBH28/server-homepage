import { useState, useEffect } from "react";
import ProcessCard from "./tools/Process";
import CryptoCard from "./tools/Crypto";
import NotesCard from "./tools/Notes";
import RSSCard from "./tools/RSS";
import PowerCard from "./tools/Power";
import HardwareCard from "./tools/Hardware";
import QRCard from "./tools/QR";

const widgets = [
    { key: "process", label: "Process", icon: "bi-cpu", component: ProcessCard },
    { key: "crypto", label: "Crypto", icon: "bi-currency-bitcoin", component: CryptoCard },
    { key: "notes", label: "Notes", icon: "bi-stickies", component: NotesCard },
    { key: "rss", label: "RSS", icon: "bi-rss", component: RSSCard },
    { key: "power", label: "Power", icon: "bi-power", component: PowerCard },
    { key: "hardware", label: "Hardware", icon: "bi-hdd", component: HardwareCard },
    { key: "qr", label: "QR", icon: "bi-qr-code", component: QRCard }
];

export default function Tools({ settings }) {
    const [active, setActive] = useState(
        () => localStorage.getItem("activeWidget") || "process"
    );

    const ActiveWidget = widgets.find((w) => w.key === active)?.component || null;

    useEffect(() => {
        localStorage.setItem("activeWidget", active);
    }, [active]);

    return (
        <section className="flex flex-col h-full">
            <div className="flex gap-4 mb-6 overflow-x-auto pb-2 border-b border-white/10">
                {widgets.map(({ key, label, icon }) => (
                    <button
                        key={key}
                        onClick={() => setActive(key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all 
              ${active === key ? "bg-red-600 text-white shadow-lg" : "bg-white/5 hover:bg-white/10 text-gray-300"}`}
                    >
                        <i className={`bi ${icon} text-lg`}></i>
                        <span className="text-sm font-medium">{label}</span>
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-auto">
                {ActiveWidget && <ActiveWidget refreshInterval={settings.refreshInterval} />}
            </div>
        </section>
    );
}
