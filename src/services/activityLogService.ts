
export interface ActivityLog {
    id: string;
    type: "invoice" | "estimate";
    action: "deactivated" | "reactivated";
    documentId: string;
    customerName: string;
    amount: number;
    date: string; // ISO string
    timestamp: number; // For sorting
}

const STORAGE_KEY = "activity_logs";

export const getActivityLogs = (): ActivityLog[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const addActivityLog = (log: Omit<ActivityLog, "id" | "date" | "timestamp">) => {
    const logs = getActivityLogs();
    const newLog: ActivityLog = {
        ...log,
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date: new Date().toISOString(),
        timestamp: Date.now(),
    };

    // Keep only last 50 activities to avoid bloat
    const updatedLogs = [newLog, ...logs].slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));
    return newLog;
};
