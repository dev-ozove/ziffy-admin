import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Grid,
  Typography,
  Paper,
  InputAdornment,
  Avatar,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Person,
  Phone,
  CardMembership,
  CheckCircle,
  DirectionsCar,
} from "@mui/icons-material";
import { useOzove } from "../../../Context/OzoveContext";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../../Firebase";

const AddDriver = () => {
  const [formData, setFormData] = useState({
    name: "",
    licenseNumber: "",
    contact: "",
    experience: "",
    vehicleType: "",
  });

  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const { _addDriver, loading } = useOzove();
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch vehicles for dropdown
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "vehicles"),
      (snapshot) => {
        const vehiclesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVehicles(vehiclesData);
        setLoadingVehicles(false);
      },
      (error) => {
        console.error("Error fetching vehicles:", error);
        setLoadingVehicles(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const driverId = await _addDriver(formData);
      setSubmitStatus({
        type: "success",
        message: `Driver ${driverId} registered successfully!`,
      });
      setFormData({
        name: "",
        licenseNumber: "",
        contact: "",
        experience: "",
        vehicleType: "",
      });
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: error.message.replace("Failed to add driver: ", ""),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const SectionHeader = ({ icon, title }) => (
    <Grid item xs={12} sx={{ mt: 3, mb: 2 }}>
      <Typography variant="h6" sx={{ display: "flex", alignItems: "center" }}>
        <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>{icon}</Avatar>
        {title}
      </Typography>
    </Grid>
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h4" align="center" gutterBottom>
                <DirectionsCar sx={{ verticalAlign: "middle", mr: 2 }} />
                Driver Registration
              </Typography>
              {submitStatus && (
                <Alert severity={submitStatus.type} sx={{ mb: 3, mt: 2 }}>
                  {submitStatus.message}
                </Alert>
              )}
            </Grid>

            <SectionHeader icon={<Person />} title="Personal Information" />

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Number"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <SectionHeader
              icon={<CardMembership />}
              title="Professional Details"
            />

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="License Number"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Years of Experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Vehicle Type Specialization</InputLabel>
                <Select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  label="Vehicle Type Specialization"
                  disabled={loadingVehicles}
                >
                  {loadingVehicles ? (
                    <MenuItem disabled>
                      <CircularProgress size={24} />
                    </MenuItem>
                  ) : (
                    vehicles.map((vehicle) => (
                      <MenuItem key={vehicle.id} value={vehicle.title}>
                        {vehicle.title}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sx={{ mt: 4 }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                disabled={isSubmitting || loading}
                endIcon={
                  isSubmitting ? (
                    <CircularProgress size={24} sx={{ color: "white" }} />
                  ) : (
                    <CheckCircle />
                  )
                }
                sx={{ mt: 3 }}
              >
                {isSubmitting ? "Registering Driver..." : "Register Driver"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default AddDriver;
