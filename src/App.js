import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import "./App.css";
import { AuthProvider } from "./Context/AuthContext";
import { auth } from "./Firebase";
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Authentication/Login";
import Main from "./components/Main/Main";
import SignUp from "./components/Authentication/SignUp";
import EmailVerification from "./components/Authentication/EmailVerification";
import { OzoveProvider } from "./Context/OzoveContext";

function App() {
  const [loading, set_loading] = useState(true);
  const [user, set_user] = useState();
  const [email_verification, set_email_verification] = useState();
  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, (user) => {
      set_user(user);
      if (loading) set_loading(false);
      if (user) {
        if (user.emailVerified == false) {
          set_email_verification(user.emailVerified);
        }
      }
    });
    return () => subscriber;
  }, []);
  console.log(email_verification);
  if (loading) {
    return (
      <div
        className="d-flex align-items-center justify-content-center vh-100 loading-screen"
        style={{ backgroundColor: "#fab12f" }}
      >
        <div>
          <p
            style={{
              fontSize: "50px",
              fontWeight: "bold",
              fontFamily: "sans-serif",
              color: "#fa4032",
            }}
          >
            Loading...
          </p>
        </div>
      </div>
    );
  }
  if (email_verification == false) {
    return (
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<EmailVerification />} />
          </Routes>
        </Router>
      </AuthProvider>
    );
  }

  if (!user) {
    return (
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/SignUp" element={<SignUp />} />
            <Route path="/Email-verification" element={<EmailVerification />} />
          </Routes>
        </Router>
      </AuthProvider>
    );
  } else {
    return (
      <AuthProvider>
        <OzoveProvider>
          <Router>
            <Routes>
              <Route exact path="/" element={<Main />} />
            </Routes>
          </Router>
        </OzoveProvider>
      </AuthProvider>
    );
  }
}

export default App;
