import React, { useEffect, useState } from "react";
import {
  Tabs,
  Tab,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Menu,
  MenuItem,
  Typography,
  Box,
} from "@mui/material";
import {
  doc,
  collection,
  deleteDoc,
  getDoc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../../../Firebase"; // adjust your firebase import

// A11y helper functions for Tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `tab-${index}`,
    "aria-controls": `tabpanel-${index}`,
  };
}

export default function RegistrationTabs() {
  const [tabIndex, setTabIndex] = useState(0);

  // *** Admin Registration States ***
  const [adminEmail, setAdminEmail] = useState("");
  const [adminUserType, setAdminUserType] = useState("");
  const [anchorElAdmin, setAnchorElAdmin] = useState(null);

  // *** Driver Registration States ***
  const [driverName, setDriverName] = useState("");
  const [driverEmail, setDriverEmail] = useState("");

  // *** Zenmode User Registration States ***
  const [zenName, setZenName] = useState("");
  const [zenEmail, setZenEmail] = useState("");
  // For device details, expect a JSON string (or change to separate fields if desired)
  const [zenDeviceDetails, setZenDeviceDetails] = useState("");

  // *** Admin List & Dialog States ***
  const [userData, setUserData] = useState([]);
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const DropDown_open = Boolean(anchorEl);
  const [email, set_email] = useState("");
  const [userType, set_userType] = useState("");
  const [userAdminType, set_userAdminType] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch the current admin's type to allow only Master Admin to manage admins
  async function Set_adminType() {
    try {
      const docRef = doc(db, "Admins", auth.currentUser.email);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        set_userAdminType(docSnap.data().UserType);
      }
    } catch (error) {
      console.error("Error fetching admin type:", error);
    }
  }

  useEffect(() => {
    Set_adminType();
  }, []);

  // Dropdown handlers for selecting user type in the Admin Dialog
  const DropDown_handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const DropDown_handleClose = () => {
    setAnchorEl(null);
  };
  const DropDown_handleSelect = (value) => {
    set_userType(value);
    DropDown_handleClose();
  };

  // Listen for changes in the Admins collection for the table
  useEffect(() => {
    const adminsCollection = collection(db, "Admins");
    const unsubscribe = onSnapshot(adminsCollection, (snapshot) => {
      const usersData = snapshot.docs.map((doc) => doc.data());
      setUserData(usersData);
    });
    return () => unsubscribe();
  }, []);

  // Dialog open/close handlers
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  // Handle admin registration form submission (separate from Zenmode registration)
  const handle_form_submision = async () => {
    if (!email || !userType) {
      alert("Please fill in all fields");
      return;
    }
    try {
      const docRef = doc(db, "Admins", email);
      await setDoc(docRef, {
        email: email,
        UserType: userType,
        verified: false,
      });
      set_email("");
      set_userType("");
      handleClose();
      alert("Admin added to the server");
    } catch (error) {
      console.error("Error adding admin:", error);
      alert("Error in adding the admin");
    }
  };

  // Delete an admin user
  const HandleDelete = async (email) => {
    setLoading(true);
    try {
      const docRef = doc(db, "Admins", email);
      await deleteDoc(docRef);
      setLoading(false);
      alert("Admin deleted");
    } catch (error) {
      console.error("Error deleting admin:", error);
      setLoading(false);
      alert("Error in deleting the admin");
    }
  };

  // Only Master Admins can view the Admin tab content
  if (userAdminType !== "Master Admin") {
    return (
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <Typography variant="h6">You are not a Master Admin</Typography>
      </Box>
    );
  }

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  // *** Admin Tab: Dropdown Handlers ***
  const handleAdminDropdownClick = (event) => {
    setAnchorElAdmin(event.currentTarget);
  };
  const handleAdminDropdownClose = () => {
    setAnchorElAdmin(null);
  };
  const handleAdminSelect = (value) => {
    setAdminUserType(value);
    handleAdminDropdownClose();
  };

  // *** Registration Handlers ***

  // Register an Admin user in the 'Admins' collection using the email as the doc ID.
  const handleAdminRegistration = async () => {
    if (!adminEmail || !adminUserType) {
      alert("Please fill in all fields for Admin registration.");
      return;
    }
    try {
      const docRef = doc(db, "Admins", adminEmail);
      await setDoc(docRef, {
        email: adminEmail,
        UserType: adminUserType,
        verified: false,
      });
      alert("Admin registered successfully.");
      setAdminEmail("");
      setAdminUserType("");
    } catch (error) {
      console.error(error);
      alert("Error registering admin.");
    }
  };

  // Register a Driver in the 'Drivers' collection using the email as the doc ID.
  const handleDriverRegistration = async () => {
    if (!driverName || !driverEmail) {
      alert("Please fill in all fields for Driver registration.");
      return;
    }
    try {
      const docRef = doc(db, "Drivers", driverEmail);
      await setDoc(docRef, {
        email: driverEmail,
        name: driverName,
        // Add any additional driver details here
      });
      alert("Driver registered successfully.");
      setDriverName("");
      setDriverEmail("");
    } catch (error) {
      console.error(error);
      alert("Error registering driver.");
    }
  };

  // Register a Zenmode user by calling the backend API endpoint.
  const handleZenmodeRegistration = async () => {
    if (!zenName || !zenEmail || !zenDeviceDetails) {
      alert("Please fill in all fields for Zenmode User registration.");
      return;
    }
    let deviceDetailsObj;
    try {
      // Attempt to parse the JSON input for device details
      deviceDetailsObj = JSON.parse(zenDeviceDetails);
    } catch (parseError) {
      alert("Device Details must be valid JSON.");
      return;
    }
    const payload = {
      name: zenName,
      email: zenEmail,
      deviceDetails: deviceDetailsObj,
    };

    try {
      const response = await fetch(
        "http://localhost:3000/admin/registerZenmodeUser",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to register Zenmode user.");
      }
      alert("Zenmode user registered successfully.");
      setZenName("");
      setZenEmail("");
      setZenDeviceDetails("");
    } catch (error) {
      console.error("Error registering Zenmode user:", error);
      alert("Error registering Zenmode user.");
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Tabs Header */}
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        aria-label="registration tabs"
      >
        <Tab label="Admin" {...a11yProps(0)} />
        <Tab label="Driver" {...a11yProps(1)} />
        <Tab label="Zenmode User" {...a11yProps(2)} />
      </Tabs>

      {/* Admin Registration Tab Panel */}
      <TabPanel value={tabIndex} index={0}>
        <Box sx={{ maxWidth: "900px", mx: "auto", p: 2 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Admin Users
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 3, boxShadow: 3 }}>
            <Table>
              <TableHead sx={{ backgroundColor: "#1976d2" }}>
                <TableRow>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Email
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    User Type
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Email Verified
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userData.map((user, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.UserType}</TableCell>
                    <TableCell>{user.verified.toString()}</TableCell>
                    <TableCell>
                      {auth.currentUser.email !== user.email && (
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => HandleDelete(user.email)}
                        >
                          {loading ? "Please wait..." : "Delete"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Button to open the dialog for adding a new admin */}
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button variant="contained" onClick={handleClickOpen}>
              Add Admin
            </Button>
          </Box>

          {/* Dialog for adding a new admin */}
          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Add New Admin</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Please enter the admin's email and select a user type.
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="email"
                label="Email Address"
                type="email"
                fullWidth
                variant="standard"
                value={email}
                onChange={(e) => set_email(e.target.value)}
              />
              <TextField
                margin="dense"
                id="userType"
                label="User Type"
                value={userType}
                onClick={DropDown_handleClick}
                fullWidth
                variant="standard"
                InputProps={{
                  readOnly: true,
                }}
              />
              <Menu
                anchorEl={anchorEl}
                open={DropDown_open}
                onClose={DropDown_handleClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
              >
                <MenuItem onClick={() => DropDown_handleSelect("Admin")}>
                  Admin
                </MenuItem>
                <MenuItem onClick={() => DropDown_handleSelect("Master Admin")}>
                  Master Admin
                </MenuItem>
              </Menu>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button onClick={handle_form_submision}>Add</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </TabPanel>

      {/* Driver Registration Tab Panel */}
      <TabPanel value={tabIndex} index={1}>
        <TextField
          label="Name"
          value={driverName}
          onChange={(e) => setDriverName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Email"
          type="email"
          value={driverEmail}
          onChange={(e) => setDriverEmail(e.target.value)}
          fullWidth
          margin="normal"
        />
        {/* Add more driver-specific fields if needed */}
        <Button
          variant="contained"
          onClick={handleDriverRegistration}
          sx={{ mt: 2 }}
        >
          Register Driver
        </Button>
      </TabPanel>

      {/* Zenmode User Registration Tab Panel */}
      <TabPanel value={tabIndex} index={2}>
        <TextField
          label="Name"
          value={zenName}
          onChange={(e) => setZenName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Email"
          type="email"
          value={zenEmail}
          onChange={(e) => setZenEmail(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Device Details (JSON format)"
          value={zenDeviceDetails}
          onChange={(e) => setZenDeviceDetails(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          rows={3}
        />
        <Button
          variant="contained"
          onClick={handleZenmodeRegistration}
          sx={{ mt: 2 }}
        >
          Register Zenmode User
        </Button>
      </TabPanel>
    </Box>
  );
}
