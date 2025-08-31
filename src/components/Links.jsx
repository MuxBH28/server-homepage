import { useEffect, useState } from "react";

export default function Links() {
    const [links, setLinks] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState(localStorage.getItem("linksFilter") || "none");

    useEffect(() => {
        fetchLinks();
    }, []);

    const fetchLinks = async () => {
        try {
            const res = await fetch("/api/links");
            const data = await res.json();
            setLinks(data);
        } catch (err) {
            console.error("Failed to fetch links:", err);
            setLinks([]);
        }
    };


    const incrementLinkOpened = async (url) => {
        try {
            await fetch(`/api/links/${encodeURIComponent(url)}/increment`, { method: "POST" });
            fetchLinks();
        } catch (err) {
            console.error("Failed to increment opened count:", err);
        }
    };


    const checkLinkStatus = async (url) => {
        try {
            await fetch(url, { method: "HEAD", mode: "no-cors" });
            return "green";
        } catch {
            return "red";
        }
    };


    const applyFilter = (links) => {
        switch (filter) {
            case "category":
                return [...links].sort((a, b) => a.category.localeCompare(b.category));
            case "status":
                return [...links].sort((a, b) => a.opened === 0 && b.opened !== 0 ? 1 : -1);
            case "mostClicked":
                return [...links].sort((a, b) => b.opened - a.opened);
            case "leastClicked":
                return [...links].sort((a, b) => a.opened - b.opened);
            default:
                return links;
        }
    };

    const filteredLinks = applyFilter(
        Array.from(new Map(
            links
                .filter(link => link.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(link => [link.url, link])
        ).values())
    );


    return (
        <section className="shadow-lg rounded-2xl p-6 mt-3 md:p-8 bg-black/40 backdrop-blur-md border border-white/20 flex flex-col w-full h-full">
            <div className="flex gap-4 mb-8">
                <input
                    type="search"
                    placeholder="Search links..."
                    autoComplete="off"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-[2] rounded-lg px-4 py-2 bg-white/10 backdrop-blur-md border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 shadow-lg transition-all"
                />

                <select
                    value={filter}
                    onChange={(e) => {
                        setFilter(e.target.value);
                        localStorage.setItem("linksFilter", e.target.value);
                    }}
                    className="flex-1 rounded-lg px-4 py-2 bg-white/10 backdrop-blur-md border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 shadow-lg transition-all"
                >
                    <option value="none">No Filter</option>
                    <option value="category">Category</option>
                    <option value="status">Status</option>
                    <option value="mostClicked">Most Clicked</option>
                    <option value="leastClicked">Least Clicked</option>
                </select>
            </div>


            <section className="flex-1 overflow-auto w-full space-y-4 pt-4">
                {filteredLinks.length === 0 ? (
                    <p className="text-center text-gray-400 italic mt-4">
                        Could not find any links.
                    </p>
                ) : (
                    <div className="flex flex-wrap gap-4 justify-center">
                        {filteredLinks.map((link, idx) => (
                            <LinkCard
                                key={link.globalIndex || idx}
                                link={link}
                                onClick={() => incrementLinkOpened(link.url)}
                                checkLinkStatus={checkLinkStatus}
                            />
                        ))}
                    </div>
                )}
            </section>

        </section>
    );
}

function LinkCard({ link, onClick, checkLinkStatus }) {
    const [status, setStatus] = useState("gray");

    useEffect(() => {
        const check = async () => {
            const result = await checkLinkStatus(link.url);
            setStatus(result);
        };
        check();
    }, [link.url, checkLinkStatus]);

    const statusStyle = {
        gray: "bg-gray-400",
        green: "bg-green-500 shadow-[0_0_4px_1.5px_rgba(34,197,94,0.6),0_0_8px_2.5px_rgba(34,197,94,0.4)]",
        red: "bg-red-600 shadow-[0_0_4px_1.5px_rgba(239,68,68,0.6),0_0_8px_2.5px_rgba(239,68,68,0.4)]",
    };

    return (
        <a
            href={link.url}
            target="_blank"
            onClick={onClick}
            className="relative flex flex-col items-start gap-2 text-white rounded-lg p-4 w-60 sm:w-64
               bg-white/10 backdrop-blur-md border border-white/20 shadow-lg
               transition-transform transform hover:scale-105 hover:bg-white/20"
        >
            <div className="flex items-center gap-2 w-full">
                <span
                    className={`status-dot inline-block w-3 h-3 rounded-full ${statusStyle[status]}`}
                ></span>
                <i className={`bi ${link.icon} text-2xl`}></i>
                <span className="font-semibold text-lg truncate">{link.name}</span>
            </div>

            <span className="text-gray-400 text-sm mt-1 truncate">{link.category}</span>

            <span className="absolute bottom-2 right-2 text-gray-300 text-xs">
                {link.opened} clicks
            </span>
        </a>
    );
}

