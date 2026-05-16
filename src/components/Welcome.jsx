import { useState, useEffect } from "react";

export default function Welcome({ isOpen, onClose, settings, saveSettings }) {
    const [serverName, setServerName] = useState(settings?.server || "");
    const [yourName, setYourName] = useState(settings?.name || "");
    const [dontShow, setDontShow] = useState(false);
    const [copyStatus, setCopyStatus] = useState("Share Repo");

    useEffect(() => {
        if (isOpen) {
            setServerName(settings?.server || "");
            setYourName(settings?.name || "");
            setDontShow(settings?.welcome === true);
        }
    }, [isOpen, settings]);

    const handleClose = async () => {
        if (saveSettings) {
            try {
                await saveSettings({
                    ...settings,
                    server: serverName || "Server name",
                    name: yourName || "User",
                    welcome: dontShow,
                });
            } catch (err) {
                console.error("Failed to save settings:", err);
            }
        }
        if (onClose) onClose();
    };

    const handleShare = () => {
        const repoLink = "https://github.com/MuxBH28/server-homepage/";
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(repoLink).then(() => {
                setCopyStatus("Link copied!");
                setTimeout(() => setCopyStatus("Share Repo"), 1500);
            });
        } else {
            const tempInput = document.createElement("input");
            document.body.appendChild(tempInput);
            tempInput.value = repoLink;
            tempInput.select();
            document.execCommand("copy");
            document.body.removeChild(tempInput);
            setCopyStatus("Link copied!");
            setTimeout(() => setCopyStatus("Share Repo"), 1500);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
            <div className="w-full max-w-4xl bg-[#111] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 bg-black/20">
                    <div className="flex items-center gap-4">
                        <img
                            src="./assets/logo.png"
                            alt="Server Logo"
                            className="w-10 h-10 rounded-xl border border-red-500/30 object-cover"
                        />
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                                Welcome to Server Homepage
                            </h2>
                            <p className="text-neutral-400 text-xs sm:text-sm mt-0.5">
                                Initial setup and feature overview
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleClose}
                        className="text-neutral-400 hover:text-red-500 transition-colors duration-200 p-2 hover:bg-neutral-800/50 rounded-lg text-xl"
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="overflow-y-auto p-6 space-y-6">

                    <div className="space-y-4">
                        <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
                            This is your personal dashboard designed for lightweight, elegant server monitoring. Here is what you can track out of the box:
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-center gap-3 p-3 bg-black/30 border border-neutral-800/60 rounded-xl">
                                <i className="bi bi-cpu text-red-500 text-lg"></i>
                                <span className="text-neutral-300 text-sm font-medium">CPU, RAM, & Temp Analytics</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-black/30 border border-neutral-800/60 rounded-xl">
                                <i className="bi bi-activity text-red-500 text-lg"></i>
                                <span className="text-neutral-300 text-sm font-medium">Live System Processes</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-black/30 border border-neutral-800/60 rounded-xl">
                                <i className="bi bi-hdd-network text-red-500 text-lg"></i>
                                <span className="text-neutral-300 text-sm font-medium">Network Interfaces & Info</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-black/30 border border-neutral-800/60 rounded-xl">
                                <i className="bi bi-grid-1x2 text-red-500 text-lg"></i>
                                <span className="text-neutral-300 text-sm font-medium">Custom REST API Bookmarks</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-neutral-900/20 border border-neutral-800/80 rounded-xl p-5 space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-1">
                            Quick Configuration
                        </h3>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <label htmlFor="serverNameInput" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                                    Server Name
                                </label>
                                <input
                                    type="text"
                                    id="serverNameInput"
                                    placeholder="e.g. Home-Lab"
                                    value={serverName}
                                    onChange={(e) => setServerName(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-neutral-800 text-white font-mono text-sm focus:outline-none focus:border-red-500 transition-colors duration-150"
                                />
                            </div>

                            <div className="flex-1">
                                <label htmlFor="yourNameInput" className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                                    Your Name
                                </label>
                                <input
                                    type="text"
                                    id="yourNameInput"
                                    placeholder="e.g. Administrator"
                                    value={yourName}
                                    onChange={(e) => setYourName(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-neutral-800 text-white font-mono text-sm focus:outline-none focus:border-red-500 transition-colors duration-150"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-neutral-500 italic">
                            * You can fine-tune these details and manage shortcuts inside the settings modal at any time.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-2">
                            Useful Links
                        </h3>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-black/30 border border-neutral-800 rounded-xl gap-2">
                            <div className="flex items-center gap-2.5 text-neutral-400 text-sm">
                                <i className="bi bi-github text-red-500"></i>
                                <span className="font-medium">Source Code</span>
                            </div>
                            <a href="https://github.com/MuxBH28/server-homepage/" target="_blank" rel="noreferrer" className="text-sm font-mono text-neutral-200 hover:text-red-400 transition-colors duration-150 underline decoration-neutral-700">
                                github.com/MuxBH28/server-homepage
                            </a>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-black/30 border border-neutral-800 rounded-xl gap-2">
                            <div className="flex items-center gap-2.5 text-neutral-400 text-sm">
                                <i className="bi bi-globe text-red-500"></i>
                                <span className="font-medium">Author's Website</span>
                            </div>
                            <a href="https://msehic.com/" target="_blank" rel="noreferrer" className="text-sm font-mono text-neutral-200 hover:text-red-400 transition-colors duration-150 underline decoration-neutral-700">
                                msehic.com
                            </a>
                        </div>
                    </div>

                    <div className="bg-neutral-900/20 border border-neutral-800/80 rounded-xl p-5 space-y-3">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
                            Mobile & Browser Access
                        </h3>

                        <p className="text-neutral-300 text-sm leading-relaxed">
                            If you are using an iPhone, you can monitor your server through the iOS widget for quick access to stats.
                            If you are on Firefox, you can install the official add-on to keep your server dashboard always within reach in your browser.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <a
                                href="https://github.com/MuxBH28/server-homepage/?tab=readme-ov-file#scriptable"
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 text-center px-4 py-2 rounded-xl bg-black/40 border border-neutral-800 text-neutral-300 hover:border-red-500 hover:text-white transition"
                            >
                                iOS Widget (Scriptable)
                            </a>

                            <a
                                href="https://addons.mozilla.org/en-US/firefox/addon/server-homepage-monitor/"
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 text-center px-4 py-2 rounded-xl bg-black/40 border border-neutral-800 text-neutral-300 hover:border-red-500 hover:text-white transition"
                            >
                                Firefox Add-on
                            </a>
                        </div>
                    </div>

                    <hr className="border-neutral-800 my-2" />

                    <div className="flex items-center gap-3 p-1">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                id="dontShowWelcome"
                                checked={dontShow}
                                onChange={(e) => setDontShow(e.target.checked)}
                                className="w-4 h-4 rounded border-neutral-800 bg-black/50 text-red-600 focus:ring-0 focus:ring-offset-0 accent-red-600 cursor-pointer"
                            />
                        </div>
                        <label htmlFor="dontShowWelcome" className="text-sm text-neutral-400 select-none cursor-pointer hover:text-neutral-300 transition-colors">
                            Don't show this welcome screen again
                        </label>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-neutral-800 bg-black/20 flex flex-col sm:flex-row justify-end gap-3 text-sm">
                    <button
                        onClick={handleShare}
                        className="bg-blue-600/10 hover:bg-blue-600 border border-blue-500/20 hover:border-blue-500 text-blue-400 hover:text-white px-5 py-2.5 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 font-medium"
                    >
                        <i className="bi bi-share-fill"></i> {copyStatus}
                    </button>

                    <button
                        onClick={handleClose}
                        className="bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 font-medium shadow-lg shadow-red-600/10"
                    >
                        Get Started <i className="bi bi-arrow-right"></i>
                    </button>
                </div>

            </div>
        </div>
    );
}