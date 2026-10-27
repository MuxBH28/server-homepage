import { useState } from "react";
import WidgetCard from "./WidgetCard";

export default function YtDlpCard() {
    const [url, setUrl] = useState("");
    const [format, setFormat] = useState("mp3");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleDownload = async () => {
        if (!url.trim() || loading) return;

        try {
            setLoading(true);
            setError("");

            const res = await fetch("/api/ytdlp", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    url: url.trim(),
                    format,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));

                let message =
                    data.error || "Failed to download media.";

                if (data.files?.length) {
                    message += ` Available files: ${data.files.join(", ")}`;
                }

                throw new Error(message);
            }

            const blob = await res.blob();
            const contentDisposition = res.headers.get("Content-Disposition");

            let filename = `download.${format}`;

            if (contentDisposition) {
                const match = contentDisposition.match(/filename="([^"]+)"/i);

                if (match?.[1]) {
                    filename = match[1];
                }
            }

            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = downloadUrl;
            link.download = filename;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(downloadUrl);
            setUrl("");
        } catch (err) {
            setError(err.message || "Failed to download media.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <WidgetCard title="yt-dlp Downloader">
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => {
                            setUrl(e.target.value);
                            setError("");
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleDownload();
                            }
                        }}
                        placeholder="Paste video URL..."
                        disabled={loading}
                        className="flex-1 min-w-0 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-red-600 transition disabled:opacity-50"
                    />

                    <select
                        value={format}
                        onChange={(e) => {
                            setFormat(e.target.value);
                            setError("");
                        }}
                        disabled={loading}
                        className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-red-600 transition disabled:opacity-50"
                    >
                        <option value="mp3">MP3</option>
                        <option value="mp4">MP4</option>
                    </select>

                    <button
                        onClick={handleDownload}
                        disabled={!url.trim() || loading}
                        className="flex items-center justify-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition"
                    >
                        {loading ? (
                            <>
                                <i className="bi bi-arrow-repeat animate-spin"></i>
                                Processing...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-download"></i>
                                Download
                            </>
                        )}
                    </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <i className="bi bi-info-circle"></i>

                    <span>
                        Download media as {format.toUpperCase()} using yt-dlp.
                    </span>
                </div>

                {error && (
                    <div className="flex items-start gap-2 text-sm text-red-500">
                        <i className="bi bi-exclamation-triangle mt-0.5"></i>
                        <span>{error}</span>
                    </div>
                )}
            </div>
        </WidgetCard>
    );
}