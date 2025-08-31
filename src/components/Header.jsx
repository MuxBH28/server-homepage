import { useEffect, useState } from "react";

export default function Header({ name }) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [burgerOpen, setBurgerOpen] = useState(false);

    const welcomeMessages = [
        "Have a productive day!",
        "We hope you the best!",
        "Let's make today amazing!",
        "Keep up the great work!",
        "Stay focused and motivated!",
        "Time to shine!",
        "Another day, another opportunity!"
    ];
    const [welcomeMsg, setWelcomeMsg] = useState("");

    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
        setWelcomeMsg(welcomeMessages[randomIndex]);

        const interval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (date) =>
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const formatDate = (date) =>
        date.toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    return (
        <>
            <header className="w-full bg-black/50 backdrop-blur-md border-b border-gray-700 px-6 py-4 flex justify-between items-center shadow-lg relative">
                <div>
                    <h1 className="text-2xl font-bold text-gray-200">
                        Welcome, <span className="text-red-500">{name || "User"}</span>
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">{welcomeMsg}</p>
                </div>

                <div className="flex flex-col items-end gap-2 relative">
                    <div className="flex items-center gap-3">
                        <div className="text-2xl font-mono text-gray-200 bg-gray-800/50 px-5 py-2 rounded-xl shadow-inner tracking-wider">
                            {formatTime(currentTime)}
                        </div>
                        <button
                            onClick={() => setBurgerOpen(!burgerOpen)}
                            className="text-gray-200 hover:text-red-500 text-2xl p-2 rounded-lg bg-gray-800/50 shadow"
                        >
                            <i className={`bi ${burgerOpen ? "bi-x-lg" : "bi-list"}`}></i>
                        </button>
                    </div>

                    <div className="text-gray-400 text-sm flex items-center gap-2 mt-1">
                        <i className="bi bi-calendar-heart text-red-400"></i>
                        {formatDate(currentTime)}
                    </div>
                </div>
            </header>
            {burgerOpen && (
                <div className="fixed top-[72px] right-6 w-64 bg-black/80 backdrop-blur-md rounded-xl shadow-xl border border-gray-700 p-4 z-[9999]">
                    <div className="flex flex-col items-center mb-3">
                        <img src="/assets/logo.png" alt="Logo" className="w-16 h-16 mb-2" />
                        <h2 className="text-gray-200 font-bold text-lg">Server Homepage</h2>
                    </div>

                    <hr className="border-gray-600 mb-3" />

                    <ul className="space-y-2 text-gray-300">
                        <li>
                            <a
                                href="https://github.com/MuxBH28/server-homepage/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 hover:text-red-500"
                            >
                                <i className="bi bi-github"></i> GitHub Repo
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://github.com/sponsors/MuxBH28"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 hover:text-red-500"
                            >
                                <i className="bi bi-heart-fill"></i> Sponsor
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://github.com/MuxBH28/server-homepage/issues"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 hover:text-red-500"
                            >
                                <i className="bi bi-bug-fill"></i> Bug Report
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://msehic.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 hover:text-red-500"
                            >
                                <i className="bi bi-person-circle"></i> Author
                            </a>
                        </li>
                    </ul>
                </div>
            )}
        </>
    );
}
