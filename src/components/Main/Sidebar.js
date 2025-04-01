import * as React from "react";
import { styled, useTheme, alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import {
  Dashboard,
  People,
  History,
  DirectionsCar,
  Calculate,
  Settings,
  AccountCircle,
  Menu,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Logo from "../../Assets/AppLogo.png";
import { auth } from "../../Firebase";

const drawerWidth = 280;
const collapsedWidth = 80;

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  height: "100%", // Add this line
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  "& .MuiDrawer-paper": {
    backgroundColor: theme.palette.background.paper,
    borderRight: "none",
    boxShadow: theme.shadows[3],
    width: open ? drawerWidth : collapsedWidth,
    height: "100%", // Add this line
    transition: theme.transitions.create(["width", "transform"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowY: "auto",
    "&::-webkit-scrollbar": {
      width: "6px",
    },
    "&::-webkit-scrollbar-track": {
      background: theme.palette.background.default,
    },
    "&::-webkit-scrollbar-thumb": {
      background: alpha(theme.palette.text.primary, 0.2),
      borderRadius: "4px",
    },
    [theme.breakpoints.down("sm")]: {
      position: "fixed",
      zIndex: 1200,
      height: "100vh",
      width: open ? "100%" : 0,
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.easeInOut,
        duration: theme.transitions.duration.standard,
      }),
    },
  },
}));

const FloatingToggleButton = styled(IconButton)(({ theme, open }) => ({
  position: "fixed",
  left: open ? `calc(${drawerWidth}px - 32px)` : "24px",
  top: theme.spacing(2),
  zIndex: 1300,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[4],
  transition: theme.transitions.create(["left", "transform"], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.standard,
  }),
  "&:hover": {
    backgroundColor: theme.palette.background.paper,
    transform: "scale(1.1)",
  },
  [theme.breakpoints.down("sm")]: {
    left: open ? "calc(100% - 56px)" : "24px",
  },
}));

const SidebarContent = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  marginTop: theme.spacing(4),
  padding: theme.spacing(2),
  background: `linear-gradient(180deg, ${
    theme.palette.background.paper
  } 0%, ${alpha(theme.palette.background.default, 0.8)} 100%)`,
}));

const Sidebar = ({ onSelectPage, onSelectSetting, selectedPage }) => {
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const mainItems = [
    { text: "Dashboard", icon: <Dashboard />, page: "Dashboard" },
    { text: "Bookings", icon: <DirectionsCar />, page: "Bookings" },
    { text: "Users", icon: <People />, page: "Users" },
    { text: "Payment History", icon: <History />, page: "Payment History" },
    {
      text: "Add Vehicle Categories",
      icon: <DirectionsCar />,
      page: "Add Vehicle Categories",
    },
    {
      text: "Add Driver",
      icon: <DirectionsCar />,
      page: "Add Driver",
    },
    { text: "Price Calculator", icon: <Calculate />, page: "Price Calculator" },
  ];

  const settingsItems = [
    { text: "Account", icon: <AccountCircle />, page: "Account" },
    { text: "Settings", icon: <Settings />, page: "Settings" },
  ];

  const handleItemClick = (page) => {
    if (["Account", "Settings"].includes(page)) {
      onSelectSetting(page);
    } else {
      onSelectPage(page);
    }
    if (window.innerWidth < theme.breakpoints.values.sm) {
      setOpen(false);
    }
  };

  const handleOptionClick = (item) => {
    if (item.page == "Account") {
      auth
        .signOut()
        .then(() => {
          console.log("Signed out successfully");
          window.location.reload();
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      console.log("Settings");
    }
  };

  return (
    <>
      <FloatingToggleButton
        open={open}
        onClick={handleDrawerToggle}
        aria-label="toggle sidebar"
      >
        {open ? <ChevronLeftIcon /> : <Menu />}
      </FloatingToggleButton>

      <Drawer variant="permanent" open={open}>
        <SidebarContent>
          <List sx={{ flexGrow: 1 }}>
            {mainItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  onClick={() => handleItemClick(item.page)}
                  selected={selectedPage === item.page}
                  sx={{
                    minHeight: 56,
                    borderRadius: "12px",
                    mb: 1,
                    px: 2,
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      background: `linear-gradient(90deg, ${alpha(
                        theme.palette.primary.main,
                        0.1
                      )} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                      transform: "translateX(8px)",
                    },
                    "&.Mui-selected": {
                      background: `linear-gradient(90deg, ${alpha(
                        theme.palette.primary.main,
                        0.2
                      )} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                      boxShadow: theme.shadows[1],
                      "& .MuiListItemIcon-root": {
                        color: theme.palette.primary.main,
                      },
                      "& .MuiListItemText-primary": {
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 2 : "auto",
                      color: theme.palette.text.secondary,
                      transition: "margin 0.2s ease",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      variant: "body1",
                      sx: {
                        opacity: open ? 1 : 0,
                        transition: "opacity 0.2s ease",
                        color: theme.palette.text.primary,
                        fontWeight: 500,
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Divider
            sx={{
              my: 2,
              borderColor: alpha(theme.palette.divider, 0.1),
              opacity: open ? 1 : 0,
              transition: "opacity 0.2s ease",
            }}
          />

          <List>
            {settingsItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  onClick={() => {
                    handleOptionClick(item);
                  }}
                  selected={selectedPage === item.page}
                  sx={{
                    minHeight: 56,
                    borderRadius: "12px",
                    mb: 1,
                    px: 2,
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      background: alpha(theme.palette.secondary.main, 0.1),
                      transform: "translateX(8px)",
                    },
                    "&.Mui-selected": {
                      background: alpha(theme.palette.secondary.main, 0.2),
                      "& .MuiListItemIcon-root": {
                        color: theme.palette.secondary.main,
                      },
                      "& .MuiListItemText-primary": {
                        color: theme.palette.secondary.main,
                        fontWeight: 600,
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 2 : "auto",
                      color: theme.palette.text.secondary,
                      transition: "margin 0.2s ease",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      variant: "body1",
                      sx: {
                        opacity: open ? 1 : 0,
                        transition: "opacity 0.2s ease",
                        color: theme.palette.text.primary,
                        fontWeight: 500,
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </SidebarContent>
      </Drawer>
    </>
  );
};

export default Sidebar;
