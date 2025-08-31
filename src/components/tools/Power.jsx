import WidgetCard from "./WidgetCard";

export default function PowerCard() {
    const actions = ["shutdown", "restart", "sleep"];
    return (
        <WidgetCard title="Power Options">
            <p className="text-yellow-400 mb-2">
                <i className="bi bi-exclamation-triangle-fill"></i> Warning: Save your work first!
            </p>
            <div className="flex flex-col gap-3">
                {actions.map((action) => (
                    <button
                        key={action}
                        onClick={() => {
                            if (!confirm(`Are you sure you want to ${action}?`)) return;
                            fetch("/api/power", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ action }),
                            })
                                .then(() => alert(`${action} command sent successfully.`))
                                .catch(() => alert(`Failed to ${action}.`));
                        }}
                        className={`${action === "shutdown"
                                ? "bg-red-600 hover:bg-red-500"
                                : action === "restart"
                                    ? "bg-yellow-600 hover:bg-yellow-500"
                                    : "bg-blue-600 hover:bg-blue-500"
                            } px-4 py-2 rounded-lg flex items-center gap-2`}
                    >
                        <i
                            className={`bi ${action === "shutdown" ? "bi-power" : action === "restart" ? "bi-arrow-clockwise" : "bi-moon-fill"
                                }`}
                        ></i>{" "}
                        {action.charAt(0).toUpperCase() + action.slice(1)}
                    </button>
                ))}
            </div>
        </WidgetCard>
    );
}
