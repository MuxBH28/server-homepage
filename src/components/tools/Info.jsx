import WidgetCard from "./WidgetCard";

export default function InfoCard() {
    return (
        <WidgetCard title="No tools enabled">

            <div className="flex items-center justify-center h-full text-center p-6">
                <div>
                    <h2 className="text-2xl font-bold text-red-500 mb-2"><i className="bi bi-emoji-frown"></i> No Tools Enabled</h2>
                    <p className="text-gray-400">
                        Currently there are no tools enabled. <br />
                        Go to <strong>Settings</strong> and select which tools you want to appear here.
                    </p>
                </div>
            </div>
        </WidgetCard>
    );
}
