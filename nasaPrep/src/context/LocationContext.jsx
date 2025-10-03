import { createContext, useState, useContext } from "react";

// 1. Create context
const LocationContext = createContext();

// 2. Custom hook
export const useLocation = () => useContext(LocationContext);

// 3. Provider component
export const LocationProvider = ({ children }) => {
  const today = new Date().toISOString().split("T")[0];
  const [coordinates, setCoordinates] = useState(null);
  const [date, setDate] = useState(today); // Add date here

  return (
    <LocationContext.Provider value={{ coordinates, setCoordinates, date, setDate }}>
      {children}
    </LocationContext.Provider>
  );
};
