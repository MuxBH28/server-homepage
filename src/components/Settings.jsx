import { useEffect, useState } from "react";

export default function Settings({ settings, setSettings }) {
    const [links, setLinks] = useState([]);
    const [authMessage, setAuthMessage] = useState("");
    const [editingIndex, setEditingIndex] = useState(null);

    useEffect(() => {
        fetchLinks();
    }, []);

    const defaultTools = {
        Process: false,
        Crypto: false,
        Notes: false,
        RSS: false,
        Power: false,
        Hardware: false,
        QR: false
    };

    const saveSettings = async (e) => {
        const btn = e.currentTarget;
        const original = btn.innerHTML;

        try {
            await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });

            console.log("Settings saved to backend.");
            btn.innerHTML = `<i class="bi bi-check2"></i> Saved`;

            setTimeout(() => {
                btn.innerHTML = original;
            }, 1000);
        } catch (err) {
            console.error("Failed to save settings:", err);
        }
    };


    const handleDiskPathKey = (e) => {
        if (e.key === "Enter") {
            const newPath = e.target.value.trim();
            if (newPath && !settings.diskPaths.includes(newPath)) {
                setSettings(prev => ({ ...prev, diskPaths: [...prev.diskPaths, newPath] }));
                e.target.value = "";
            }
        }
    };

    const removeDiskPath = (index) => {
        setSettings(prev => ({
            ...prev,
            diskPaths: prev.diskPaths.filter((_, i) => i !== index)
        }));
    };

    const fetchLinks = async () => {
        try {
            const res = await fetch("/api/links");
            const data = await res.json();
            setLinks(data || []);
        } catch (err) {
            console.error("Failed to fetch links:", err);
        }
    };

    const startEdit = (idx) => {
        const link = links[idx];
        document.getElementById("linkName").value = link.name;
        document.getElementById("linkUrl").value = link.url;
        document.getElementById("linkIcon").value = link.icon;
        document.getElementById("linkCategory").value = link.category;
        setEditingIndex(idx);
    };

    const saveLink = async (e) => {
        e.preventDefault();
        const name = document.getElementById("linkName").value.trim();
        const url = document.getElementById("linkUrl").value.trim();
        const icon = document.getElementById("linkIcon").value.trim() || "bi-link-45deg";
        const category = document.getElementById("linkCategory").value;

        if (!name || !url) return;

        try {
            if (editingIndex !== null) {
                await fetch(`/api/links/${editingIndex}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, url, icon, category })
                });
            } else {
                await fetch("/api/links", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, url, icon, category })
                });
            }
            fetchLinks();
            document.getElementById("addLinkForm").reset();
            setEditingIndex(null);
        } catch (err) {
            console.error("Failed to save link:", err);
        }
    };

    const deleteLink = async (index) => {
        try {
            await fetch(`/api/links/${index}`, { method: "DELETE" });
            fetchLinks();
        } catch (err) {
            console.error("Failed to delete link:", err);
        }
    };

    const setFavourite = (index) => {
        const favUrl = links[index].url;
        setSettings((prev) => ({ ...prev, favouriteLink: favUrl }));
        saveSettings();
    };

    const downloadLinks = async () => {
        const blob = new Blob([JSON.stringify(links, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "links.json";
        a.click();
        URL.revokeObjectURL(url);
    };

    const uploadLinks = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const jsonData = JSON.parse(event.target.result);
                await fetch("/api/linksFile", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(jsonData)
                });
                alert("Links uploaded successfully!");
                fetchLinks();
            } catch (err) {
                alert("Invalid JSON file or upload failed!");
            }
        };
        reader.readAsText(file);
    };

    const setAuthPin = async () => {
        const pin = document.getElementById("authPin").value.trim();
        if (!pin) {
            setAuthMessage("No PIN entered. Authentication is disabled.");
            return;
        }

        try {
            const res = await fetch("/api/set-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pin })
            });
            const data = await res.json();
            if (data.success) {
                setAuthMessage("PIN saved successfully!");
                document.getElementById("authPin").value = "";
            } else {
                setAuthMessage(data.error || "Failed to save PIN.");
            }
        } catch (err) {
            setAuthMessage("Error communicating with server.");
            console.error(err);
        }
    };

    useEffect(() => {
        if (!settings.tools) {
            setSettings(prev => ({ ...prev, tools: { ...defaultTools } }));
        } else {
            setSettings(prev => ({
                ...prev,
                tools: { ...defaultTools, ...prev.tools }
            }));
        }
    }, []);

    return (
        <>
            <div className="shadow-lg rounded-2xl p-6 mt-3 md:p-8 bg-black/40 backdrop-blur-md border border-white/20 flex flex-col w-full h-full relative">
                <h2 className="text-red-600 text-2xl font-semibold text-center">Settings</h2>
                <p className="text-gray-400 text-xs text-center mb-6">
                    Note: Some changes are visible <strong>after</strong> refreshing page.
                </p>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <article className="space-y-2 col-span-1">
                        <h3 className="text-red-600 font-semibold text-lg">Login Auth</h3>
                        <div className="flex flex-col sm:flex-row gap-2 items-center">
                            <input
                                type="password"
                                id="authPin"
                                placeholder="Enter PIN"
                                className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-red-600"
                            />
                            <button
                                onClick={setAuthPin}
                                className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-white flex items-center gap-2"
                            >
                                <i className="bi bi-lock-fill"></i> Enter
                            </button>
                        </div>
                        <p className="text-gray-400 text-xs">
                            Leave empty if you don't want authentication on login.
                        </p>
                        <p className="text-yellow-500 text-sm">{authMessage}</p>
                    </article>

                    <div className="col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-2 col-span-1">
                            <label
                                htmlFor="refreshInterval"
                                className="block text-red-600 font-semibold"
                            >
                                Refresh Interval
                            </label>
                            <input
                                type="number"
                                id="refreshInterval"
                                min="5"
                                max="3600"
                                step="1"
                                onChange={(e) =>
                                    setSettings((prev) => ({
                                        ...prev,
                                        refreshInterval: Math.min(
                                            Math.max(5, parseInt(e.target.value) || 5),
                                            3600
                                        ),
                                    }))
                                }
                                className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-red-600"
                            />
                            <p className="text-gray-400 text-xs">
                                Minimum 5 seconds, maximum 3600 seconds (1 hour)
                            </p>
                            <button
                                onClick={saveSettings}
                                className="fixed top-2 right-4 bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-white flex items-center gap-2 shadow-lg"
                            >
                                <i className="bi bi-floppy"></i> Save
                            </button>
                        </div>

                        <div className="space-y-2 col-span-2">
                            <h3 className="text-red-600 font-semibold text-lg">Manage Links File</h3>
                            <div className="flex flex-col sm:flex-row gap-2 justify-center">
                                <label className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-white flex items-center gap-2 cursor-pointer">
                                    <i className="bi bi-upload"></i> Upload
                                    <input
                                        id="uploadLinks"
                                        type="file"
                                        accept=".json"
                                        onChange={uploadLinks}
                                        className="hidden"
                                    />
                                </label>
                                <button
                                    onClick={downloadLinks}
                                    className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-white flex items-center gap-2"
                                >
                                    <i className="bi bi-download"></i> Download
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <article className="space-y-3">
                        <div>
                            <label
                                htmlFor="diskPathsInput"
                                className="block text-red-600 font-semibold mb-1"
                            >
                                Disk Paths
                            </label>
                            <input
                                type="text"
                                id="diskPathsInput"
                                placeholder="e.g /250GB"
                                onKeyPress={handleDiskPathKey}
                                className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-red-600"
                            />
                            <ul className="space-y-1 mt-2">
                                {settings.diskPaths.map((path, idx) => (
                                    <li
                                        key={idx}
                                        className="flex justify-between items-center bg-gray-800 rounded px-3 py-2 mb-1"
                                    >
                                        <span>{path}</span>
                                        <button
                                            className="text-red-500 hover:text-red-400"
                                            onClick={() => removeDiskPath(idx)}
                                            title="Remove"
                                        >
                                            <i className="bi bi-x-lg"></i>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <p className="text-gray-400 text-xs">Press Enter to add a new path</p>
                        </div>
                        <div>
                            <label htmlFor="rssUrl" className="block text-red-600 font-semibold mb-1">
                                RSS Feed URL
                            </label>
                            <input
                                type="text"
                                id="rssUrl"
                                placeholder="https://hnrss.org/frontpage"
                                value={settings.rss || ""}
                                onChange={(e) =>
                                    setSettings((prev) => ({ ...prev, rss: e.target.value }))
                                }
                                className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-red-600"
                            />
                            <p className="text-gray-400 text-xs">
                                No idea for RSS - more info on this{" "}
                                <a
                                    href="https://github.com/MuxBH28/server-homepage/blob/main/extra/rss.md"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-red-500 hover:underline"
                                >
                                    Server Homepage GitHub
                                </a>.
                            </p>
                        </div>

                    </article>

                    <article className="space-y-3">
                        <label className="block text-red-600 font-semibold mb-1">
                            Tools Selection
                        </label>
                        <ul className="space-y-1">
                            {Object.keys(settings.tools || {}).map((tool) => {
                                const isEnabled = settings.tools[tool];
                                return (
                                    <li
                                        key={tool}
                                        className="flex justify-between items-center bg-gray-800 rounded px-3 py-2"
                                    >
                                        <span className="text-gray-200">{tool}</span>
                                        <button
                                            onClick={() =>
                                                setSettings(prev => ({
                                                    ...prev,
                                                    tools: {
                                                        ...prev.tools,
                                                        [tool]: !isEnabled
                                                    }
                                                }))
                                            }
                                            className={`w-12 h-6 rounded-full p-0.5 flex items-center transition-colors duration-200 ${isEnabled ? "bg-green-500" : "bg-red-500"
                                                }`}
                                        >
                                            <span
                                                className={`bg-white w-5 h-5 rounded-full shadow transform transition-transform duration-200 ${isEnabled ? "translate-x-6" : "translate-x-0"
                                                    }`}
                                            ></span>
                                        </button>
                                    </li>
                                );
                            })}
                            <li className="flex justify-between items-center bg-gray-800 rounded px-3 py-2">
                                <span className="text-gray-200">You need a new tool?</span>
                                <a
                                    href="https://github.com/MuxBH28/server-homepage/issues"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-red-600 hover:bg-red-500 px-2 py-0 rounded-lg text-white"
                                >
                                    <i className="bi bi-node-plus"></i>  Request
                                </a>
                            </li>
                        </ul>
                    </article>

                </section>

                <section className="space-y-3 mt-6">
                    <h3 className="text-red-600 font-semibold text-lg">Add Link</h3>
                    <form id="addLinkForm" onSubmit={saveLink} className="flex flex-col space-y-2">
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="text"
                                id="linkName"
                                placeholder="Link Name"
                                required
                                className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-red-600"
                            />
                            <select
                                id="linkCategory"
                                required
                                className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-red-600 w-full"
                            >
                                <option value="">Select a category</option>
                                <option value="Media">Media</option>
                                <option value="Files">Files</option>
                                <option value="Infrastructure">Infrastructure</option>
                                <option value="Development">Development</option>
                                <option value="External">External</option>
                                <option value="Other">Other</option>
                            </select>
                            <input
                                type="text"
                                id="linkIcon"
                                placeholder="Link Icon e.g. bi-youtube"
                                required
                                className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-red-600"
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="url"
                                id="linkUrl"
                                placeholder="Link URL"
                                required
                                className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-red-600 w-full"
                            />
                            <button
                                type="submit"
                                className={`${editingIndex !== null
                                    ? "bg-green-600 hover:bg-green-500"
                                    : "bg-red-600 hover:bg-red-500"
                                    } px-4 py-2 rounded-lg text-white flex items-center gap-2 sm:w-auto w-full justify-center`}
                            >
                                <i className={editingIndex !== null ? "bi bi-save" : "bi bi-plus-circle"}></i>
                                {editingIndex !== null ? "Save" : "Add"}
                            </button>
                        </div>
                    </form>

                    <ul className="mt-4 space-y-2">
                        {links.map((link, idx) => (
                            <li
                                key={idx}
                                className="flex justify-between items-center bg-gray-800 px-3 py-2 rounded"
                            >
                                <div className="flex items-center gap-2">
                                    <i className={`bi ${link.icon} text-red-500`}></i>
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-white hover:text-red-400"
                                    >
                                        {link.name}
                                    </a>
                                    <span className="text-xs text-gray-400">[{link.category}]</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setFavourite(idx)}
                                        className="text-yellow-400 hover:text-yellow-200"
                                        title="Favourite link"
                                    >
                                        <i
                                            className={`bi ${settings.favouriteLink === link.url ? "bi-star-fill" : "bi-star"}`}
                                        ></i>
                                    </button>
                                    <button
                                        onClick={() => startEdit(idx)}
                                        className="text-green-500 hover:text-green-300"
                                        title="Edit link"
                                    >
                                        <i className="bi bi-pencil"></i>
                                    </button>
                                    <button
                                        onClick={() => deleteLink(idx)}
                                        className="text-red-500 hover:text-red-300"
                                        title="Delete link"
                                    >
                                        <i className="bi bi-trash"></i>
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
                <section className="space-y-3 mt-6">
                    <h3 className="text-red-600 font-semibold text-lg">Keyboard Shortcuts</h3>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center rounded border bg-gray-100 text-black px-2 py-0.5 font-mono shadow-sm">
                                Ctrl
                            </span>
                            +
                            <span className="inline-flex items-center justify-center rounded border bg-gray-100 text-black px-2 py-0.5 font-mono shadow-sm">
                                V
                            </span>
                            <span className="text-gray-400">— Add new link (on Links page)</span>
                        </li>

                        <li className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center rounded border bg-gray-100 text-black px-2 py-0.5 font-mono shadow-sm">
                                Shift
                            </span>
                            +
                            <span className="inline-flex items-center justify-center rounded border bg-gray-100 text-black px-2 py-0.5 font-mono shadow-sm">
                                F
                            </span>
                            <span className="text-gray-400">— Open favourite link in new tab</span>
                        </li>

                        <li className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center rounded border bg-gray-100 text-black px-2 py-0.5 font-mono shadow-sm">
                                Ctrl
                            </span>
                            +
                            <span className="inline-flex items-center justify-center rounded border bg-gray-100 text-black px-2 py-0.5 font-mono shadow-sm">
                                R
                            </span>
                            <span className="text-gray-400">— Reload page</span>
                        </li>

                        <li className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center rounded border bg-gray-100 text-black px-2 py-0.5 font-mono shadow-sm">
                                R
                            </span>
                            <span className="text-gray-400">— Refresh info (on Dashboard & Network)</span>
                        </li>
                    </ul>
                </section>

            </div>
        </>
    );

}
