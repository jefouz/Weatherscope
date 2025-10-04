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

// Legend
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
      `;
      return div;
    };
    legend.addTo(map);
    return () => legend.remove();
  }, [map]);
  return null;
};

// Weighted random helper
const weightedRandom = (items) => {
  const r = Math.random();
  let cumulative = 0;
  for (const item of items) {
    cumulative += item.weight;
    if (r <= cumulative) return item;
  }
  return items[items.length - 1];
};

const HazardsMap = () => {
  const today = new Date();
  const todayString = today.toISOString().split("T")[0];

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

    const selected = new Date(selectedDate);

    // Past earthquakes → real data only
    const fetchEarthquakes = async () => {
      try {
        const startTime = selected.toISOString();
        const endTime = new Date(selected.setDate(selected.getDate() + 1)).toISOString();
        const res = await fetch(
          `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${startTime}&endtime=${endTime}&minmagnitude=5`
        );
        const data = await res.json();
        if (data && data.features) setEarthquakes(data.features);
      } catch (err) {
        console.error("Error fetching earthquakes:", err);
      }
    };

    // Future earthquakes → simulated realistically
    const simulateFutureEarthquakes = () => {
      const zones = [
        { name: "Ring of Fire", latRange: [-60, 60], lngRange: [100, -70], weight: 0.7 },
        { name: "Mid-Atlantic Ridge", latRange: [-60, 60], lngRange: [-40, 20], weight: 0.15 },
        { name: "Other Zones", latRange: [-90, 90], lngRange: [-180, 180], weight: 0.15 },
      ];
      const count = Math.floor(Math.random() * 6) + 5;
      const simulated = Array.from({ length: count }, () => {
        const zone = weightedRandom(zones);
        const lat = zone.latRange[0] + Math.random() * (zone.latRange[1] - zone.latRange[0]);
        const lng = zone.lngRange[0] + Math.random() * (zone.lngRange[1] - zone.lngRange[0]);
        const magnitude = (5 + (8 - 5) * Math.pow(Math.random(), 2)).toFixed(1);
        return {
          geometry: { coordinates: [lng, lat] },
          properties: { type: "Earthquake", place: `Predicted earthquake in ${zone.name}`, time: selected.getTime(), magnitude },
        };
      });
      setEarthquakes(simulated);
    };

    // Future storms/tornadoes → seasonal simulation
    const simulateStormsTornadoes = () => {
      const month = selected.getMonth() + 1;
      const zones = [
        { name: "Tornado Alley", latRange: [36, 40], lngRange: [-100, -95], weight: month >= 4 && month <= 6 ? 0.7 : 0.4 },
        { name: "Great Plains", latRange: [39, 42], lngRange: [-98, -93], weight: month >= 5 && month <= 7 ? 0.5 : 0.3 },
        { name: "Southeast USA", latRange: [30, 35], lngRange: [-85, -80], weight: month >= 6 && month <= 9 ? 0.6 : 0.2 },
      ];
      const count = Math.floor(Math.random() * 6) + 5;
      const simulated = Array.from({ length: count }, () => {
        const zone = weightedRandom(zones);
        const lat = zone.latRange[0] + Math.random() * (zone.latRange[1] - zone.latRange[0]);
        const lng = zone.lngRange[0] + Math.random() * (zone.lngRange[1] - zone.lngRange[0]);
        const type = Math.random() < 0.5 ? "Tornado" : "Storm";
        return {
          geometry: { coordinates: [lng, lat] },
          properties: { type, place: `Predicted ${type} in ${zone.name}`, time: selected.getTime(), severity: (Math.random() * 3 + 1).toFixed(1) },
        };
      });
      setStorms(simulated.filter((s) => s.properties.type === "Storm"));
      setTornadoes(simulated.filter((s) => s.properties.type === "Tornado"));
    };

    if (selected < today) {
      fetchEarthquakes(); // Only real past earthquakes
      setStorms([]);
      setTornadoes([]); // No past storm/tornado simulation
    } else {
      simulateFutureEarthquakes();
      simulateStormsTornadoes();
    }
  }, [selectedDate, todayString]);

  return (
    <div className="map-container-wrapper">
      <div className="date-picker">
        <label htmlFor="date">Select Date: </label>
        <input type="date" id="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
      </div>

      <MapContainer center={[0, 0]} zoom={2} style={{ height: "600px", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        <FlyToUserLocation setUserLocation={setUserLocation} />
        <MapLegend />

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>Your Location</Popup>
          </Marker>
        )}

        {[...earthquakes, ...storms, ...tornadoes].map((hazard, idx) => {
          const color = hazardColors[hazard.properties.type.toLowerCase()] || "gray";
          const isFuture = selectedDate >= todayString;
          const radius = hazard.properties.magnitude ? Math.max(4, hazard.properties.magnitude * 2) : 6;

          return (
            <CircleMarker
              key={`${hazard.properties.type}-${idx}`}
              center={[hazard.geometry.coordinates[1], hazard.geometry.coordinates[0]]}
              radius={radius}
              color={color}
              fillColor={color}
              fillOpacity={isFuture ? 0.4 : 0.7}
            >
              <Popup>
                <b>{hazard.properties.place}</b>
                <br />
                Type: {hazard.properties.type}
                <br />
                {hazard.properties.magnitude && <>Magnitude: {hazard.properties.magnitude}<br /></>}
                Severity: {hazard.properties.severity || "-"}
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
