export enum StatusType {
    Active = "active",
    Archived = "archived",
    InProgress = "in-progress",
    Completed = "completed",
    InReview = "in-review",
}

interface StatusTagProps {
    status: StatusType;
}

const statusConfig: Record<StatusType, { bg: string; text: string; label: string }> = {
    [StatusType.Active]: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Active",
    },
    [StatusType.Archived]: {
        bg: "bg-gray-100",
        text: "text-gray-800",
        label: "Archived",
    },
    [StatusType.InProgress]: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "In Progress",
    },
    [StatusType.Completed]: {
        bg: "bg-purple-100",
        text: "text-purple-800",
        label: "Completed",
    },
    [StatusType.InReview]: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "In Review",
    },
};

export default function StatusTag({ status }: StatusTagProps) {
    const config = statusConfig[status];

    return (
        <span className={`inline-block ${config.bg} ${config.text} text-xs font-semibold px-2 py-1 rounded`}>
            {config.label}
        </span>
    );
}
