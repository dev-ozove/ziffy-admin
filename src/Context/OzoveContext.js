import React, { useContext, useState } from "react";
import { db } from "../Firebase";
import {
  collection,
  collectionGroup,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";
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
  const _getAllBookingsDetails = async (
    pageSize = 10,
    lastVisible = null,
    filters = {}
  ) => {
    try {
      let queryRef = collectionGroup(db, "individual_bookings");

      // Always sort by TimeStamp (required by the index)
      queryRef = query(queryRef, orderBy("TimeStamp", "desc"));

      // Apply filters
      const filterConditions = [];
      if (filters.dateFrom) {
        filterConditions.push(
          where("TimeStamp", ">=", new Date(filters.dateFrom))
        );
      }
      if (filters.dateTo) {
        filterConditions.push(
          where("TimeStamp", "<=", new Date(filters.dateTo))
        );
      }
      if (filters.status && filters.status !== "all") {
        filterConditions.push(where("Status", "==", filters.status));
      }

      // Combine query conditions
      if (filterConditions.length > 0) {
        queryRef = query(queryRef, ...filterConditions);
      }

      // Pagination
      queryRef = query(queryRef, limit(pageSize));
      if (lastVisible) {
        queryRef = query(queryRef, startAfter(lastVisible));
      }

      const bookingsSnapshot = await getDocs(queryRef);
      const bookings = [];
      bookingsSnapshot.forEach((doc) => {
        bookings.push({ id: doc.id, ref: doc.ref, ...doc.data() });
      });

      const newLastVisible =
        bookingsSnapshot.docs[bookingsSnapshot.docs.length - 1];
      return { bookings, lastVisible: newLastVisible };
    } catch (error) {
      console.error("Error fetching bookings:", error);
      throw new Error("Failed to fetch bookings.");
    }
  };

  const _updateBookingStatus = async (updatedBooking) => {
    try {
      // Create update object with proper nested fields
      const updateData = {
        "status.bookingStatus": updatedBooking.status.bookingStatus,
        "status.statusCode": updatedBooking.status.statusCode,
      };

      // Only add driver data if it exists
      if (updatedBooking.driver) {
        updateData["driver.id"] = updatedBooking.driver.id;
        updateData["driver.name"] = updatedBooking.driver.name;
      } else {
        updateData["driver"] = null; // Or firestore.FieldValue.delete() to remove field
      }

      await updateDoc(updatedBooking.ref, updateData);

      // Update local state
      setBookings((prev) =>
        prev.map((b) =>
          b.id === updatedBooking.id ? { ...b, ...updateData } : b
        )
      );

      return true;
    } catch (error) {
      console.error("Error updating booking:", error);
      throw new Error("Failed to update booking");
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

  const _addVehicle = async (vehicleData) => {
    try {
      setLoading(true);
      // Generate custom ID using plate number and chassis number
      const customId = `${vehicleData.plateNumber}_${vehicleData.chassisNumber}`
        .toUpperCase()
        .replace(/[^a-zA-Z0-9]/g, "_");

      // Create document reference with custom ID
      const vehicleRef = doc(db, "vehiclesDetails", customId);

      // Prepare vehicle data with metadata
      const vehicleWithMeta = {
        ...vehicleData,
        id: customId, // Include the custom ID in the document
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: "active", // Add default status
      };

      // Save to Firestore
      await setDoc(vehicleRef, vehicleWithMeta)
        .then(() => {
          setLoading(false);
          console.log("Vehicle added successfully");
        })
        .catch((error) => {
          setLoading(false);
          console.error("Error adding vehicle:", error);
          setError(error.message);
          throw new Error("Failed to add vehicle");
        });

      return customId;
    } catch (error) {
      console.error("Error adding vehicle:", error);
      throw new Error("Failed to add vehicle");
    }
  };

  // Add this to OzoveProvider.js
  const _addDriver = async (driverData) => {
    try {
      setLoading(true);
      const driverRef = doc(collection(db, "drivers"));
      const driverWithMeta = {
        ...driverData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: "active",
      };
      await setDoc(driverRef, driverWithMeta);
      setLoading(false);
      return driverRef.id;
    } catch (error) {
      console.error("Error adding driver:", error);
      setLoading(false);
      setError(error.message);
      throw new Error("Failed to add driver");
    }
  };

  // In OzoveProvider.js

  const value = {
    bookings,
    loading,
    error,
    hoveredUser,
    _addVehicle,
    _getAllBookingsDetails,
    _getUserDetails,
    _updateBookingStatus,
    _addDriver,
  };

  return (
    <OzoveContext.Provider value={value}>{children}</OzoveContext.Provider>
  );
}
