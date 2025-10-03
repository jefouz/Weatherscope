import { createContext, useState, useContext } from "react";

// 1. Create context
const LocationContext = createContext();

// 2. Create a custom hook for easy access
export const useLocation = () => useContext(LocationContext);

// 3. Create provider component
export const LocationProvider = ({ children }) => {
  const [coordinates, setCoordinates] = useState(null);

  return (
    <LocationContext.Provider value={{ coordinates, setCoordinates }}>
      {children}
    </LocationContext.Provider>
  );
};
