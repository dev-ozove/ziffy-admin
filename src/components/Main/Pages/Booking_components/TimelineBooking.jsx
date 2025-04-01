// components/TimelineBooking.jsx
import { Card, Badge } from "react-bootstrap";
import { DirectionsCar } from "@mui/icons-material";
import { StatusBadge } from "./StatusBadge";

export const TimelineBooking = ({ booking, onClick }) => (
  <Card className="mb-2 shadow-sm" onClick={onClick}>
    <Card.Body className="p-3">
      <div className="d-flex justify-content-between align-items-center">
        <Badge bg="light" text="dark" className="me-2">
          {booking.Time}
        </Badge>
        <StatusBadge status={booking.status} />
      </div>
      <div className="mt-2">
        <div className="text-muted small">#{booking.OrderId}</div>
        {booking.driver?.name && (
          <div className="d-flex align-items-center mt-1">
            <span className="fw-bold me-2">Driver:</span>
            {booking.driver.name}
          </div>
        )}
        <div className="d-flex align-items-center mt-1">
          <DirectionsCar className="me-2" />
          {booking.bookedVehicle?.title}
        </div>
        <div className="text-truncate small text-muted mt-1">
          {booking.From} → {booking.To}
        </div>
      </div>
    </Card.Body>
  </Card>
);
