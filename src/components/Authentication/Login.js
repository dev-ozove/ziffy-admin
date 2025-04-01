import React, { useEffect, useState } from "react";
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
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import {
  LockOutlined,
  AlternateEmailOutlined,
  PasswordOutlined,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

const defaultTheme = createTheme({
  palette: {
    primary: { main: "#2A3F54" },
    secondary: { main: "#FF6F61" },
    background: { default: "#F7F9FC" },
  },
  typography: {
    fontFamily: "Inter, sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-1px)",
          },
        },
      },
    },
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

export default function Login() {
  const {
    Login_user,
    Verify_email,
    success,
    error,
    set_Error,
    set_success,
    disable_login,
  } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  const clearMessages = () => {
    set_Error("");
    set_success("");
  };

  useEffect(() => {
    const timeout = setTimeout(clearMessages, 4000);
    return () => clearTimeout(timeout);
  }, [success, error]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      await Verify_email(email);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      await Login_user(email, password);
    } finally {
      setIsLoggingIn(false);
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
              Admin Portal Access
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

              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleVerify}
                  disabled={!email || isVerifying}
                  startIcon={isVerifying && <CircularProgress size={20} />}
                  sx={{ py: 1.5 }}
                >
                  {isVerifying ? "Verifying..." : "Verify Email"}
                </Button>
              </Stack>

              <TextField
                fullWidth
                margin="normal"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PasswordOutlined color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mt: 3 }}
              />

              <Button
                fullWidth
                variant="contained"
                onClick={handleLogin}
                disabled={isLoggingIn || disable_login || !email || !password}
                size="large"
                sx={{
                  mt: 3,
                  py: 1.5,
                  bgcolor: "primary.main",
                  "&:hover": { bgcolor: "primary.dark" },
                  "&.Mui-disabled": {
                    bgcolor: "action.disabledBackground",
                    color: "text.disabled",
                  },
                }}
              >
                {isLoggingIn ? (
                  <CircularProgress size={24} sx={{ color: "common.white" }} />
                ) : (
                  "Sign In"
                )}
              </Button>

              <Grid container sx={{ mt: 3, mb: 2 }}>
                <Grid item xs>
                  <Link
                    href="#"
                    variant="body2"
                    sx={{ color: "text.secondary" }}
                  >
                    Forgot Password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link
                    href="#"
                    variant="body2"
                    onClick={() => navigate("/SignUp")}
                    sx={{ color: "text.secondary" }}
                  >
                    Create Admin Account
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
