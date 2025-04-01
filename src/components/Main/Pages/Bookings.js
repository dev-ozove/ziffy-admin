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
  Spinner,
  Badge,
  Card,
  ListGroup,
} from "react-bootstrap";
import { QRCodeCanvas } from "qrcode.react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  FilterList,
  Search,
  DirectionsCar,
  Event,
  Cancel,
  Schedule,
} from "@mui/icons-material";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../Firebase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const theme = createTheme({
  palette: {
    primary: { main: "#2A3F54" },
    secondary: { main: "#FF6F61" },
    background: { default: "#F7F9FC" },
  },
  typography: {
    fontFamily: "Inter, sans-serif",
  },
});

const statusConfig = {
  pending: { color: "warning", text: "Pending", code: 0 },
  confirmed: { color: "success", text: "Confirmed", code: 1 },
  completed: { color: "primary", text: "Completed", code: 2 },
  cancelled: { color: "danger", text: "Cancelled", code: 3 },
};

const StatusBadge = ({ status }) => {
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

const Bookings = () => {
  const { _getAllBookingsDetails, _updateBookingStatus } = useOzove();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    dateFrom: "",
    dateTo: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [lastVisible, setLastVisible] = useState(null);
  const [previousLastVisibles, setPreviousLastVisibles] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [localStatus, setLocalStatus] = useState(null);
  const [timelineDate, setTimelineDate] = useState(new Date());
  const [showQR, setShowQR] = useState(false);

  // Fetch drivers
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "drivers"));
        const driversData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDrivers(driversData);
        setLoadingDrivers(false);
      } catch (error) {
        console.error("Error fetching drivers:", error);
        setLoadingDrivers(false);
      }
    };
    fetchDrivers();
  }, []);

  // Group bookings by date for timeline
  const getDailyBookings = () => {
    return filteredBookings
      .filter((b) => {
        const bookingDate = new Date(b.Date);
        const isValidStatus = ["confirmed", "completed"].includes(
          b.status?.bookingStatus
        );
        return (
          bookingDate.toDateString() === timelineDate.toDateString() &&
          isValidStatus
        );
      })
      .sort((a, b) => {
        const aTime = a.TimeStamp?.toDate().getTime() || 0;
        const bTime = b.TimeStamp?.toDate().getTime() || 0;
        return aTime - bTime;
      });
  };

  const TimelineBooking = ({ booking }) => (
    <Card className="mb-2 shadow-sm" onClick={() => handleCellClick(booking)}>
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

  const groupBookingsByDate = (bookings) => {
    return bookings.reduce((groups, booking) => {
      const date = new Date(booking.Date).toLocaleDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(booking);
      return groups;
    }, {});
  };

  const handleNextPage = async () => {
    if (!lastVisible) return;
    try {
      setLoading(true);
      const { bookings: data, lastVisible: newLastVisible } =
        await _getAllBookingsDetails(pageSize, lastVisible, {
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
          status:
            filters.status === "all"
              ? null
              : statusConfig[filters.status]?.code,
        });
      setPreviousLastVisibles((prev) => [...prev, lastVisible]);
      setBookings(data);
      setLastVisible(newLastVisible);
      setCurrentPage(currentPage + 1);
    } catch (err) {
      setError("Failed to fetch next page.");
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousPage = async () => {
    if (previousLastVisibles.length === 0) return;
    const prevLastVisible =
      previousLastVisibles[previousLastVisibles.length - 1];
    try {
      setLoading(true);
      const { bookings: data, lastVisible: newLastVisible } =
        await _getAllBookingsDetails(pageSize, prevLastVisible, {
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
          status:
            filters.status === "all"
              ? null
              : statusConfig[filters.status]?.code,
        });
      setPreviousLastVisibles((prev) => prev.slice(0, -1));
      setBookings(data);
      setLastVisible(newLastVisible);
      setCurrentPage(currentPage - 1);
    } catch (err) {
      setError("Failed to fetch previous page.");
    } finally {
      setLoading(false);
    }
  };

  const handleDetailChange = (field, value) => {
    if (!selectedBooking) return;
    setSelectedBooking((prev) => ({ ...prev, [field]: value }));
  };

  const handleStatusChange = (newStatus) => {
    setLocalStatus(newStatus);
  };

  const handleSaveChanges = async () => {
    if (!selectedBooking) return;

    const updatedFields = {
      status: {
        bookingStatus: localStatus,
        statusCode: statusConfig[localStatus]?.code || 0,
      },
      driver: selectedBooking.driver,
    };

    try {
      setIsSaving(true);
      await _updateBookingStatus({
        ...selectedBooking,
        ...updatedFields,
      });

      const updatedBooking = {
        ...selectedBooking,
        ...updatedFields,
      };

      setBookings((prev) =>
        prev.map((b) =>
          b.OrderId === updatedBooking.OrderId ? updatedBooking : b
        )
      );
      setFilteredBookings((prev) =>
        prev.map((b) =>
          b.OrderId === updatedBooking.OrderId ? updatedBooking : b
        )
      );
      setSelectedBooking(updatedBooking);
      setIsModalOpen(false);
    } catch (err) {
      setError("Failed to update booking. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { bookings: data, lastVisible: newLastVisible } =
        await _getAllBookingsDetails(pageSize, lastVisible, {
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
          status:
            filters.status === "all"
              ? null
              : statusConfig[filters.status]?.code,
        });
      setBookings(data);
      setLastVisible(newLastVisible);
    } catch (err) {
      setError("Failed to fetch bookings. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookings];
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.OrderId.toLowerCase().includes(searchTerm) ||
          b.From.toLowerCase().includes(searchTerm) ||
          b.To.toLowerCase().includes(searchTerm) ||
          b.bookedVehicle?.title.toLowerCase().includes(searchTerm) ||
          (b.driver?.name && b.driver.name.toLowerCase().includes(searchTerm))
      );
    }
    if (filters.status !== "all") {
      filtered = filtered.filter(
        (b) => b.status?.statusCode === statusConfig[filters.status]?.code
      );
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(
        (b) => new Date(b.Date) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(
        (b) => new Date(b.Date) <= new Date(filters.dateTo)
      );
    }
    setFilteredBookings(filtered);
  };

  useEffect(() => {
    fetchBookings();
  }, [filters, pageSize]);
  useEffect(() => {
    applyFilters();
  }, [filters, bookings]);

  const resetFilters = () => {
    setFilters({ search: "", status: "all", dateFrom: "", dateTo: "" });
  };

  const handleCellClick = (booking) => {
    setSelectedBooking(booking);
    setLocalStatus(booking.status?.bookingStatus || "pending");
    setIsModalOpen(true);
  };

  const groupedBookings = groupBookingsByDate(filteredBookings);

  return (
    <ThemeProvider theme={theme}>
      <Container fluid className="bg-light" style={{ minHeight: "100vh" }}>
        <Row>
          <Col md={4} className="pe-3">
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5>
                    <Schedule className="me-2" />
                    Daily Timeline
                  </h5>
                  <DatePicker
                    selected={timelineDate}
                    onChange={(date) => setTimelineDate(date)}
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
                  {getDailyBookings().length > 0 ? (
                    getDailyBookings().map((booking) => (
                      <TimelineBooking
                        key={booking.OrderId}
                        booking={booking}
                      />
                    ))
                  ) : (
                    <div className="text-center text-muted py-4">
                      No bookings for selected date
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={8}>
            <div className="bg-white rounded-3 shadow-sm p-4">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h2 className="mb-0">
                  <DirectionsCar className="me-2" />
                  Bookings Management
                </h2>
                <Button
                  variant="outline-primary"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FilterList className="me-2" />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
              </div>

              {showFilters && (
                <div className="mb-4 p-4 border rounded">
                  <Row>
                    <Col md={3} className="mb-3">
                      <Form.Group>
                        <Form.Label>
                          <Search className="me-2" />
                          Search
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Search bookings..."
                          value={filters.search}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              search: e.target.value,
                            }))
                          }
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3} className="mb-3">
                      <Form.Group>
                        <Form.Label>
                          <Event className="me-2" />
                          Status
                        </Form.Label>
                        <Form.Select
                          value={filters.status}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              status: e.target.value,
                            }))
                          }
                        >
                          <option value="all">All Statuses</option>
                          {Object.entries(statusConfig).map(([key, config]) => (
                            <option key={key} value={key}>
                              {config.text} ({config.code})
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3} className="d-flex gap-2 align-items-end">
                      <Button
                        variant="danger"
                        onClick={resetFilters}
                        className="w-100"
                      >
                        Reset Filters
                      </Button>
                    </Col>
                  </Row>
                </div>
              )}

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
                    {Object.entries(groupedBookings).map(
                      ([date, dateBookings]) => (
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
                              <td>
                                <StatusBadge status={booking.status} />
                              </td>
                              <td>{booking.Time}</td>
                              <td className="fw-bold">#{booking.OrderId}</td>
                              <td>
                                {typeof booking.contactDetails === "object" ? (
                                  <>
                                    {booking.contactDetails?.name || "N/A"}
                                    <div className="text-muted small">
                                      {booking.contactDetails?.phoneNumber}
                                    </div>
                                  </>
                                ) : (
                                  booking.contactDetails || "N/A"
                                )}
                              </td>
                              <td>
                                <div
                                  className="text-truncate"
                                  style={{ maxWidth: "200px" }}
                                >
                                  <strong>From:</strong> {booking.From}
                                </div>
                                <div
                                  className="text-truncate"
                                  style={{ maxWidth: "200px" }}
                                >
                                  <strong>To:</strong> {booking.To}
                                </div>
                              </td>
                              <td>
                                <div>
                                  {booking.bookedVehicle?.title || "N/A"}
                                </div>
                                <div className="text-muted small">
                                  {booking.driver?.name
                                    ? `Driver: ${booking.driver.name}`
                                    : "No driver assigned"}
                                </div>
                                <div className="text-muted small">
                                  Capacity:{" "}
                                  {booking.bookedVehicle?.capacity || "N/A"}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      )
                    )}
                  </tbody>
                </Table>
              </div>

              <div className="d-flex justify-content-center mt-4">
                <Button
                  variant="outline-primary"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1 || loading}
                >
                  Previous
                </Button>
                <span className="mx-3">Page {currentPage}</span>
                <Button
                  variant="outline-primary"
                  onClick={handleNextPage}
                  disabled={!lastVisible || loading}
                >
                  Next
                </Button>
              </div>

              <Modal
                show={isModalOpen}
                onHide={() => {
                  setIsModalOpen(false);
                  setShowQR(false);
                }}
                size="lg"
              >
                <Modal.Header closeButton className="bg-primary text-white">
                  <Modal.Title>Booking Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {selectedBooking && (
                    <Row>
                      <Col md={6} className="border-end">
                        <h5 className="mb-3">Journey Details</h5>
                        <DetailItem
                          label="Order ID"
                          value={selectedBooking.OrderId}
                        />
                        <DetailItem
                          label="Date"
                          value={new Date(
                            selectedBooking.Date
                          ).toLocaleDateString()}
                        />
                        <DetailItem label="Time" value={selectedBooking.Time} />
                        <DetailItem
                          label="Status"
                          value={
                            <Form.Select
                              value={
                                localStatus ||
                                selectedBooking.status?.bookingStatus ||
                                "pending"
                              }
                              onChange={(e) =>
                                handleStatusChange(e.target.value)
                              }
                              disabled={isSaving}
                            >
                              {Object.entries(statusConfig).map(
                                ([key, config]) => (
                                  <option key={key} value={key}>
                                    {config.text}
                                  </option>
                                )
                              )}
                            </Form.Select>
                          }
                        />
                        <h5 className="mt-4 mb-3">Vehicle Information</h5>
                        <DetailItem
                          label="Vehicle"
                          value={selectedBooking.bookedVehicle?.title || "N/A"}
                        />
                        <DetailItem
                          label="Driver"
                          value={
                            loadingDrivers ? (
                              <Spinner size="sm" />
                            ) : (
                              <Form.Select
                                value={selectedBooking.driver?.id || ""}
                                onChange={(e) => {
                                  const selectedDriver = drivers.find(
                                    (d) => d.id === e.target.value
                                  );
                                  handleDetailChange(
                                    "driver",
                                    selectedDriver
                                      ? {
                                          id: selectedDriver.id,
                                          name: selectedDriver.name,
                                          vehicleType:
                                            selectedDriver.vehicleType,
                                        }
                                      : null
                                  );
                                }}
                                disabled={isSaving}
                              >
                                <option value="">Unassigned</option>
                                {drivers.map((driver) => (
                                  <option key={driver.id} value={driver.id}>
                                    {driver.name} ({driver.vehicleType})
                                  </option>
                                ))}
                              </Form.Select>
                            )
                          }
                        />
                        <DetailItem
                          label="Capacity"
                          value={`${
                            selectedBooking.bookedVehicle?.capacity || "N/A"
                          } passengers`}
                        />
                        <DetailItem
                          label="Price"
                          value={`$${
                            selectedBooking.TotalPrice?.toFixed(2) || "N/A"
                          }`}
                        />
                      </Col>
                      <Col md={6}>
                        <h5 className="mb-3">Route Information</h5>
                        <DetailItem label="From" value={selectedBooking.From} />
                        {selectedBooking.PickupCoordinates && (
                          <DetailItem
                            label="Coordinates (From)"
                            value={`${selectedBooking.PickupCoordinates.lat}, ${selectedBooking.PickupCoordinates.long}`}
                          />
                        )}
                        <DetailItem label="To" value={selectedBooking.To} />
                        {selectedBooking.DropoffCoordinates && (
                          <DetailItem
                            label="Coordinates (To)"
                            value={`${selectedBooking.DropoffCoordinates.lat}, ${selectedBooking.DropoffCoordinates.long}`}
                          />
                        )}
                        {showQR && selectedBooking && (
                          <div className="mt-4 text-center">
                            {console.log("selectedBooking", selectedBooking)}
                            <div
                              style={{
                                maxWidth: "400px",
                                margin: "0 auto",
                                padding: "20px",
                                backgroundColor: "white",
                                borderRadius: "8px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                              }}
                            >
                              <QRCodeCanvas
                                value={JSON.stringify({
                                  booking_uid: selectedBooking?.booking_uid,
                                  user_uid: selectedBooking?.user_uid,
                                })}
                                size={400}
                                style={{
                                  width: "100%",
                                  height: "auto",
                                  maxWidth: "400px",
                                }}
                                includeMargin={true}
                                level="H" // High error correction
                              />
                              <div className="text-muted small mt-2">
                                Scan QR for journey details
                              </div>
                            </div>
                          </div>
                        )}
                      </Col>
                    </Row>
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <Button
                    variant="outline-primary"
                    onClick={() => setShowQR(!showQR)}
                    className="me-auto"
                  >
                    {showQR ? "Hide QR Code" : "Show QR Code"}
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Spinner
                          as="span"
                          size="sm"
                          animation="border"
                          role="status"
                        />
                        <span className="ms-2">Saving...</span>
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSaving}
                  >
                    Close
                  </Button>
                </Modal.Footer>
              </Modal>
            </div>
          </Col>
        </Row>
      </Container>
    </ThemeProvider>
  );
};

const DetailItem = ({ label, value }) => (
  <div className="mb-2">
    <strong>{label}:</strong>
    <div className="ms-2 d-inline">{value}</div>
  </div>
);

export default Bookings;
