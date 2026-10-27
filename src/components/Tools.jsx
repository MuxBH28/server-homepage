import { useState, useEffect } from "react";
import ProcessCard from "./tools/Process";
import CryptoCard from "./tools/Crypto";
import NotesCard from "./tools/Notes";
import RSSCard from "./tools/RSS";
import HardwareCard from "./tools/Hardware";
import QRCard from "./tools/QR";
import InfoCard from "./tools/Info";
import YtDlpCard from "./tools/YtDlp";

const allWidgets = [
    { key: "Process", label: "Process", icon: "bi-cpu", component: ProcessCard },
    { key: "Crypto", label: "Crypto", icon: "bi-currency-bitcoin", component: CryptoCard },
    { key: "Notes", label: "Notes", icon: "bi-stickies", component: NotesCard },
    { key: "RSS", label: "RSS", icon: "bi-rss", component: RSSCard },
    { key: "Hardware", label: "Hardware", icon: "bi-hdd", component: HardwareCard },
    { key: "QR", label: "QR", icon: "bi-qr-code", component: QRCard },
    { key: "YtDlp", label: "yt-dlp", icon: "bi-youtube", component: YtDlpCard }
];

export default function Tools({ refreshInterval, tools }) {
    const availableWidgets = allWidgets.filter(w => tools?.[w.key]);

    const [active, setActive] = useState(() => localStorage.getItem("activeWidget"));

    const activeKey = availableWidgets.some(w => w.key === active)
        ? active
        : availableWidgets[0]?.key ?? null;

    const ActiveWidget =
        availableWidgets.find(w => w.key === activeKey)?.component || InfoCard;

    useEffect(() => {
        if (activeKey) localStorage.setItem("activeWidget", activeKey);
    }, [activeKey]);

    return (
        <section className="flex flex-col h-full">
            {availableWidgets.length > 0 && (
                <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6 overflow-x-auto scrollbar-none pb-2 border-b border-white/10">
                    {availableWidgets.map(({ key, label, icon }) => (
                        <button
                            key={key}
                            onClick={() => setActive(key)}
                            className={`flex shrink-0 items-center gap-2 px-3 sm:px-4 py-2 rounded-xl transition-all whitespace-nowrap
              ${activeKey === key ? "bg-red-600 text-white shadow-lg" : "bg-white/5 hover:bg-white/10 text-gray-300"}`}
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
