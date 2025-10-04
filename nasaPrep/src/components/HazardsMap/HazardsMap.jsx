import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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

// Fly to user location and store coordinates
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
      `;
      return div;
    };
    legend.addTo(map);

    return () => legend.remove();
  }, [map]);
  return null;
};

const HazardsMap = () => {
  const todayString = new Date().toISOString().split("T")[0];
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
    const today = new Date();

    const fetchPastEarthquakes = async () => {
      const startTime = selected.toISOString();
      const endTime = new Date(selected.setDate(selected.getDate() + 1)).toISOString();
      try {
        const res = await fetch(
          `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${startTime}&endtime=${endTime}&minmagnitude=5`
        );
        const data = await res.json();
        setEarthquakes(data.features);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchPastStorms = async () => {
      const start = selected.toISOString().split("T")[0];
      const end = new Date(selected.setDate(selected.getDate() + 1)).toISOString().split("T")[0];
      try {
        const res = await fetch(
          `https://www.ncei.noaa.gov/access/services/data/v1?dataset=StormEvents&startDate=${start}&endDate=${end}&format=application/json`
        );
        const data = await res.json();

        const mappedStorms = data
          .filter((s) => s.EVENT_TYPE !== "TORNADO")
          .map((s) => ({
            geometry: { coordinates: [parseFloat(s.EVENT_LON), parseFloat(s.EVENT_LAT)] },
            properties: {
              type: s.EVENT_TYPE,
              place: s.CZ_NAME || s.STATE,
              time: new Date(s.BEGIN_DATE_TIME).getTime(),
              severity: s.MAGNITUDE || s.DAMAGE_PROPERTY,
            },
          }));

        const mappedTornadoes = data
          .filter((s) => s.EVENT_TYPE === "TORNADO")
          .map((s) => ({
            geometry: { coordinates: [parseFloat(s.EVENT_LON), parseFloat(s.EVENT_LAT)] },
            properties: {
              type: s.EVENT_TYPE,
              place: s.CZ_NAME || s.STATE,
              time: new Date(s.BEGIN_DATE_TIME).getTime(),
              severity: s.MAGNITUDE || s.DAMAGE_PROPERTY,
            },
          }));

        setStorms(mappedStorms);
        setTornadoes(mappedTornadoes);
      } catch (err) {
        console.error(err);
      }
    };

    const simulateFutureEarthquakes = () => {
      const seismicZones = [
        { name: "Ring of Fire", latRange: [-60, 60], lngRange: [100, -70], weight: 0.7 },
        { name: "Mid-Atlantic Ridge", latRange: [-60, 60], lngRange: [-40, 20], weight: 0.15 },
        { name: "Other Zones", latRange: [-90, 90], lngRange: [-180, 180], weight: 0.15 },
      ];
      const weightedRandomZone = (zones) => {
        const r = Math.random();
        let cumulative = 0;
        for (const zone of zones) {
          cumulative += zone.weight;
          if (r <= cumulative) return zone;
        }
        return zones[zones.length - 1];
      };
      const generateMagnitude = () => (5 + (8 - 5) * Math.pow(Math.random(), 2)).toFixed(1);
      const count = Math.floor(Math.random() * 6) + 5;
      const simulated = Array.from({ length: count }, () => {
        const zone = weightedRandomZone(seismicZones);
        const lat = zone.latRange[0] + Math.random() * (zone.latRange[1] - zone.latRange[0]);
        const lng = zone.lngRange[0] + Math.random() * (zone.lngRange[1] - zone.lngRange[0]);
        return {
          geometry: { coordinates: [lng, lat] },
          properties: { mag: generateMagnitude(), place: `Expected earthquake in ${zone.name}`, time: selected.getTime() },
        };
      });
      setEarthquakes(simulated);
    };

    const simulateFutureStorms = () => {
      const stormZones = [
        { name: "Tornado Alley", latRange: [36, 40], lngRange: [-100, -95], weight: 0.5 },
        { name: "Great Plains", latRange: [39, 42], lngRange: [-98, -93], weight: 0.3 },
        { name: "Southeast USA", latRange: [30, 35], lngRange: [-85, -80], weight: 0.2 },
      ];
      const weightedRandomZone = (zones) => {
        const r = Math.random();
        let cumulative = 0;
        for (const zone of zones) {
          cumulative += zone.weight;
          if (r <= cumulative) return zone;
        }
        return zones[zones.length - 1];
      };
      const count = Math.floor(Math.random() * 6) + 5;
      const simulated = Array.from({ length: count }, () => {
        const zone = weightedRandomZone(stormZones);
        const lat = zone.latRange[0] + Math.random() * (zone.latRange[1] - zone.latRange[0]);
        const lng = zone.lngRange[0] + Math.random() * (zone.lngRange[1] - zone.lngRange[0]);
        const type = Math.random() < 0.5 ? "Tornado" : "Storm";
        return {
          geometry: { coordinates: [lng, lat] },
          properties: { type, place: `Expected ${type} in ${zone.name}`, time: selected.getTime(), severity: (Math.random() * 3 + 1).toFixed(1) },
        };
      });
      setStorms(simulated.filter((s) => s.properties.type === "Storm"));
      setTornadoes(simulated.filter((s) => s.properties.type === "Tornado"));
    };

    if (selected <= today) {
      fetchPastEarthquakes();
      fetchPastStorms();
    } else {
      simulateFutureEarthquakes();
      simulateFutureStorms();
    }
  }, [selectedDate]);

  return (
    <div className="map-container-wrapper">
      <div className="date-picker">
        <label htmlFor="date">Select Date: </label>
        <input
          type="date"
          id="date"
          value={selectedDate}
          min={todayString}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      <MapContainer center={[0, 0]} zoom={2} style={{ height: "600px", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        <FlyToUserLocation setUserLocation={setUserLocation} />
        <MapLegend />

        {/* Marker for user location */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>Your Location</Popup>
          </Marker>
        )}

        {earthquakes.map((eq, idx) => (
          <CircleMarker key={`eq-${idx}`} center={[eq.geometry.coordinates[1], eq.geometry.coordinates[0]]} radius={8} color={hazardColors.earthquake} fillColor={hazardColors.earthquake} fillOpacity={0.7}>
            <Popup>
              <b>{eq.properties.place}</b><br />
              Magnitude: {eq.properties.mag}<br />
              Date: {new Date(eq.properties.time).toLocaleDateString()}
            </Popup>
          </CircleMarker>
        ))}

        {storms.map((storm, idx) => (
          <CircleMarker key={`storm-${idx}`} center={[storm.geometry.coordinates[1], storm.geometry.coordinates[0]]} radius={8} color={hazardColors.storm} fillColor={hazardColors.storm} fillOpacity={0.7}>
            <Popup>
              <b>{storm.properties.place}</b><br />
              Type: {storm.properties.type}<br />
              Severity: {storm.properties.severity}<br />
              Date: {new Date(storm.properties.time).toLocaleDateString()}
            </Popup>
          </CircleMarker>
        ))}

        {tornadoes.map((t, idx) => (
          <CircleMarker key={`tornado-${idx}`} center={[t.geometry.coordinates[1], t.geometry.coordinates[0]]} radius={8} color={hazardColors.tornado} fillColor={hazardColors.tornado} fillOpacity={0.7}>
            <Popup>
              <b>{t.properties.place}</b><br />
              Type: {t.properties.type}<br />
              Severity: {t.properties.severity}<br />
              Date: {new Date(t.properties.time).toLocaleDateString()}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default HazardsMap;
