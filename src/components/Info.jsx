import { useState } from "react";

export default function Info() {
    const [copyStatus, setCopyStatus] = useState("Copy Repo Link");

    const handleCopy = () => {
        const repoLink = "https://github.com/MuxBH28/server-homepage/";
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(repoLink).then(() => {
                setCopyStatus("Link copied!");
                setTimeout(() => setCopyStatus("Copy Repo Link"), 1500);
            });
        } else {
            // fallback
            const tempInput = document.createElement("input");
            document.body.appendChild(tempInput);
            tempInput.value = repoLink;
            tempInput.select();
            document.execCommand("copy");
            document.body.removeChild(tempInput);
            setCopyStatus("Link copied!");
            setTimeout(() => setCopyStatus("Copy Repo Link"), 1500);
        }
    };

    return (
        <div className="shadow-lg rounded-2xl p-6 mt-3 md:p-8 bg-black/40 backdrop-blur-md border border-white/20 flex flex-col w-full h-full relative">
            <h2 className="text-xl font-semibold text-gray-200 mb-4">Info</h2>

            <div className="flex justify-center mb-4">
                <img
                    src="/assets/logo.png"
                    alt="Server Logo"
                    className="w-32 sm:w-48 h-32 sm:h-48 rounded-full border-2 border-red-600"
                />
            </div>

            <p className="text-gray-300 text-sm sm:text-base mb-5 text-center sm:text-left">
                This is a minimalist personal homepage project built with a <strong>Node.js (Express)</strong> backend
                and a <strong>React + Vite</strong> frontend using <strong>TailwindCSS</strong>.<br />
                It provides real-time system monitoring (CPU, RAM, Disk, uptime), manages custom links through a REST API,
                and displays network information.<br />
                The project is designed to run on a Linux server and can be accessed locally or over a LAN.
            </p>

            <div className="space-y-2 text-gray-300 text-sm sm:text-base mb-6">
                <p>
                    <strong>Author:</strong>{" "}
                    <a href="https://msehic.com/" target="_blank" className="underline text-red-500">
                        msehic.com
                    </a>
                </p>
                <p>
                    <strong>GitHub Repo:</strong>{" "}
                    <a href="https://github.com/MuxBH28/server-homepage/" target="_blank" className="underline text-red-500">
                        github.com/MuxBH28/server-homepage
                    </a>
                </p>
                <p>
                    <strong>Scriptable iOS Widget:</strong>{" "}
                    <a
                        href="https://github.com/MuxBH28/server-homepage/?tab=readme-ov-file#scriptable"
                        target="_blank"
                        className="underline text-red-500"
                    >
                        View Scriptable Widget
                    </a>
                </p>
                <p>
                    <strong>Default Background:</strong> by{" "}
                    <a
                        href="https://pixabay.com/users/sinnesreich-2779296/?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=1759179"
                        target="_blank"
                        className="underline text-red-500"
                    >
                        Manuela
                    </a>{" "}
                    from{" "}
                    <a
                        href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=image&utm_content=1759179"
                        target="_blank"
                        className="underline text-red-500"
                    >
                        Pixabay
                    </a>
                </p>
                <p>
                    <strong>SVG Icons:</strong> Sourced from{" "}
                    <a href="https://www.svgrepo.com/" target="_blank" className="underline text-red-500">
                        SVG Repo - Car Parts 2
                    </a>
                </p>
                <p>
                    <strong>Bootstrap Icons:</strong>{" "}
                    <a href="https://icons.getbootstrap.com/" target="_blank" className="underline text-red-500">
                        Bootstrap Icons
                    </a>
                </p>
                <p>
                    <strong>Special Thanks:</strong> the{" "}
                    <a href="https://www.reddit.com/r/homelab/" target="_blank" className="underline text-red-500">
                        r/homelab community
                    </a>
                </p>
            </div>

            <div className="flex flex-col sm:flex-col md:absolute md:bottom-4 md:right-4 gap-2">
                <button
                    onClick={handleCopy}
                    className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-white flex items-center justify-center gap-2"
                >
                    <i className="bi bi-link-45deg"></i> {copyStatus}
                </button>

                <a
                    href="https://github.com/sponsors/MuxBH28/"
                    target="_blank"
                    className="bg-pink-600 hover:bg-pink-500 px-4 py-2 rounded-lg text-white flex items-center justify-center gap-2"
                >
                    <i className="bi bi-heart-fill"></i> Sponsor the Project
                </a>

                <a
                    href="https://github.com/MuxBH28/server-homepage/issues/new"
                    target="_blank"
                    className="bg-yellow-600 hover:bg-yellow-500 px-4 py-2 rounded-lg text-white flex items-center justify-center gap-2"
                >
                    <i className="bi bi-bug-fill"></i> Report a Bug
                </a>
            </div>
        </div>
    );
}
