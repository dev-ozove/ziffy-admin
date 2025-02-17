import React, { useState } from "react";
import Header from "./Header";
import Users from "./Pages/Users";
import PaymentHistory from "./Pages/PaymentHistory";
import Bookings from "./Pages/Bookings";
import Account from "./Pages/User/Account";
import Settings from "./Pages/User/Settings";

import AppImage from "../../Assets/AppLogo.svg";
import AddVehicle from "./Pages/AddVehicle";
import Price_Calculator from "./Pages/Price_Calculator";

export default function Main() {
  const [selectedPage, setSelectedPage] = useState(null);
  const [selectedSetting, setSelectedSetting] = useState(null);

  const renderSelectedComponent = () => {
    // Conditionally render the appropriate component based on the selectedPage or selectedSetting
    switch (selectedPage) {
      case "Bookings":
        return <Bookings />;
      case "Users":
        return <Users />;
      case "Account":
        return <Account />;
      case "Settings":
        return <Settings />;
      case "Add Vechile":
        return (
          <div style={{ marginTop: "50px", flex: 1 }}>
            <AddVehicle />
          </div>
        );
      case "Price Calculator":
        return (
          <div style={{ marginTop: "50px", flex: 1 }}>
            <Price_Calculator />
          </div>
        );
      default:
        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div>
              <img src={AppImage} width={150} height={140} />
            </div>
            <div>
              <h2>Welcome To Ozove </h2>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <div
        style={{ display: "flex", flexDirection: "column", height: "100vh" }}
      >
        <Header
          onSelectPage={(page) => setSelectedPage(page)}
          onSelectSetting={(setting) => setSelectedSetting(setting)}
        />

        {selectedPage !== "Testing Area" && (
          <div
            style={{
              flex: 1,
              display: "flex",
              marginTop: 25,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {renderSelectedComponent()}
          </div>
        )}
        {selectedPage === "Testing Area" && (
          <div style={{}}>{renderSelectedComponent()}</div>
        )}
      </div>
    </>
  );
}
