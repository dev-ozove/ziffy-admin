// components/BookingDetailsModal.jsx
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { QRCodeCanvas } from "qrcode.react";
import { StatusBadge } from "./StatusBadge";
import { DetailItem } from "./DetailItem";

export const BookingDetailsModal = ({
  show,
  onHide,
  booking,
  status,
  drivers,
  loadingDrivers,
  onStatusChange,
  onDriverChange,
  onSave,
  isSaving,
}) => (
  <Modal show={show} onHide={onHide} size="lg">
    <Modal.Header closeButton className="bg-primary text-white">
      <Modal.Title>Booking Details</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {booking && (
        <Row>
          <Modal
            show={isModalOpen}
            onHide={() => setIsModalOpen(false)}
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
                          onChange={(e) => handleStatusChange(e.target.value)}
                          disabled={isSaving}
                        >
                          {Object.entries(statusConfig).map(([key, config]) => (
                            <option key={key} value={key}>
                              {config.text}
                            </option>
                          ))}
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
                                      vehicleType: selectedDriver.vehicleType, // Add this if needed
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
                    <div className="mt-4 text-center">
                      <QRCodeCanvas
                        value={JSON.stringify(selectedBooking)}
                        size={128}
                      />
                      <div className="text-muted small mt-2">
                        Scan QR for journey details
                      </div>
                    </div>
                  </Col>
                </Row>
              )}
            </Modal.Body>
            <Modal.Footer>
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
        </Row>
      )}
    </Modal.Body>
    <Modal.Footer>
      <Button variant="primary" onClick={onSave} disabled={isSaving}>
        {isSaving ? <LoadingSpinner /> : "Save Changes"}
      </Button>
      <Button variant="secondary" onClick={onHide} disabled={isSaving}>
        Close
      </Button>
    </Modal.Footer>
  </Modal>
);
