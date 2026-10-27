import { useEffect, useState } from "react";
import WidgetCard from "./WidgetCard";

export default function CryptoCard() {
    const [crypto, setCrypto] = useState(null);

    useEffect(() => {
        fetchCrypto();
        const id = setInterval(fetchCrypto, 60000);
        return () => clearInterval(id);
    }, []);

    const fetchCrypto = async () => {
        try {
            const res = await fetch("/api/crypto");
            const data = await res.json();
            setCrypto(data || {});
        } catch {
            setCrypto(null);
        }
    };

    return (
        <WidgetCard title="Crypto Prices">
            {!crypto ? (
                <p className="text-red-600">Failed to load crypto prices.</p>
            ) : Object.keys(crypto).length === 0 ? (
                <p className="text-gray-400">No crypto data available.</p>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-700">
                    <table className="w-full text-left text-xs sm:text-sm text-gray-300">
                        <thead className="bg-gray-800">
                            <tr>
                                <th className="px-2 sm:px-3 py-2 border-b border-gray-700">Coin</th>
                                <th className="px-2 sm:px-3 py-2 border-b border-gray-700 whitespace-nowrap">Price (USD)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(crypto).map(([coin, info]) => (
                                <tr key={coin} className="hover:bg-gray-700">
                                    <td className="px-2 sm:px-3 py-1 border-b border-gray-700">{coin.toUpperCase()}</td>
                                    <td className="px-2 sm:px-3 py-1 border-b border-gray-700 whitespace-nowrap">
                                        {typeof info?.usd === "number" ? `$${info.usd.toLocaleString()}` : "N/A"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </WidgetCard>
    );
}
