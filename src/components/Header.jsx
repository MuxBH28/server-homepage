import { useEffect, useState } from "react";
import Info from "./Info";
import StatsModal from "./StatsModal";
import useIsMobile from "../hooks/useIsMobile";

export default function Header({ name, onMobileToggle }) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [burgerOpen, setBurgerOpen] = useState(false);
    const [welcomeMsg, setWelcomeMsg] = useState("");
    const [infoOpen, setInfoOpen] = useState(false);
    const [statsOpen, setStatsOpen] = useState(false);
    const isMobile = useIsMobile();

    const handleBurgerClick = () => {
        if (isMobile && onMobileToggle) {
            onMobileToggle();
        } else {
            setBurgerOpen(!burgerOpen);
        }
    };

    const toggleInfo = () => setInfoOpen(!infoOpen);
    const toggleStats = () => setStatsOpen(!statsOpen);

    const platformHints = [
        "View stats on iOS with Scriptable widgets.",
        "Use Firefox add-on for quick dashboard access.",
        "Check your server from mobile widgets anytime.",
        "Keep stats one click away with browser extension.",
    ];

    const getWelcomeMessage = (hour) => {
        let messages = [];

        if (hour >= 0 && hour < 5) {
            messages = [
                "Why are you still awake? Debugging something spooky?",
                "It's 3 AM… are you coding or dreaming in JavaScript?",
                "Night owl spotted! Hope the bugs are sleepy too.",
                "Late hours, deep thoughts. Don't forget to rest.",
                "You may not rest now, there are bugs nearby!",
                "The server sleeps, but you don't. Keep watch!",
            ];
        } else if (hour >= 5 && hour < 12) {
            messages = [
                "Good morning! Hope you had a nice sleep.",
                "Rise and shine, a new day is waiting!",
                "Fresh start! Let's make today productive.",
                "Coffee first, then conquer the code.",
                "Time to craft your morning!",
                "Sun's up, time to respawn with energy!",
            ];
        } else if (hour >= 12 && hour < 17) {
            messages = [
                "Good afternoon! Stay productive and focused.",
                "Keep the energy up, the day is still young.",
                "Time to get things done — one commit at a time!",
                "Sun is high, motivation higher!",
                "Halfway to victory! Keep smashing those tasks.",
                "Lunch break? Or adventure time in code?",
            ];
        } else if (hour >= 17 && hour < 22) {
            messages = [
                "Good evening! Time to wrap things up nicely.",
                "Hope your day was amazing so far!",
                "Evenings are perfect for reflection and code cleanup.",
                "Take it easy, but finish strong.",
                "Nightfall approaches… prepare your base!",
                "XP gained today: productive. Rest soon!",
            ];
        } else {
            messages = [
                "Getting late… maybe it's time to rest soon.",
                "Midnight thoughts hit different — commit carefully.",
                "Don't let the night shift take over completely!",
                "Dark outside, bright ideas inside.",
                "You may not rest now, there are bugs nearby!",
                "The world sleeps, but your server doesn't.",
            ];
        }
        const maybeHint = Math.random() < 0.25
            ? platformHints[Math.floor(Math.random() * platformHints.length)]
            : null;

        const base = messages[Math.floor(Math.random() * messages.length)];
        return maybeHint ? maybeHint : base;
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setWelcomeMsg(getWelcomeMessage(currentTime.getHours()));
    }, [currentTime.getHours()]);

    useEffect(() => {
        if (!burgerOpen) return;
        const onKey = (e) => e.key === "Escape" && setBurgerOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [burgerOpen]);

    const formatTime = (date) =>
        date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });

    const formatTimeShort = (date) =>
        date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });

    const formatDate = (date) =>
        date.toLocaleDateString([], {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });

    const formatDateShort = (date) =>
        date.toLocaleDateString([], {
            weekday: "short",
            month: "short",
            day: "numeric",
        });

    return (
        <>
            <header className="sticky top-0 z-30 w-full bg-black/50 backdrop-blur-md border-b border-gray-700 px-3 sm:px-6 pb-3 md:pb-4 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] md:pt-4 flex justify-between items-center gap-3 shadow-lg">
                <div className="min-w-0 flex-1">
                    <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-200 truncate">
                        Welcome, <span className="text-red-500">{name || "User"}</span>
                    </h1>
                    <p className="text-gray-400 text-xs sm:text-sm mt-0.5 md:mt-1 truncate" title={welcomeMsg}>
                        <span className="lg:hidden font-mono text-gray-200 mr-2">
                            {formatTimeShort(currentTime)}
                        </span>
                        {welcomeMsg}
                    </p>
                </div>

                <div className="flex flex-col items-end gap-1 md:gap-2 shrink-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                        <div className="hidden lg:block whitespace-nowrap text-2xl font-mono text-gray-200 bg-gray-800/50 px-5 py-2 rounded-xl shadow-inner tracking-wider">
                            {formatTime(currentTime)}
                        </div>
                        <button
                            onClick={toggleStats}
                            className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 inline-flex items-center justify-center text-gray-200 hover:text-red-500 text-lg sm:text-xl lg:text-2xl rounded-lg bg-gray-800/50 shadow"
                            title="System Statistics"
                            aria-label="System Statistics"
                        >
                            <i className="bi bi-graph-up-arrow"></i>
                        </button>
                        <button
                            onClick={toggleInfo}
                            className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 inline-flex items-center justify-center text-gray-200 hover:text-red-500 text-lg sm:text-xl lg:text-2xl rounded-lg bg-gray-800/50 shadow"
                            title="Info"
                            aria-label="Info"
                        >
                            <i className="bi bi-info-square"></i>
                        </button>
                        <button
                            onClick={handleBurgerClick}
                            className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 inline-flex items-center justify-center text-gray-200 hover:text-red-500 text-lg sm:text-xl lg:text-2xl rounded-lg bg-gray-800/50 shadow"
                            aria-label="Menu"
                        >
                            <i className={`bi ${burgerOpen ? "bi-x-lg" : "bi-list"} `}></i>
                        </button>
                    </div>

                    <div className="hidden sm:flex text-gray-400 text-sm items-center gap-2">
                        <i className="bi bi-calendar-heart text-red-400"></i>
                        <span className="hidden lg:inline">{formatDate(currentTime)}</span>
                        <span className="lg:hidden">{formatDateShort(currentTime)}</span>
                    </div>
                </div>
            </header>

            {burgerOpen && (
                <div className="fixed inset-0 z-[9998]" onClick={() => setBurgerOpen(false)} />
            )}

            {burgerOpen && (
                <div className="fixed top-[72px] right-3 md:right-6 w-64 max-w-[calc(100vw-1.5rem)] max-h-[calc(100dvh-5rem)] overflow-y-auto bg-black/80 backdrop-blur-md rounded-xl shadow-xl border border-gray-700 p-4 z-[9999]">
                    <div className="flex flex-col items-center mb-3">
                        <img src="/assets/logo.png" alt="Logo" className="w-16 h-16 mb-2" />
                        <h2 className="text-gray-200 font-bold text-lg">
                            Server Homepage
                        </h2>
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


                        <hr className="border-gray-700 my-3" />

                        <li className="text-gray-400 text-xs uppercase tracking-wider">
                            Quick Access
                        </li>

                        <li>
                            <a
                                href="https://github.com/MuxBH28/server-homepage/?tab=readme-ov-file#scriptable"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 hover:text-red-500"
                            >
                                <i className="bi bi-phone-fill"></i> iOS Widget
                            </a>
                        </li>

                        <li>
                            <a
                                href="https://addons.mozilla.org/en-US/firefox/addon/server-homepage-monitor/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 hover:text-red-500"
                            >
                                <i className="bi bi-browser-firefox"></i> Firefox Add-on
                            </a>
                        </li>
                    </ul>
                </div>
            )}

            <Info isOpen={infoOpen} onClose={() => setInfoOpen(false)} />
            <StatsModal isOpen={statsOpen} onClose={() => setStatsOpen(false)} />
        </>
    );
}
