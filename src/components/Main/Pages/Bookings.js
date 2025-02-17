import React, { useEffect, useState } from "react";
import { useOzove } from "../../../Context/OzoveContext";
import {
  Table,
  Modal,
  Button,
  Form,
  Row,
  Col,
  Container,
} from "react-bootstrap";
import { QRCodeCanvas } from "qrcode.react";

const Bookings = () => {
  const { _getAllBookingsDetails } = useOzove();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    vehicle: "all",
    dateFrom: "",
    dateTo: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await _getAllBookingsDetails();
        setBookings(data);
        setFilteredBookings(data);
      } catch (err) {
        setError("Failed to fetch bookings.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [_getAllBookingsDetails]);

  useEffect(() => {
    applyFilters();
  }, [filters, bookings]);

  const applyFilters = () => {
    let filtered = [...bookings];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.OrderId.toLowerCase().includes(searchTerm) ||
          booking.From.toLowerCase().includes(searchTerm) ||
          booking.To.toLowerCase().includes(searchTerm) ||
          (typeof booking.contactDetails === "object" &&
            (booking.contactDetails.name.toLowerCase().includes(searchTerm) ||
              booking.contactDetails.phoneNumber.includes(searchTerm)))
      );
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(
        (booking) => booking.Status === filters.status
      );
    }

    // Vehicle filter
    if (filters.vehicle !== "all") {
      filtered = filtered.filter((booking) =>
        filters.vehicle === "sedan"
          ? booking.selectedVehicle === 0
          : booking.selectedVehicle.toString() === filters.vehicle
      );
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(
        (booking) => new Date(booking.Date) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(
        (booking) => new Date(booking.Date) <= new Date(filters.dateTo)
      );
    }

    setFilteredBookings(filtered);
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      status: "all",
      vehicle: "all",
      dateFrom: "",
      dateTo: "",
    });
  };

  const handleCellClick = (booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  if (loading) return <div className="p-4">Loading bookings...</div>;
  if (error) return <div className="p-4 text-danger">{error}</div>;

  return (
    <Container fluid className="p-4">
      <h2 className="mb-4">Bookings List</h2>

      {/* Search and Filter Toggle */}
      <div className="d-flex gap-2 mb-4">
        <Form.Control
          type="text"
          placeholder="Search bookings..."
          value={filters.search}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, search: e.target.value }))
          }
          className="flex-grow-1"
        />
        <Button variant="primary" onClick={() => setShowFilters(!showFilters)}>
          Filters
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mb-4 p-3 border rounded bg-light">
          <Row>
            <Col md={3} className="mb-3">
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, status: e.target.value }))
                  }
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={3} className="mb-3">
              <Form.Group>
                <Form.Label>Vehicle Type</Form.Label>
                <Form.Select
                  value={filters.vehicle}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, vehicle: e.target.value }))
                  }
                >
                  <option value="all">All Vehicles</option>
                  <option value="sedan">Sedan</option>
                  <option value="1">Vehicle 1</option>
                  <option value="2">Vehicle 2</option>
                  <option value="3">Vehicle 3</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={3} className="mb-3">
              <Form.Group>
                <Form.Label>Date From</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      dateFrom: e.target.value,
                    }))
                  }
                />
              </Form.Group>
            </Col>

            <Col md={3} className="mb-3">
              <Form.Group>
                <Form.Label>Date To</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, dateTo: e.target.value }))
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          <Button variant="secondary" onClick={resetFilters} className="w-100">
            Reset Filters
          </Button>
        </div>
      )}

      {/* Bookings Table */}
      <div className="table-responsive">
        <Table striped bordered hover className="shadow-sm">
          <thead className="bg-success text-white">
            <tr>
              <th>Order ID</th>
              <th>Contact</th>
              <th>From</th>
              <th>To</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Vehicle</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr
                key={booking.OrderId}
                onClick={() => handleCellClick(booking)}
                style={{ cursor: "pointer" }}
              >
                <td>{booking.OrderId}</td>
                <td>
                  {booking.contactDetails &&
                  typeof booking.contactDetails === "object"
                    ? `${booking.contactDetails.name} - ${booking.contactDetails.phoneNumber}`
                    : booking.contactDetails}
                </td>
                <td className="text-truncate" style={{ maxWidth: "200px" }}>
                  {booking.From}
                </td>
                <td className="text-truncate" style={{ maxWidth: "200px" }}>
                  {booking.To}
                </td>
                <td>{booking.Date}</td>
                <td>{booking.Time}</td>
                <td>{booking.Status}</td>
                <td>
                  {booking.selectedVehicle === 0
                    ? "Sedan"
                    : `Vehicle ${booking.selectedVehicle}`}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Modal with Two Columns */}
      <Modal show={isModalOpen} onHide={closeModal} size="lg" centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>Booking Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBooking && (
            <Row>
              {/* Left Column - Booking Information */}
              <Col md={6} className="border-end">
                <h5 className="mb-4">Booking Information</h5>
                <p>
                  <strong>Order ID:</strong> {selectedBooking.OrderId}
                </p>
                <p>
                  <strong>Date:</strong> {selectedBooking.Date}
                </p>
                <p>
                  <strong>Time:</strong> {selectedBooking.Time}
                </p>
                <p>
                  <strong>Status:</strong> {selectedBooking.Status}
                </p>
                <p>
                  <strong>Vehicle:</strong>{" "}
                  {selectedBooking.selectedVehicle === 0
                    ? "Sedan"
                    : `Vehicle ${selectedBooking.selectedVehicle}`}
                </p>
                <p>
                  <strong>Contact:</strong>{" "}
                  {typeof selectedBooking.contactDetails === "object"
                    ? `${selectedBooking.contactDetails.name} (${selectedBooking.contactDetails.phoneNumber})`
                    : selectedBooking.contactDetails}
                </p>
              </Col>

              {/* Right Column - Location Details */}
              <Col md={6}>
                <h5 className="mb-4">Location Details</h5>
                <p>
                  <strong>From:</strong> {selectedBooking.From}
                </p>
                {selectedBooking.FromCoordinates && (
                  <p>
                    <strong>From Coordinates:</strong>
                    <br />
                    Latitude: {selectedBooking.FromCoordinates.lat}
                    <br />
                    Longitude: {selectedBooking.FromCoordinates.long}
                  </p>
                )}
                <p>
                  <strong>To:</strong> {selectedBooking.To}
                </p>
                {selectedBooking.ToCoordinates && (
                  <p>
                    <strong>To Coordinates:</strong>
                    <br />
                    Latitude: {selectedBooking.ToCoordinates.lat}
                    <br />
                    Longitude: {selectedBooking.ToCoordinates.long}
                  </p>
                )}
                <div className="text-center mt-4">
                  <QRCodeCanvas
                    value={JSON.stringify(selectedBooking)}
                    size={150}
                    className="img-fluid"
                  />
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Bookings;
