import React, { useState, useEffect } from "react";
import { useLocation } from "../../context/LocationContext";
import "./WeatherFetcher.css";

const WEATHERBIT_API_KEY = "bb57d1f689344007928f462271385afc";

function WeatherFetcher() {
  const [date, setDate] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { coordinates } = useLocation();

  const maxAllowed = "2025-09-27"; // NASA POWER limit

  const variableLabels = {
    temp: "Temperature (°C)",
    temp_max: "Max Temperature (°C)",
    temp_min: "Min Temperature (°C)",
    wind_speed: "Wind Speed (m/s)",
    humidity: "Relative Humidity (%)",
    solar_radiation: "Solar Radiation (W/m²)"
  };

  const displayOrder = [
    "temp",
    "temp_max",
    "temp_min",
    "wind_speed",
    "humidity",
    "solar_radiation"
  ];

  const fetchData = async (selectedDate) => {
    if (!coordinates?.lat || !coordinates?.lng || !selectedDate) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const isFuture = selectedDate > maxAllowed;

      if (!isFuture) {
        // NASA POWER daily (same as before)
        const formattedDate = selectedDate.replace(/-/g, "");
        const variables = displayOrder.join(",");
        const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=${variables}&community=AG&longitude=${coordinates.lng}&latitude=${coordinates.lat}&start=${formattedDate}&end=${formattedDate}&format=JSON`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const json = await res.json();
        const parameters = json?.properties?.parameter;
        const result = {};
        displayOrder.forEach((key) => {
          result[key] = parameters[key] ? Object.values(parameters[key]) : ["No data"];
        });
        setData(result);
      } else {
        // Weatherbit forecast for future dates
        const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${coordinates.lat}&lon=${coordinates.lng}&key=${WEATHERBIT_API_KEY}&days=7`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const json = await res.json();

        // Find matching forecast day
        const targetTime = new Date(selectedDate).getTime() / 1000; // UNIX seconds
        let closestDay = json.data.reduce((prev, curr) => {
          return Math.abs(curr.ts - targetTime) < Math.abs(prev.ts - targetTime) ? curr : prev;
        });

        const result = {
          temp: [closestDay.temp],
          temp_max: [closestDay.max_temp],
          temp_min: [closestDay.min_temp],
          wind_speed: [closestDay.wind_spd],
          humidity: [closestDay.rh],
          solar_radiation: [closestDay.solar_rad]
        };

        setData(result);
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (date) fetchData(date);
  }, [coordinates, date]);

  return (
    <div className="weather-fetcher-wrapper">
      <div className="date-input-container">
        <label htmlFor="weather-date">Select Date: </label>
        <input
          type="date"
          id="weather-date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <small>
          *Dates ≤ 27 Sep 2025 use NASA POWER; future dates use Weatherbit forecast.
        </small>
      </div>

      {loading && <p className="loading-text">Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      {data && !error && (
        <div className="weather-data-container">
          {displayOrder.map((key) => (
            <div key={key} className="weather-variable">
              <h3 className="variable-label">{variableLabels[key] || key}</h3>
              <p className="variable-value">{data[key]?.length ? data[key].join(", ") : "No data"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WeatherFetcher;
