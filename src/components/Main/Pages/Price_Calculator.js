import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Container,
  Card,
  Alert,
  Row,
  Col,
} from "react-bootstrap";
import { db } from "../../../Firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const PriceCalculator = () => {
  const [formData, setFormData] = useState({
    van: {
      minimumFare: "",
      perKmFare: "",
      addonCost: "",
      hourlyRate: "",
    },
    miniBus: {
      minimumFare: "",
      perKmFare: "",
      addonCost: "",
      hourlyRate: "",
    },
    bus: {
      minimumFare: "",
      perKmFare: "",
      addonCost: "",
      hourlyRate: "",
    },
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCurrentData();
  }, []);

  const fetchCurrentData = async () => {
    try {
      const docRef = doc(db, "PRICE_CALCULATOR", "VehicleRates");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
          van: data.van,
          miniBus: data.miniBus,
          bus: data.bus,
        });
      }
    } catch (err) {
      setError("Failed to fetch current price data");
      console.error("Error fetching data:", err);
    }
  };

  const handleInputChange = (vehicleType, field) => (e) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFormData((prev) => ({
        ...prev,
        [vehicleType]: {
          ...prev[vehicleType],
          [field]: value,
        },
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validate all fields
    const isValid = Object.entries(formData).every(([vehicle, data]) =>
      Object.values(data).every(
        (value) => !isNaN(parseFloat(value)) && parseFloat(value) >= 0
      )
    );

    if (!isValid) {
      setError("Please enter valid positive numbers for all fields");
      setLoading(false);
      return;
    }

    try {
      const docRef = doc(db, "PRICE_CALCULATOR", "VehicleRates");
      await setDoc(docRef, formData, { merge: true });
      setSuccess(true);
      await fetchCurrentData();
    } catch (err) {
      setError("Failed to update price calculator data");
      console.error("Error updating data:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderVehicleForm = (vehicleType, title) => (
    <Card className="mb-4 shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h5>{title} Rates</h5>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Minimum Fare (5km) ($)</Form.Label>
              <Form.Control
                type="text"
                value={formData[vehicleType].minimumFare}
                onChange={handleInputChange(vehicleType, "minimumFare")}
                placeholder="Minimum fare"
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Per KM Fare ($)</Form.Label>
              <Form.Control
                type="text"
                value={formData[vehicleType].perKmFare}
                onChange={handleInputChange(vehicleType, "perKmFare")}
                placeholder="Per KM fare"
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Addon Cost ($)</Form.Label>
              <Form.Control
                type="text"
                value={formData[vehicleType].addonCost}
                onChange={handleInputChange(vehicleType, "addonCost")}
                placeholder="Addon cost"
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Hourly Rate ($)</Form.Label>
              <Form.Control
                type="text"
                value={formData[vehicleType].hourlyRate}
                onChange={handleInputChange(vehicleType, "hourlyRate")}
                placeholder="Hourly rate"
              />
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );

  return (
    <Container className="py-2">
      {/* Preview Section */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-info text-white">
          <h5>Current Pricing Overview</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <h6>Van</h6>
              <p>Minimum Fare: ${formData.van.minimumFare}</p>
              <p>Per KM: ${formData.van.perKmFare}</p>
              <p>Addon: ${formData.van.addonCost}</p>
              <p>Hourly: ${formData.van.hourlyRate}</p>
            </Col>
            <Col md={4}>
              <h6>Mini Bus</h6>
              <p>Minimum Fare: ${formData.miniBus.minimumFare}</p>
              <p>Per KM: ${formData.miniBus.perKmFare}</p>
              <p>Addon: ${formData.miniBus.addonCost}</p>
              <p>Hourly: ${formData.miniBus.hourlyRate}</p>
            </Col>
            <Col md={4}>
              <h6>Bus</h6>
              <p>Minimum Fare: ${formData.bus.minimumFare}</p>
              <p>Per KM: ${formData.bus.perKmFare}</p>
              <p>Addon: ${formData.bus.addonCost}</p>
              <p>Hourly: ${formData.bus.hourlyRate}</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-success text-white">
          <h4 className="mb-0">Vehicle Pricing Configuration</h4>
        </Card.Header>
        <Card.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert
              variant="success"
              dismissible
              onClose={() => setSuccess(false)}
            >
              Pricing data updated successfully!
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            {renderVehicleForm("van", "Van")}
            {renderVehicleForm("miniBus", "Mini Bus")}
            {renderVehicleForm("bus", "Bus")}

            <div className="d-grid gap-2">
              <Button variant="success" type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save All Pricing Configurations"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PriceCalculator;
