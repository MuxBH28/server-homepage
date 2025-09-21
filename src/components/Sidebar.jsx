import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ server, appVersions, mobileOpen, setMobileOpen, links = [], incrementLinkOpened }) {
    const location = useLocation();

    const navItems = [
        { path: "/", label: "Dashboard", icon: "bi-speedometer2" },
        { path: "/links", label: "Links", icon: "bi-link-45deg" },
        { path: "/network", label: "Network", icon: "bi-hdd-network" },
        { path: "/tools", label: "Tools", icon: "bi-tools" },
        { path: "/settings", label: "Settings", icon: "bi-gear" },
    ];

    const sidebarContent = (
        <div className="flex flex-col h-full bg-black/50 backdrop-blur-md border-r border-gray-700 p-6 w-64 shadow-lg">
            <div className="flex flex-col items-center mb-8">
                <h2 className="flex items-center text-2xl font-bold text-gray-100 mb-2">
                    <i className="bi bi-activity mr-3 text-red-500 animate-pulse"></i>
                    {server || "Server"}
                </h2>
            </div>

            <nav className="flex-1 overflow-y-auto max-h-[calc(100vh-180px)] scrollbar-none">
                <ul className="space-y-3">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                                        ${isActive
                                            ? "bg-red-600 text-white shadow-md"
                                            : "text-gray-300 hover:bg-gray-700 hover:text-white"
                                        }`}
                                >
                                    <i className={`bi ${item.icon} text-lg`}></i>
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                {links.length > 0 && links.some(link => link.sidebar) && (
                    <>
                        <hr className="my-4 border-gray-700" />
                        <ul className="space-y-3">
                            {links
                                .filter(link => link.sidebar)
                                .map((link) => (
                                    <li key={link.url} className="relative group">
                                        <a
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title={link.url}
                                            onClick={() => {
                                                setMobileOpen(false);
                                                if (incrementLinkOpened && link.url) incrementLinkOpened(link.url);
                                            }}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-gray-300 hover:bg-gray-700 hover:text-white"
                                        >
                                            <i className={`bi ${link.icon || "bi-link"} text-lg`}></i>
                                            <span className="font-medium">{link.name}</span>
                                            {link.opened !== undefined && (
                                                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {link.opened}
                                                </span>
                                            )}
                                        </a>
                                    </li>
                                ))}
                        </ul>
                    </>
                )}
            </nav>

            <footer className="mt-6 border-t border-gray-700 pt-4 text-center text-gray-400 text-sm space-y-1">
                <p>&copy; 2025 Server Homepage</p>
                <p className="text-gray-400 text-xs mt-2">
                    Version: <span className="font-semibold">{appVersions?.local || "N/A"}</span>
                    {appVersions?.local &&
                        appVersions?.github &&
                        appVersions.local !== appVersions.github && (
                            <a
                                href="https://github.com/MuxBH28/server-homepage/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-red-400 font-semibold hover:underline ml-1"
                            >
                                | New: {appVersions.github}
                            </a>
                        )}
                </p>
            </footer>
        </div>
    );

    return (
        <>
            <aside className="hidden md:flex fixed inset-y-0 left-0">
                {sidebarContent}
            </aside>

            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50"
                    onClick={() => setMobileOpen(false)}
                >
                    <div
                        className="absolute left-0 top-0 h-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {sidebarContent}
                    </div>
                </div>
            )}
        </>
    );
}
