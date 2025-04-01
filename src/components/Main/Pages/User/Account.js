import React from "react";
import {
  Avatar,
  Box,
  Button,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { Lock, Mail, Notifications, Person } from "@mui/icons-material";

// Account Screen Component
export const AccountScreen = ({ onLogout }) => {
  const [user, setUser] = React.useState({
    name: "John Doe",
    email: "john.doe@company.com",
    phone: "+1 555 123 4567",
    avatar: "https://example.com/avatar.jpg",
  });

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Account Settings
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Avatar src={user.avatar} sx={{ width: 100, height: 100, mb: 2 }} />
        <Button variant="outlined" size="small">
          Change Avatar
        </Button>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box component="form" sx={{ display: "grid", gap: 3 }}>
        <TextField
          label="Full Name"
          value={user.name}
          onChange={(e) => setUser({ ...user, name: e.target.value })}
          InputProps={{
            startAdornment: <Person sx={{ mr: 1, color: "action.active" }} />,
          }}
          fullWidth
        />

        <TextField
          label="Email Address"
          value={user.email}
          InputProps={{
            startAdornment: <Mail sx={{ mr: 1, color: "action.active" }} />,
          }}
          fullWidth
          disabled
        />

        <TextField
          label="Phone Number"
          value={user.phone}
          onChange={(e) => setUser({ ...user, phone: e.target.value })}
          InputProps={{
            startAdornment: <span style={{ marginRight: 8 }}>+1</span>,
          }}
          fullWidth
        />

        <Button
          variant="contained"
          size="large"
          sx={{ mt: 2 }}
          onClick={onLogout}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
};

// Settings Screen Component
export const SettingsScreen = ({ onLogout }) => {
  const [settings, setSettings] = React.useState({
    theme: "light",
    notifications: true,
    twoFactorAuth: false,
  });

  const handleChange = (name) => (event) => {
    setSettings({
      ...settings,
      [name]: event.target.value || event.target.checked,
    });
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Application Settings
      </Typography>

      <Box sx={{ display: "grid", gap: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Theme</InputLabel>
          <Select
            value={settings.theme}
            label="Theme"
            onChange={handleChange("theme")}
          >
            <MenuItem value="light">Light</MenuItem>
            <MenuItem value="dark">Dark</MenuItem>
            <MenuItem value="system">System Default</MenuItem>
          </Select>
        </FormControl>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Notifications />
            <Typography>Enable Notifications</Typography>
          </Box>
          <Switch
            checked={settings.notifications}
            onChange={handleChange("notifications")}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Lock />
            <Typography>Two-Factor Authentication</Typography>
          </Box>
          <Switch
            checked={settings.twoFactorAuth}
            onChange={handleChange("twoFactorAuth")}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Button
          variant="contained"
          color="error"
          size="large"
          onClick={onLogout}
          sx={{ mt: 2 }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
};
