import { useState } from "react";

export default function Info({ isOpen, onClose }) {
    const [copyStatus, setCopyStatus] = useState("Copy Repo Link");

    const handleCopy = () => {
        const repoLink = "https://github.com/MuxBH28/server-homepage/";
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(repoLink).then(() => {
                setCopyStatus("Link copied!");
                setTimeout(() => setCopyStatus("Copy Repo Link"), 1500);
            });
        } else {
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

    if (!isOpen) return null;

    const LinkRow = ({ label, value, url, icon = "bi-link-45deg" }) => (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-black/30 border border-neutral-800 rounded-xl hover:border-neutral-700 transition-colors duration-200 gap-2">
            <div className="flex items-center gap-2.5 text-neutral-400 text-sm">
                <i className={`bi ${icon} text-red-500`}></i>
                <span className="font-medium">{label}</span>
            </div>
            <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-mono text-neutral-200 hover:text-red-400 transition-colors duration-150 truncate max-w-xs sm:max-w-md underline decoration-neutral-700 hover:decoration-red-400"
            >
                {value}
            </a>
        </div>
    );

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="w-full max-w-4xl bg-[#111] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 bg-black/20">
                    <div className="flex items-center gap-4">
                        <img
                            src="/assets/logo.png"
                            alt="Server Logo"
                            className="w-10 h-10 rounded-xl border border-red-500/30 object-cover"
                        />
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                                Server Homepage
                            </h2>
                            <p className="text-neutral-400 text-xs sm:text-sm mt-0.5">
                                Project information & credits
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-neutral-400 hover:text-red-500 transition-colors duration-200 p-2 hover:bg-neutral-800/50 rounded-lg text-xl"
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="overflow-y-auto p-6 space-y-6">

                    <p className="text-neutral-300 text-sm sm:text-base leading-relaxed bg-neutral-900/30 p-4 rounded-xl border border-neutral-800/40">
                        This is a minimalist personal homepage project built with a <strong className="text-white font-semibold">Node.js (Express)</strong> backend
                        and a <strong className="text-white font-semibold">React + Vite</strong> frontend using <strong className="text-white font-semibold">TailwindCSS</strong>.
                        It provides real-time system monitoring (CPU, RAM, Disk, uptime), manages custom links through a REST API,
                        and displays network information. Designed to run smoothly on Linux servers.
                    </p>

                    <div className="bg-black/40 border border-neutral-800 rounded-xl p-5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 h-full w-1 bg-red-500"></div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-2">
                            Author Message
                        </h3>
                        <p className="text-neutral-400 text-sm italic leading-relaxed">
                            "Thank you for checking out Server Homepage. I originally made this just for myself, to keep an eye on my server and have everything in one place.
                            I honestly didn't expect anyone else to find it useful or interesting. Everything you see here is built and maintained by me alone.
                            If you ever run into problems, have questions, ideas, or suggestions, please feel free to open a GitHub issue or reach out in any way that works for you."
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <LinkRow label="Author" value="msehic.com" url="https://msehic.com/" icon="bi-person-fill" />
                        <LinkRow label="GitHub Repo" value="github.com/.../server-homepage" url="https://github.com/MuxBH28/server-homepage/" icon="bi-github" />
                        <LinkRow label="iOS Widget" value="View Scriptable Widget" url="https://github.com/MuxBH28/server-homepage/?tab=readme-ov-file#scriptable" icon="bi-phone-fill" />
                        <LinkRow label="Firefox Add-on" value="Monitor your server in Firefox" url="https://addons.mozilla.org/en-US/firefox/addon/server-homepage-monitor/" icon="bi-browser-firefox" />
                        <LinkRow label="SVG Icons" value="SVG Repo - Car Parts 2" url="https://www.svgrepo.com/" icon="bi-images" />
                        <LinkRow label="Bootstrap Icons" value="Icons Ecosystem" url="https://icons.getbootstrap.com/" icon="bi-info-circle-fill" />
                    </div>

                </div>

                <div className="px-6 py-4 border-t border-neutral-800 bg-black/20 flex flex-col sm:flex-row justify-end gap-3 text-sm">
                    <button
                        onClick={handleCopy}
                        className="bg-blue-600/10 hover:bg-blue-600 border border-blue-500/20 hover:border-blue-500 text-blue-400 hover:text-white px-4 py-2.5 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 font-medium"
                    >
                        <i className="bi bi-link-45deg text-lg"></i> {copyStatus}
                    </button>

                    <a
                        href="https://github.com/MuxBH28/server-homepage/issues/new"
                        target="_blank"
                        rel="noreferrer"
                        className="bg-yellow-600/10 hover:bg-yellow-600 border border-yellow-500/20 hover:border-yellow-500 text-yellow-500 hover:text-white px-4 py-2.5 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 font-medium"
                    >
                        <i className="bi bi-bug-fill"></i> Report a Bug
                    </a>

                    <a
                        href="https://github.com/sponsors/MuxBH28/"
                        target="_blank"
                        rel="noreferrer"
                        className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2.5 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 font-medium shadow-lg shadow-pink-600/10"
                    >
                        <i className="bi bi-heart-fill"></i> Sponsor Project
                    </a>
                </div>

            </div>
        </div>
    );
}