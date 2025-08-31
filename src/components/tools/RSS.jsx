import { useEffect, useState } from "react";
import WidgetCard from "./WidgetCard";

export default function RSSCard() {
    const [items, setItems] = useState([]);

    useEffect(() => {
        fetchRSS();
        const id = setInterval(fetchRSS, 10 * 60 * 1000);
        return () => clearInterval(id);
    }, []);

    const fetchRSS = async () => {
        try {
            const res = await fetch("/api/rss");
            const data = await res.json();
            setItems(data || []);
        } catch {
            setItems(null);
        }
    };

    return (
        <WidgetCard title="RSS Reader">
            {!items ? (
                <p className="text-red-600 text-center">Failed to load RSS feed.</p>
            ) : items.length === 0 ? (
                <p className="text-gray-400 text-center">No RSS items found.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {items.map((item, idx) => (
                        <a
                            key={idx}
                            href={item.link}
                            target="_blank"
                            className="flex flex-col justify-between border border-red-700 rounded-xl shadow-lg p-4 hover:bg-gray-700 transition transform hover:scale-105 hover:shadow-2xl"
                        >
                            <div>
                                <h3 className="font-semibold text-white text-sm md:text-base line-clamp-2">
                                    {item.title}
                                </h3>
                            </div>
                            <p className="text-gray-400 text-xs mt-2">
                                {new Date(item.pubDate).toLocaleString()}
                            </p>
                        </a>
                    ))}
                </div>
            )}
        </WidgetCard>
    );
}
