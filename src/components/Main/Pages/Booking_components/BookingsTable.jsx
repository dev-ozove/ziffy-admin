// components/BookingsTable.jsx
import { Table } from "react-bootstrap";
import { StatusBadge } from "./StatusBadge";

export const BookingsTable = ({ groupedBookings, handleCellClick }) => (
  <div className="table-responsive rounded-3 shadow-sm">
    <Table hover className="mb-0">
      <thead className="bg-primary text-white">
        <tr>
          <th>Status</th>
          <th>Time</th>
          <th>Order ID</th>
          <th>Customer</th>
          <th>Route</th>
          <th>Vehicle & Driver</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(groupedBookings).map(([date, dateBookings]) => (
          <React.Fragment key={date}>
            <tr className="bg-light">
              <td colSpan="6" className="fw-bold border-bottom">
                {date}
              </td>
            </tr>
            {dateBookings.map((booking) => (
              <tr
                key={booking.OrderId}
                onClick={() => handleCellClick(booking)}
                className="cursor-pointer"
              >
                {/* Table row content */}
              </tr>
            ))}
          </React.Fragment>
        ))}
      </tbody>
    </Table>
  </div>
);
