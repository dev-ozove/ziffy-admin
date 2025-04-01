// components/DailyTimeline.jsx
import { Card } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { Schedule } from "@mui/icons-material";
import { TimelineBooking } from "./TimelineBooking";

export const DailyTimeline = ({
  timelineDate,
  setTimelineDate,
  dailyBookings,
  onBookingClick,
}) => (
  <Card className="shadow-sm mb-4">
    <Card.Body>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>
          <Schedule className="me-2" />
          Daily Timeline
        </h5>
        <DatePicker
          selected={timelineDate}
          onChange={setTimelineDate}
          className="form-control"
        />
      </div>
      <div
        style={{
          height: "calc(100vh - 200px)",
          overflowY: "auto",
          paddingRight: "10px",
        }}
      >
        {dailyBookings.map((booking) => (
          <TimelineBooking
            key={booking.OrderId}
            booking={booking}
            onClick={() => onBookingClick(booking)}
          />
        ))}
      </div>
    </Card.Body>
  </Card>
);
