import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Hazard colors
const hazardColors = {
  earthquake: "red",
  storm: "blue",
  tornado: "purple",
};

// Fly to user location
const FlyToUserLocation = ({ setUserLocation }) => {
  const map = useMap();
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          map.setView([latitude, longitude], 5);
        },
        (err) => console.error(err)
      );
    }
  }, [map, setUserLocation]);
  return null;
};

// Legend component
const MapLegend = () => {
  const map = useMap();
  useEffect(() => {
    const legend = L.control({ position: "topright" });
    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "info legend");
      div.style.backgroundColor = "white";
      div.style.padding = "6px 10px";
      div.style.borderRadius = "8px";
      div.style.boxShadow = "0 0 5px rgba(0,0,0,0.3)";
      div.innerHTML = `
        <h4>Legend</h4>
        <i style="background:${hazardColors.earthquake};width:12px;height:12px;display:inline-block;margin-right:5px;"></i> Earthquake<br>
        <i style="background:${hazardColors.storm};width:12px;height:12px;display:inline-block;margin-right:5px;"></i> Storm<br>
        <i style="background:${hazardColors.tornado};width:12px;height:12px;display:inline-block;margin-right:5px;"></i> Tornado<br>
        <small style="display:block;margin-top:5px;">*Semi-transparent markers are simulated hazards</small>
      `;
      return div;
    };
    legend.addTo(map);
    return () => legend.remove();
  }, [map]);
  return null;
};

const HazardsMap = () => {
  const today = new Date();
  const todayString = today.toISOString().split("T")[0]; // YYYY-MM-DD

  const [selectedDate, setSelectedDate] = useState(todayString);
  const [earthquakes, setEarthquakes] = useState([]);
  const [storms, setStorms] = useState([]);
  const [tornadoes, setTornadoes] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (!selectedDate) return;

    setEarthquakes([]);
    setStorms([]);
    setTornadoes([]);

    const fetchEarthquakes = async () => {
      try {
        const startTime = new Date(selectedDate).toISOString();
        const endTime = new Date(new Date(selectedDate).setDate(new Date(selectedDate).getDate() + 1)).toISOString();

        const res = await fetch(
          `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${startTime}&endtime=${endTime}&minmagnitude=5`
        );
        const data = await res.json();
        if (data && data.features) setEarthquakes(data.features);
      } catch (err) {
        console.error("Error fetching earthquakes:", err);
      }
    };

    const simulateHazards = () => {
      const simulate = (type, count = Math.floor(Math.random() * 5) + 3) =>
        Array.from({ length: count }, () => {
          const lat = -60 + Math.random() * 120;
          const lng = -180 + Math.random() * 360;
          return {
            geometry: { coordinates: [lng, lat] },
            properties: {
              type,
              place: `${type} Event`,
              time: new Date(selectedDate).getTime(),
              severity: (Math.random() * 3 + 1).toFixed(1),
            },
          };
        });

      setStorms(simulate("Storm"));
      setTornadoes(simulate("Tornado"));

      if (selectedDate > todayString) {
        setEarthquakes(simulate("Earthquake"));
      }
    };

    // Fetch earthquakes only if past or today
    if (selectedDate <= todayString) {
      fetchEarthquakes();
      simulateHazards(); // simulate storms/tornadoes
    } else {
      simulateHazards(); // simulate all hazards for future
    }
  }, [selectedDate, todayString]);

  return (
    <div className="map-container-wrapper">
      <div className="date-picker">
        <label htmlFor="date">Select Date: </label>
        <input
          type="date"
          id="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      <MapContainer center={[0, 0]} zoom={2} style={{ height: "600px", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <FlyToUserLocation setUserLocation={setUserLocation} />
        <MapLegend />

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>Your Location</Popup>
          </Marker>
        )}

        {[...earthquakes, ...storms, ...tornadoes].map((hazard, idx) => {
          const color = hazardColors[hazard.properties.type.toLowerCase()] || "gray";
          const isFuture = selectedDate > todayString;
          return (
            <CircleMarker
              key={`${hazard.properties.type}-${idx}`}
              center={[hazard.geometry.coordinates[1], hazard.geometry.coordinates[0]]}
              radius={8}
              color={color}
              fillColor={color}
              fillOpacity={isFuture ? 0.4 : 0.7}
            >
              <Popup>
                <b>{hazard.properties.place}</b>
                <br />
                Type: {hazard.properties.type}
                <br />
                Severity: {hazard.properties.severity}
                <br />
                Date: {new Date(hazard.properties.time).toLocaleDateString()}
                {isFuture && " (Predicted)"}
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default HazardsMap;
