import React, { useEffect, useState } from "react";
import "./Sign_up.css";
import { useAuth } from "../../Context/AuthContext";
import { Alert, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const { Verify_email, success, error, set_Error, set_success, Create_user } =
    useAuth();

  const [name, set_name] = useState("");
  const [email, set_email] = useState("");
  const [password, set_password] = useState("");
  const [confirm_password, set_confirm_password] = useState("");
  const navigator = useNavigate();

  const clearMessages = () => {
    set_Error("");
    set_success("");
  };

  // useEffect(() => {
  //   const timeout = setTimeout(() => {
  //     if (success !== "" || error !== "") {
  //       clearMessages();
  //     }
  //   }, 4000);
  //   return () => clearTimeout(timeout);
  // }, [success, clearMessages]);

  const handle_signup = async () => {
    if (
      name === "" ||
      email === "" ||
      password === "" ||
      confirm_password === ""
    ) {
      set_Error("Please fill the form Properly");
    } else {
      if (password === confirm_password) {
        await Create_user(email, password, name);
        //window.location.replace("/");
      } else {
        set_Error("Confirm password and password does not match");
      }
    }
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
          <form className="Signup">
            <h2
              style={{
                fontWeight: "bold",
                textAlign: "center",
                color: "#fa4032",
              }}
            >
              Sign Up To Ozove
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
                  set_name(e.currentTarget.value);
                }}
                placeholder="Name..."
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
                type="text"
                onChange={(e) => {
                  set_email(e.currentTarget.value);
                }}
                placeholder="Email..."
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
                  set_confirm_password(e.currentTarget.value);
                }}
                placeholder="Confirm Password..."
              />
            </div>
            <div style={{ marginTop: 20 }}>
              <button className="signup_button" onClick={handle_signup}>
                Signup
              </button>
            </div>
            <div
              style={{
                marginTop: 25,
                display: "flex",
                cursor: "pointer",
                justifyContent: "center",
                backgroundColor: "#FA4032",
                borderRadius: 10,
                padding: 5,
              }}
            >
              <div
                onClick={() => {
                  navigator("/");
                }}
                style={{ color: "white", marginLeft: 10 }}
              >
                Back To Login
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
