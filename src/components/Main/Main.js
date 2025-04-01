// Main.js
import React, { useState } from "react";
import { Box, CssBaseline } from "@mui/material";
import Users from "./Pages/Users";
import PaymentHistory from "./Pages/PaymentHistory";
import Bookings from "./Pages/Bookings";
import Account, { AccountScreen, SettingsScreen } from "./Pages/User/Account";
import Settings from "./Pages/User/Settings";
import AddVehicle from "./Pages/AddVehicle";
import Price_Calculator from "./Pages/Price_Calculator";
import Sidebar from "./Sidebar";
import { useAuth } from "../../Context/AuthContext";
import AddDriver from "./Pages/AddDriver";

export default function Main() {
  const [selectedPage, setSelectedPage] = useState("Dashboard");
  const [selectedSetting, setSelectedSetting] = useState(null);
  const { logout } = useAuth(); // Assume you have an auth context

  const handleLogout = () => {
    // Perform logout logic
    console.log("Log out clicked");
    // Redirect to login
    window.location.href = "/login";
  };

  const renderSelectedComponent = () => {
    switch (selectedPage) {
      case "Bookings":
        return <Bookings />;
      case "Users":
        return <Users />;
      case "Account":
        return <AccountScreen onLogout={handleLogout} />;
      case "Settings":
        return <SettingsScreen onLogout={handleLogout} />;
      case "Add Vehicle Categories":
        return <AddVehicle />;
      case "Price Calculator":
        return <Price_Calculator />;
      case "Add Driver":
        return <AddDriver />;

      default:
        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              textAlign: "center",
              p: 3,
            }}
          >
            <h2>Welcome To Ozove Admin Portal</h2>
            <p>Select a menu item to get started</p>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ display: "flex", flex: 1, flexGrow: 1, height: "100vh" }}>
      <CssBaseline />
      <Sidebar
        onSelectPage={setSelectedPage}
        onSelectSetting={setSelectedSetting}
        selectedPage={selectedPage}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          transition: (theme) =>
            theme.transitions.create("margin", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        {renderSelectedComponent()}
      </Box>
    </Box>
  );
}
