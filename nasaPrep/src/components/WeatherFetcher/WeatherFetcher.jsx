import React, { useState, useEffect } from "react";
import { useLocation } from "../../context/LocationContext";
import "./WeatherFetcher.css";

const WEATHERBIT_API_KEY = "bb57d1f689344007928f462271385afc";

function WeatherFetcher() {
  // Default to today's date
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);

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

  // NASA POWER parameter mapping
  const nasaParams = {
    temp: "T2M",
    temp_max: "T2M_MAX",
    temp_min: "T2M_MIN",
    wind_speed: "WS2M",
    humidity: "RH2M",
    solar_radiation: "ALLSKY_SRFHI"
  };

  const fetchNASAData = async (selectedDate) => {
    const formattedDate = selectedDate.replace(/-/g, "");
    const variables = displayOrder.map((key) => nasaParams[key]).join(",");

    const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=${variables}&community=RE&longitude=${coordinates.lng}&latitude=${coordinates.lat}&start=${formattedDate}&end=${formattedDate}&format=JSON`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`NASA API error: ${res.status}`);
    }

    const json = await res.json();
    const parameters = json?.properties?.parameter;

    if (!parameters || Object.keys(parameters).length === 0) {
      throw new Error("No NASA data available for this date");
    }

    const result = {};
    displayOrder.forEach((key) => {
      const nasaKey = nasaParams[key];
      result[key] = parameters[nasaKey]
        ? Object.values(parameters[nasaKey])
        : null; // store null if no data
    });

    return result;
  };

  const fetchWeatherbitData = async (selectedDate) => {
    const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${coordinates.lat}&lon=${coordinates.lng}&key=${WEATHERBIT_API_KEY}&days=16`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weatherbit API error: ${res.status}`);

    const json = await res.json();
    const targetTime = new Date(selectedDate).getTime() / 1000;

    let closestDay = json.data.reduce((prev, curr) => {
      return Math.abs(curr.ts - targetTime) < Math.abs(prev.ts - targetTime)
        ? curr
        : prev;
    });

    return {
      temp: closestDay.temp != null ? [closestDay.temp] : null,
      temp_max: closestDay.max_temp != null ? [closestDay.max_temp] : null,
      temp_min: closestDay.min_temp != null ? [closestDay.min_temp] : null,
      wind_speed: closestDay.wind_spd != null ? [closestDay.wind_spd] : null,
      humidity: closestDay.rh != null ? [closestDay.rh] : null,
      solar_radiation: closestDay.solar_rad != null ? [closestDay.solar_rad] : null
    };
  };

  const fetchData = async (selectedDate) => {
    if (!coordinates?.lat || !coordinates?.lng || !selectedDate) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const isFuture = selectedDate > maxAllowed;
      let result;

      if (!isFuture) {
        try {
          result = await fetchNASAData(selectedDate);
        } catch (nasaErr) {
          console.warn("NASA failed, falling back to Weatherbit:", nasaErr.message);
          result = await fetchWeatherbitData(selectedDate);
        }
      } else {
        result = await fetchWeatherbitData(selectedDate);
      }

      setData(result);
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
          *Dates ≤ 27 Sep 2025 try NASA POWER (fallback to Weatherbit if no data); future dates use Weatherbit forecast.
        </small>
      </div>

      {loading && <p className="loading-text">Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      {data && !error && (
        <div className="weather-data-container">
          {displayOrder.map((key) =>
            data[key] && data[key].length ? (
              <div key={key} className="weather-variable">
                <h3 className="variable-label">{variableLabels[key] || key}</h3>
                <p className="variable-value">{data[key].join(", ")}</p>
              </div>
            ) : null // hide if no data
          )}
        </div>
      )}
    </div>
  );
}

export default WeatherFetcher;
