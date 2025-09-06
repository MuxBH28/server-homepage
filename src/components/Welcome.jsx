import { useState, useEffect } from "react";

export default function Welcome({ isOpen, onClose, settings, saveSettings }) {
    const [serverName, setServerName] = useState(settings?.server || "");
    const [yourName, setYourName] = useState(settings?.name || "");
    const [dontShow, setDontShow] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setServerName(settings?.server || "");
            setYourName(settings?.name || "");
            setDontShow(settings?.welcome || false);
        }
    }, [isOpen, settings]);

    const handleClose = async () => {
        if (saveSettings) {
            try {
                await saveSettings({
                    ...settings,
                    server: serverName || "Server name",
                    name: yourName || "User",
                    welcome: dontShow ? true : false,
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
            navigator.clipboard.writeText(repoLink).then(() => alert("Link copied!"));
        } else {
            const tempInput = document.createElement("input");
            document.body.appendChild(tempInput);
            tempInput.value = repoLink;
            tempInput.select();
            document.execCommand("copy");
            document.body.removeChild(tempInput);
            alert("Link copied!");
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
            <div className="bg-[#3f5466]/60 backdrop-blur-lg text-[#f2eee7] rounded-xl p-6 w-full max-w-4xl shadow-lg border border-white/10 relative flex flex-col space-y-6 overflow-y-auto max-h-[90vh]">
                <button
                    onClick={handleClose}
                    aria-label="Close modal"
                    className="absolute top-4 right-4 text-red-600 hover:text-red-500 text-3xl font-bold"
                >
                    &times;
                </button>

                <div className="flex justify-center mb-4">
                    <img src="./assets/logo.png" alt="Server Logo" className="w-24 h-24" />
                </div>

                <h2 className="text-2xl font-bold mb-4">Welcome to Server Homepage</h2>

                <div className="space-y-3 text-sm">
                    <p>This is your server monitoring homepage. Here you can view:</p>
                    <ul className="list-disc list-inside ml-4">
                        <li>CPU, RAM, and disk usage</li>
                        <li>System processes</li>
                        <li>Network information</li>
                        <li>Quick links to your favorite tools or apps</li>
                    </ul>
                    <p>You can manage links and settings via the settings modal.</p>

                    <div className="flex gap-4 mt-4">
                        <div className="flex-1">
                            <label htmlFor="serverNameInput" className="block text-sm font-medium mb-1">
                                Server name
                            </label>
                            <input
                                type="text"
                                id="serverNameInput"
                                value={serverName}
                                onChange={(e) => setServerName(e.target.value)}
                                className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-red-500"
                            />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="yourNameInput" className="block text-sm font-medium mb-1">
                                Your name
                            </label>
                            <input
                                type="text"
                                id="yourNameInput"
                                value={yourName}
                                onChange={(e) => setYourName(e.target.value)}
                                className="w-full p-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-red-500"
                            />
                        </div>
                    </div>

                    <hr className="border-gray-600 my-3" />

                    <p>Useful links:</p>
                    <ul className="list-disc list-inside ml-4">
                        <li>
                            <a
                                href="https://github.com/MuxBH28/server-homepage/"
                                target="_blank"
                                rel="noreferrer"
                                className="text-red-500 hover:underline"
                            >
                                GitHub Repository
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://msehic.com/"
                                target="_blank"
                                rel="noreferrer"
                                className="text-red-500 hover:underline"
                            >
                                Author's website
                            </a>
                        </li>
                    </ul>
                    <p>Please report ideas, suggestions, bugs or any issues directly in GitHub.</p>

                    <hr className="border-gray-600 my-3" />

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="dontShowWelcome"
                            checked={dontShow}
                            onChange={(e) => setDontShow(e.target.checked)}
                            className="accent-red-600"
                        />
                        <label htmlFor="dontShowWelcome" className="text-sm">
                            Don't show this welcome screen again
                        </label>
                    </div>
                </div>

                <div className="mt-6 flex justify-between items-center">
                    <button
                        onClick={handleShare}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold"
                    >
                        Share Repo
                    </button>

                    <button
                        onClick={handleClose}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold"
                    >
                        Close Welcome Screen
                    </button>
                </div>
            </div>
        </div>
    );
}
