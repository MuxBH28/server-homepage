import { useState, useEffect } from "react";
import ProcessCard from "./tools/Process";
import CryptoCard from "./tools/Crypto";
import NotesCard from "./tools/Notes";
import RSSCard from "./tools/RSS";
import PowerCard from "./tools/Power";
import HardwareCard from "./tools/Hardware";
import QRCard from "./tools/QR";
import InfoCard from "./tools/Info";

const allWidgets = [
    { key: "Process", label: "Process", icon: "bi-cpu", component: ProcessCard },
    { key: "Crypto", label: "Crypto", icon: "bi-currency-bitcoin", component: CryptoCard },
    { key: "Notes", label: "Notes", icon: "bi-stickies", component: NotesCard },
    { key: "RSS", label: "RSS", icon: "bi-rss", component: RSSCard },
    { key: "Power", label: "Power", icon: "bi-power", component: PowerCard },
    { key: "Hardware", label: "Hardware", icon: "bi-hdd", component: HardwareCard },
    { key: "QR", label: "QR", icon: "bi-qr-code", component: QRCard }
];

export default function Tools({ refreshInterval, tools }) {
    const availableWidgets = allWidgets.filter(w => tools?.[w.label]);

    const [active, setActive] = useState(() => {
        const stored = localStorage.getItem("activeWidget");
        if (stored && availableWidgets.some(w => w.key === stored)) return stored;
        if (availableWidgets.length > 0) return availableWidgets[0].key;
        return null;
    });

    const ActiveWidget =
        availableWidgets.find(w => w.key === active)?.component || InfoCard;

    useEffect(() => {
        if (active) localStorage.setItem("activeWidget", active);
    }, [active]);

    return (
        <section className="flex flex-col h-full">
            {availableWidgets.length > 0 && (
                <div className="flex gap-4 mb-6 overflow-x-auto pb-2 border-b border-white/10">
                    {availableWidgets.map(({ key, label, icon }) => (
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
            )}

            <div className="flex-1 overflow-auto">
                <ActiveWidget refreshInterval={refreshInterval} />
            </div>
        </section>
    );
}
