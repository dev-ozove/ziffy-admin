import React, { useContext, useState } from "react";
import { db } from "../Firebase";
import { collection, collectionGroup, getDocs } from "firebase/firestore";
import { connectStorageEmulator } from "firebase/storage";

const OzoveContext = React.createContext();

export function useOzove() {
  return useContext(OzoveContext);
}

export function OzoveProvider({ children }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hoveredUser, setHoveredUser] = useState(null);

  // Fetch all bookings from Firebase
  const _getAllBookingsDetails = async () => {
    try {
      const bookings = [];
      //querry for getting the uid
      const bookingRef = collectionGroup(db, "individual_bookings");
      const bookingsSnapshot = await getDocs(bookingRef);
      bookingsSnapshot.forEach((doc) => {
        console.log(doc);
        bookings.push(doc.data());
      });

      // const BookingRef = collection(db, "bookings"); // Reference to the bookings collection
      // const querySnapshot = await getDocs(BookingRef);

      //
      // querySnapshot.forEach((doc) => {
      //   console.log(doc);
      //   uids.push(doc.id); // Push each document ID (uid) to the array
      // });

      // console.log("UIDs in bookings collection:", uids);

      //   usersSnapshot.docs.forEach((userDoc) => {
      //     const userId = userDoc.id; // Get the userId
      //     console.log(userId);
      //     const individualBookingsRef = collection(
      //       db,
      //       "Bookings",
      //       userId,
      //       "Individual_Bookings"
      //     );
      //   });

      // Loop through each user document in the Bookings collection
      // for (const userDoc of usersSnapshot.docs) {
      //   const userId = userDoc.id; // Get the userId
      //   const individualBookingsRef = collection(
      //     db,
      //     "bookings",
      //     userId,
      //     "individual_bookings"
      //   );

      //   // Query the Individual_Bookings subcollection for this user
      //   const bookingsSnapshot = await getDocs(individualBookingsRef);
      //   // Add each booking to the array with userId included
      //   bookingsSnapshot.forEach((bookingDoc) => {
      //     bookings.push({
      //       location: bookingDoc.data().location,
      //       userId, // Include the userId
      //       bookingId: bookingDoc.id, // Booking document ID
      //       ...bookingDoc.data(), // Booking data
      //     });
      //     //console.log(bookingDoc.data());
      //   });
      // }

      return bookings; // Return all bookings
    } catch (error) {
      console.error("Error fetching bookings:", error);
      throw new Error("Failed to fetch bookings.");
    }
  };

  // Fetch user details for a specific UID
  const _getUserDetails = async (uid) => {
    if (!uid) {
      setHoveredUser(null);
      return;
    }
    try {
      const userDoc = await db.collection("Users").doc(uid).get();
      if (userDoc.exists) {
        setHoveredUser(userDoc.data());
      } else {
        console.warn(`No user found for UID: ${uid}`);
        setHoveredUser(null);
      }
    } catch (err) {
      console.error("Failed to fetch user details:", err);
    }
  };

  const value = {
    bookings,
    loading,
    error,
    hoveredUser,
    _getAllBookingsDetails,
    _getUserDetails,
  };

  return (
    <OzoveContext.Provider value={value}>{children}</OzoveContext.Provider>
  );
}
