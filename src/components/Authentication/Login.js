import React, { useEffect, useState } from "react";
import "./Login.css";
import { useAuth } from "../../Context/AuthContext";
import { Alert, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const {
    Login_user,
    Verify_email,
    success,
    error,
    set_Error,
    set_success,
    set_disable_login,
    disable_login,
  } = useAuth();
  const [email, set_email] = useState("");
  const [password, set_password] = useState("");
  const navigator = useNavigate();

  const clearMessages = () => {
    set_Error("");
    set_success("");
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (success !== "" || error !== "") {
        clearMessages();
      }
    }, 4000);
    return () => clearTimeout(timeout);
  }, [success, clearMessages]);

  const handle_Verify = () => {
    if (email !== "") {
      Verify_email(email);
    } else {
      set_Error("Email is empty Please try again");
    }
  };

  const handle_Login = () => {
    Login_user(email, password);
  };

  return (
    <>
      <div
        style={{
          backgroundColor: "#FF8000",
          height: "100vh",
          width: "100vw",
        }}
      >
        <div>
          <form className="login">
            <h2
              style={{
                fontWeight: "bold",
                textAlign: "center",
                color: "#fa4032",
              }}
            >
              Login To Ozove
            </h2>
            <div style={{ margin: 10 }}>
              {error !== "" && (
                <Alert variant="outlined" severity="error">
                  {error}
                </Alert>
              )}
              {success !== "" && (
                <Alert variant="outlined" severity="success">
                  {success}
                </Alert>
              )}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-evenly",
              }}
            >
              <input
                style={{
                  marginTop: 10,
                  marginBottom: 10,
                  borderRadius: "5px",
                  borderWidth: 0,
                  fontSize: "16px",
                  padding: "10px 10px",
                }}
                type="text"
                onChange={(e) => {
                  set_email(e.currentTarget.value);
                }}
                placeholder="Email"
              />
              <input
                style={{
                  marginTop: 10,
                  marginBottom: 10,
                  borderRadius: "5px",
                  borderWidth: 0,
                  fontSize: "16px",
                  padding: "10px 10px",
                }}
                type="password"
                onChange={(e) => {
                  set_password(e.currentTarget.value);
                }}
                placeholder="Password"
              />
            </div>
            <div style={{ marginTop: 20 }}>
              <Button
                sx={{
                  backgroundColor: "#fa4032",
                  marginLeft: 5,
                  marginRight: 5,
                  marginTop: 5,
                }}
                onClick={handle_Verify}
                variant="contained"
              >
                {" "}
                Verify{" "}
              </Button>
              <Button
                sx={{
                  backgroundColor: "#fa4032",
                  marginLeft: 5,
                  marginRight: 5,
                  marginTop: 5,
                }}
                variant="contained"
                disabled={disable_login}
                onClick={handle_Login}
              >
                Login
              </Button>
            </div>
            <div
              style={{
                marginTop: 25,
                display: "flex",
                cursor: "pointer",
                justifyContent: "center",
                backgroundColor: "#fa4032",
                borderRadius: 10,
                padding: 5,
              }}
            >
              <div
                onClick={() => {
                  navigator("/SignUp");
                }}
                style={{ color: "white", marginLeft: 10 }}
              >
                Create a New Account
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
