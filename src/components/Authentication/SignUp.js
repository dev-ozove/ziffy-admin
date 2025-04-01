import React, { useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  TextField,
  Typography,
  Container,
  CssBaseline,
  Box,
  Link,
  Grid,
  Stack,
  InputAdornment,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  LockOutlined,
  PersonOutline,
  AlternateEmailOutlined,
  PasswordOutlined,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const defaultTheme = createTheme({
  palette: {
    primary: { main: "#2A3F54" },
    secondary: { main: "#FF6F61" },
    background: { default: "#F7F9FC" },
  },
  typography: {
    fontFamily: "Inter, sans-serif",
  },
});

const BackgroundContainer = styled("div")({
  position: "fixed",
  width: "100%",
  height: "100%",
  backgroundColor: defaultTheme.palette.primary.main,
  backgroundImage: `
    linear-gradient(45deg, ${defaultTheme.palette.primary.dark} 10%, transparent 10%),
    linear-gradient(-45deg, ${defaultTheme.palette.primary.dark} 10%, transparent 10%),
    linear-gradient(45deg, transparent 90%, ${defaultTheme.palette.primary.dark} 90%),
    linear-gradient(-45deg, transparent 90%, ${defaultTheme.palette.primary.dark} 90%)
  `,
  backgroundSize: "4em 4em",
  opacity: 0.1,
  zIndex: -1,
});

const GlassCard = styled(Box)(({ theme }) => ({
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(4),
  boxShadow: theme.shadows[10],
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.3)",
}));

export default function SignUp() {
  const { Verify_email, success, error, set_Error, set_success, Create_user } =
    useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const clearMessages = () => {
    set_Error("");
    set_success("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      set_Error("Please fill all required fields");
      return;
    }
    if (password !== confirmPassword) {
      set_Error("Passwords do not match");
      return;
    }
    try {
      await Create_user(email, password, name);
      navigate("/");
    } catch (error) {
      set_Error(error.message);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <BackgroundContainer />
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minHeight: "100vh",
            pt: 8,
          }}
        >
          <GlassCard>
            <Box
              sx={{
                bgcolor: "primary.main",
                p: 2,
                borderRadius: 3,
                mb: 3,
                boxShadow: 3,
              }}
            >
              <LockOutlined sx={{ color: "white", fontSize: 40 }} />
            </Box>

            <Typography
              variant="h5"
              component="h1"
              sx={{
                fontWeight: 600,
                mb: 4,
                color: "primary.main",
              }}
            >
              Create Admin Account
            </Typography>

            <Box component="form" sx={{ width: "100%", mt: 1 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}

              <TextField
                fullWidth
                margin="normal"
                label="Full Name"
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutline color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                margin="normal"
                label="Email Address"
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AlternateEmailOutlined color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                margin="normal"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PasswordOutlined color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                margin="normal"
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PasswordOutlined color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                fullWidth
                variant="contained"
                onClick={handleSignup}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  fontSize: "1rem",
                  textTransform: "none",
                  borderRadius: 1,
                }}
              >
                Create Account
              </Button>

              <Grid container justifyContent="center">
                <Grid item>
                  <Link
                    variant="body2"
                    onClick={() => navigate("/")}
                    sx={{
                      color: "text.secondary",
                      cursor: "pointer",
                      "&:hover": {
                        color: "primary.main",
                      },
                    }}
                  >
                    Already have an account? Sign In
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </GlassCard>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
