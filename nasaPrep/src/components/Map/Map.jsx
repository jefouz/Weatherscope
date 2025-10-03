import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useLocation } from "../../context/LocationContext";
import "./MapComponent.css"; // import CSS file

// Fix default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Debounce helper
const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// Click handler component
const ClickHandler = () => {
  const { setCoordinates } = useLocation();
  const map = useMap();
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setCoordinates({ lat, lng });
      map.flyTo([lat, lng], 10);
    },
  });
  return null;
};

// FlyToCoordinates component
const FlyToCoordinates = () => {
  const { coordinates } = useLocation();
  const map = useMap();
  useEffect(() => {
    if (coordinates) map.flyTo([coordinates.lat, coordinates.lng], 10);
  }, [coordinates, map]);
  return null;
};

const MapComponent = () => {
  const { coordinates, setCoordinates } = useLocation();
  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const API_KEY = "pk.18f1a2d737147216b3788581c94547b9";

  // Get user location on load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoordinates({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error(err)
      );
    }
  }, [setCoordinates]);

  // Fetch suggestions
  const fetchSuggestions = debounce(async (value) => {
    if (!value || value.length < 2) return setSuggestions([]);
    try {
      const res = await fetch(
        `https://api.locationiq.com/v1/autocomplete.php?key=${API_KEY}&q=${encodeURIComponent(
          value
        )}&limit=5`
      );
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error(err);
    }
  }, 300);

  const handleInputChange = (e) => {
    setSearchInput(e.target.value);
    fetchSuggestions(e.target.value);
  };

  const handleSelectSuggestion = (s) => {
    const lat = parseFloat(s.lat);
    const lng = parseFloat(s.lon);
    setCoordinates({ lat, lng });
    setSearchInput(s.display_name);
    setSuggestions([]);
  };

  return (
    <div className="map-container-wrapper">
      {/* Search bar */}
      <div className="search-wrapper">
        <input
          type="text"
          placeholder="Search location..."
          value={searchInput}
          onChange={handleInputChange}
          className="search-input"
        />
        {suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((s, idx) => (
              <li key={idx} onClick={() => handleSelectSuggestion(s)} className="suggestion-item">
                {s.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Map */}
      <MapContainer
        center={coordinates || [0, 0]}
        zoom={coordinates ? 10 : 2}
        className="map-container"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {coordinates && <Marker position={coordinates} />}
        <ClickHandler />
        <FlyToCoordinates />
      </MapContainer>

      {coordinates && (
        <p className="coordinates-text">
          Selected Coordinates: Lat: {coordinates.lat.toFixed(6)}, Lng: {coordinates.lng.toFixed(6)}
        </p>
      )}
    </div>
  );
};

export default MapComponent;
