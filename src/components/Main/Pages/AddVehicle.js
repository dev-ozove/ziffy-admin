import React, { useState, useEffect } from "react";
import {
  Container,
  Form,
  Button,
  ProgressBar,
  Table,
  Card,
  Row,
  Col,
  Image,
} from "react-bootstrap";
import { storage, db } from "../../../Firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export default function VehicleManager() {
  const [vehicles, setVehicles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    capacity: "",
    price: "",
    image: null,
    details: {
      Full_name: "",
      per_person_price: "",
      minimum_capacity: "",
      maximum_capacity: "",
    },
  });

  // Fetch vehicles in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "vehicles"), (snapshot) => {
      const vehiclesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVehicles(vehiclesData);
    });
    return () => unsubscribe();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: file });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("details.")) {
      const detailField = name.split(".")[1];
      setFormData({
        ...formData,
        details: { ...formData.details, [detailField]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        // Update existing vehicle
        const vehicleRef = doc(db, "vehicles", editingId);
        let updatedData = { ...formData };

        if (formData.image instanceof File) {
          const storageRef = ref(storage, `vehicles/${formData.image.name}`);
          const uploadTask = uploadBytesResumable(storageRef, formData.image);

          await uploadTask;
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          updatedData.image = downloadURL;
          updatedData.details.image = downloadURL;
        }

        await updateDoc(vehicleRef, updatedData);
        setEditingId(null);
      } else {
        // Create new vehicle
        const storageRef = ref(storage, `vehicles/${formData.image.name}`);
        const uploadTask = uploadBytesResumable(storageRef, formData.image);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error("Upload failed:", error);
            setLoading(false);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const vehicleData = {
              ...formData,
              image: downloadURL,
              details: {
                ...formData.details,
                image: downloadURL,
              },
            };
            await addDoc(collection(db, "vehicles"), vehicleData);
          }
        );
      }

      setFormData({
        title: "",
        capacity: "",
        price: "",
        image: null,
        details: {
          Full_name: "",
          per_person_price: "",
          minimum_capacity: "",
          maximum_capacity: "",
        },
      });
      setUploadProgress(0);
    } catch (error) {
      console.error("Error processing vehicle:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vehicle) => {
    setFormData({
      title: vehicle.title,
      capacity: vehicle.capacity,
      price: vehicle.price,
      image: vehicle.image,
      details: { ...vehicle.details },
    });
    setEditingId(vehicle.id);
  };

  const handleDelete = async (vehicleId) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      setDeleteLoading(true);
      try {
        await deleteDoc(doc(db, "vehicles", vehicleId));
      } catch (error) {
        console.error("Error deleting vehicle:", error);
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      title: "",
      capacity: "",
      price: "",
      image: null,
      details: {
        Full_name: "",
        per_person_price: "",
        minimum_capacity: "",
        maximum_capacity: "",
      },
    });
  };

  return (
    <Container fluid className="p-4">
      <Row className="g-4">
        <Col xl={6}>
          <Card className="shadow-lg border-0">
            <Card.Header className="bg-primary text-white">
              <h3 className="mb-0">
                {editingId ? "Edit Vehicle" : "Add New Vehicle"}
              </h3>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Capacity</Form.Label>
                        <Form.Control
                          type="number"
                          name="capacity"
                          value={formData.capacity}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Price</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          required
                        />
                        <Form.Text className="text-muted">
                          Price per hour
                        </Form.Text>
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="details.Full_name"
                          value={formData.details.Full_name}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Price Per Person</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          name="details.per_person_price"
                          value={formData.details.per_person_price}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Minimum Capacity</Form.Label>
                        <Form.Control
                          type="number"
                          name="details.minimum_capacity"
                          value={formData.details.minimum_capacity}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Maximum Capacity</Form.Label>
                        <Form.Control
                          type="number"
                          name="details.maximum_capacity"
                          value={formData.details.maximum_capacity}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>Vehicle Image</Form.Label>
                        <Form.Control
                          type="file"
                          onChange={handleFileChange}
                          accept="image/*"
                          required={!editingId}
                          className="border-primary"
                        />
                        {formData.image &&
                          !(formData.image instanceof File) && (
                            <div className="mt-2">
                              <Image
                                src={formData.image}
                                thumbnail
                                style={{ maxWidth: "200px" }}
                              />
                            </div>
                          )}
                        {uploadProgress > 0 && (
                          <ProgressBar
                            now={uploadProgress}
                            label={`${Math.round(uploadProgress)}%`}
                            striped
                            animated
                            className="mt-2"
                          />
                        )}
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                <div className="d-grid mt-4 gap-2">
                  <Button
                    variant={editingId ? "warning" : "primary"}
                    type="submit"
                    size="lg"
                    disabled={loading}
                  >
                    {loading
                      ? editingId
                        ? "Updating..."
                        : "Uploading..."
                      : editingId
                      ? "Update Vehicle"
                      : "Add Vehicle"}
                  </Button>

                  {editingId && (
                    <Button variant="secondary" size="lg" onClick={cancelEdit}>
                      Cancel Edit
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={6}>
          <Card className="shadow-lg border-0 h-100">
            <Card.Header className="bg-primary text-white">
              <h3 className="mb-0">Registered Vehicles</h3>
            </Card.Header>
            <Card.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
              <Table hover responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Image</th>
                    <th>Vehicle</th>
                    <th>Capacity</th>
                    <th>Price</th>
                    <th>Min/Max</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle.id}>
                      <td>
                        <Image
                          src={vehicle.image}
                          alt={vehicle.title}
                          thumbnail
                          style={{ width: "60px", height: "40px" }}
                        />
                      </td>
                      <td>
                        <div className="fw-bold">{vehicle.title}</div>
                        <small className="text-muted">
                          {vehicle.details.Full_name}
                        </small>
                      </td>
                      <td>{vehicle.capacity}</td>
                      <td>${vehicle.price}/h</td>
                      <td>
                        {vehicle.details.minimum_capacity}-
                        {vehicle.details.maximum_capacity}
                      </td>
                      <td>
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => handleEdit(vehicle)}
                          className="me-2"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(vehicle.id)}
                          disabled={deleteLoading}
                        >
                          {deleteLoading ? "Deleting..." : "Delete"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
