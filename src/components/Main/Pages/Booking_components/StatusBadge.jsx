// components/StatusBadge.jsx
import { Badge } from "react-bootstrap";

const statusConfig = {
  pending: { color: "warning", text: "Pending", code: 0 },
  confirmed: { color: "success", text: "Confirmed", code: 1 },
  completed: { color: "primary", text: "Completed", code: 2 },
  cancelled: { color: "danger", text: "Cancelled", code: 3 },
};

export const StatusBadge = ({ status }) => {
  const currentStatus = status?.bookingStatus || "pending";
  return (
    <Badge
      bg={statusConfig[currentStatus]?.color || "secondary"}
      className="text-capitalize"
    >
      {statusConfig[currentStatus]?.text || currentStatus}
    </Badge>
  );
};
