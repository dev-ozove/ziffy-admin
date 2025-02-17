import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import React, { useContext, useState } from "react";
import { auth, db } from "../Firebase";
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [loading, set_loading] = useState(false);
  const [error, set_Error] = useState("");
  const [success, set_success] = useState("");
  const [disabled, set_disabled] = useState(false);
  const [disable_login, set_disable_login] = useState(true);

  async function Login_user(email, password) {
    set_loading(true);
    if (email === "" || password === "") {
      set_Error("Invalid Email and password. Please Try Again");
      set_loading(false);
    } else if (email === "") {
      set_Error("Email is Empty. Please Try Again");
      set_loading(false);
    } else if (password === "") {
      set_Error("Password is Empty. Please Try Again");
      set_loading(false);
    } else {
      await signInWithEmailAndPassword(auth, email, password)
        .then((e) => {
          set_loading(false);
          set_success("Logged In Successfully.");
        })
        .catch((e) => {
          console.log(e);
          set_Error(e.message);
        });
    }
  }
  async function Verify_email(email) {
    set_loading(true);
    const docRef = doc(db, "Admins", email);
    await getDoc(docRef)
      .then((e) => {
        console.log(e);
        if (e.exists) {
          console.log(e);
          console.log(e.data());
          const Email = e.data().email;
          console.log(Email);
          if (Email === email) {
            set_success("Verified Admin");
            set_disable_login(false);
          } else {
            console.log("User is not Verified");
            set_Error("User is not Verified");
          }
        } else {
          set_Error("User is not Verified");
        }
      })
      .catch((e) => {
        console.log(e);
        set_Error("User is not Available");
      });
  }

  async function Create_user(email, password, name) {
    set_loading(true);
    if (email !== "" && password !== "") {
      const docRef = doc(db, "Admins", email);
      await getDoc(docRef)
        .then(async (e) => {
          if (e.exists) {
            const Firebase_Email = e.data().email;
            if (Firebase_Email === email) {
              await createUserWithEmailAndPassword(auth, email, password)
                .then(async (e) => {
                  await updateProfile(auth.currentUser, {
                    displayName: name,
                  })
                    .then((e) => {
                      set_success("Welcome To OZ-ove");
                    })
                    .catch((e) => {
                      set_Error(
                        "Error in Updating the profile please Try again"
                      );
                    });
                })
                .catch((e) => {
                  set_Error("Error in Creating User. Please Try again");
                });
            } else {
              set_Error("Email is not Same");
            }
          } else {
            set_Error("User is not Verified");
          }
        })
        .catch((e) => {
          set_Error("You are not registered as Admin");
        });
    }
  }

  async function send_verification_link() {
    await sendEmailVerification(auth.currentUser)
      .then(async (e) => {
        const docRef = doc(db, "Admins", auth.currentUser.email);
        await updateDoc(docRef, {
          verified: true,
        })
          .then((e) => {
            console.log("Email Verification Updated");
            set_success("Verification Email sent");
          })
          .catch((e) => {
            console.log(e);
            set_Error(
              "Error in setting email Verification State. Please try again"
            );
          });
      })
      .catch((E) => {
        console.log(E);
        set_Error("Error in the Email Verification. Please try again");
      });
  }

  const SignOut_delete_user = async () => {
    const docRef = doc(db, "Admins", auth.currentUser.email);
    await deleteDoc(docRef)
      .then(async (e) => {
        await deleteUser(auth.currentUser)
          .then(() => {
            window.alert("User Deleted Sucessfully");
          })
          .catch((e) => {
            console.log(e);
          });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const value = {
    Login_user,
    Verify_email,
    error,
    success,
    loading,
    set_success,
    set_Error,
    set_disable_login,
    disable_login,
    Create_user,
    send_verification_link,
    SignOut_delete_user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
