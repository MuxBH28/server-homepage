import { useState } from "react";
import WidgetCard from "./WidgetCard";

export default function QRCard() {
    const [text, setText] = useState("");
    const [qrUrl, setQrUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState({
        type: "png",
        width: 256,
        color: "#000000",
        bgColor: "#ffffff",
    });

    const jokes = [
        "Why are you reading this empty QR Code?\nNext time please add some text or URL!\nSincerely,\nServer Homepage",
        "https://youtu.be/XfELJU1mRMg",
        "I am Buzz Aldrin. Second man to step on the moon.\nNeil before me.",
        "How many Trump supporters does it take to change a lightbulb?\nNone. Trump says it's done and they all cheer in the dark.",
        "What genre are national anthems?\nCountry.",
        "“DO NOT TOUCH” must be one of the most terrifying things to read in braille.",
        "Superglue can also be used for cleaning your computer keyboarddddddddddddddddddddddddddddddddddddddddddd",
        "Chameleons are supposed to blend well, but I think it's ruined this smoothie.",
        "Man addicted to drinking brake fluid claims he can stop anytime he wants.",
        "I asked Tom Hanks for his autograph, but all he wrote was thanks.",
        "Together, I can beat schizophrenia.",
        "Tequila won't fix your life but it's worth a shot.",
        "Say what you want about waitresses but they bring a lot to the table",
        "The thief who stole my iPhone could face time.",
        "Today I went for a walk with a girl, she noticed me, so we went for a run.",
        "The urge to sing The Lion Sleeps Tonight is only ever a whim away."
    ];

    const generateQR = async () => {
        setLoading(true);
        let value = text.trim();
        if (!value) value = jokes[Math.floor(Math.random() * jokes.length)];

        try {
            const res = await fetch("/api/urltoqrl", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: value, ...options }),
            });

            if (!res.ok) throw new Error("Failed to generate QR");
            setQrUrl(`/assets/qrcode.png?ts=${Date.now()}`);
        } catch (err) {
            console.error(err);
            setQrUrl(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <WidgetCard title="QR Generator">
            {!qrUrl ? (
                <div className="flex flex-col items-center gap-4">
                    <input
                        type="text"
                        placeholder="Enter text or URL"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full rounded-lg px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400"
                    />

                    <div className="flex gap-2 w-full">
                        <select
                            value={options.type}
                            onChange={(e) => setOptions({ ...options, type: e.target.value })}
                            className="flex-1 rounded-lg px-4 py-2 bg-white/10 border border-white/20 text-white cursor-pointer"
                        >
                            <option value="png">PNG</option>
                            <option value="svg">SVG</option>
                        </select>
                        <select
                            value={options.width}
                            onChange={(e) => setOptions({ ...options, width: parseInt(e.target.value) })}
                            className="flex-1 rounded-lg px-4 py-2 bg-white/10 border border-white/20 text-white cursor-pointer"
                        >
                            <option value="128">128 px</option>
                            <option value="256">256 px</option>
                            <option value="512">512 px</option>
                            <option value="1024">1024 px</option>
                        </select>
                    </div>

                    <div className="flex gap-4">
                        <label className="flex flex-col items-center gap-1 text-sm text-gray-300">
                            QR Color
                            <input
                                type="color"
                                value={options.color}
                                onChange={(e) => setOptions({ ...options, color: e.target.value })}
                                className="w-16 h-8 rounded-lg border border-gray-700"
                            />
                        </label>
                        <label className="flex flex-col items-center gap-1 text-sm text-gray-300">
                            Background
                            <input
                                type="color"
                                value={options.bgColor}
                                onChange={(e) => setOptions({ ...options, bgColor: e.target.value })}
                                className="w-16 h-8 rounded-lg border border-gray-700"
                            />
                        </label>
                    </div>

                    <button
                        onClick={generateQR}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg w-full"
                    >
                        {loading ? "Generating..." : "Generate QR"}
                    </button>

                    <p className="text-gray-400 text-xs">
                        QR Code is always stored in "./assets/" folder.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-3">
                    <h2 className="text-red-600 text-lg font-semibold flex items-center gap-2">
                        <i className="bi bi-qr-code"></i> QR Code is ready:
                    </h2>
                    <img
                        src={qrUrl}
                        alt="QR Code"
                        className="border rounded-md"
                    />
                    <div className="flex gap-2">
                        <a
                            href="/assets/qrcode.png"
                            download
                            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg"
                        >
                            <i className="bi bi-file-earmark-arrow-down"></i> Download QR
                        </a>
                        <button
                            onClick={() => {
                                setQrUrl(null);
                                setText("");
                            }}
                            className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
                        >
                            <i className="bi bi-arrow-repeat"></i> Make One More
                        </button>
                    </div>
                </div>
            )}
        </WidgetCard>
    );
}
