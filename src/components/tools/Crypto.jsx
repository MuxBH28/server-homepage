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
                <table className="w-full text-left text-sm text-gray-300 border border-gray-700 rounded-lg">
                    <thead className="bg-gray-800 sticky top-0">
                        <tr>
                            <th className="px-3 py-2 border-b border-gray-700">Coin</th>
                            <th className="px-3 py-2 border-b border-gray-700">Price (USD)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(crypto).map(([coin, info]) => (
                            <tr key={coin} className="hover:bg-gray-700">
                                <td className="px-3 py-1 border-b border-gray-700">{coin.toUpperCase()}</td>
                                <td className="px-3 py-1 border-b border-gray-700">${info.usd.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </WidgetCard>
    );
}
