import { useLocation } from "../context/LocationContext";

const AnotherComponent = () => {
  const { coordinates } = useLocation();

  return (
    <div>
      {coordinates ? (
        <p>
          Selected Location: Lat: {coordinates.lat}, Lng: {coordinates.lng}
        </p>
      ) : (
        <p>No location selected yet</p>
      )}
    </div>
  );
};

export default AnotherComponent