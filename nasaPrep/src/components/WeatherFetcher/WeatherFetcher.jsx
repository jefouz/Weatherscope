import React, { useState, useEffect } from "react";
import { useLocation } from "../../context/LocationContext";
import "./WeatherFetcher.css";

const WEATHERBIT_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

function WeatherFetcher() {
  const { coordinates, date, setDate } = useLocation(); // Get date from context
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const maxAllowed = "2025-09-27";

  const variableLabels = {
    temp: "Temperature (°C)",
    temp_max: "Max Temperature (°C)",
    temp_min: "Min Temperature (°C)",
    wind_speed: "Wind Speed (m/s)",
    humidity: "Relative Humidity (%)",
    solar_radiation: "Solar Radiation (W/m²)",
  };

  const displayOrder = [
    "temp",
    "temp_max",
    "temp_min",
    "wind_speed",
    "humidity",
    "solar_radiation",
  ];

  const nasaParams = {
    temp: "T2M",
    temp_max: "T2M_MAX",
    temp_min: "T2M_MIN",
    wind_speed: "WS2M",
    humidity: "RH2M",
    solar_radiation: "ALLSKY_SFC_SW_DWN",
  };

  const fetchNASAData = async (selectedDate) => {
    if (!coordinates?.lat || !coordinates?.lng) {
      throw new Error("Invalid coordinates for NASA POWER API");
    }

    const formattedDate = selectedDate.replace(/-/g, "");
    const variables = displayOrder.map((key) => nasaParams[key]).join(",");

    const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=${variables}&community=RE&longitude=${coordinates.lng}&latitude=${coordinates.lat}&start=${formattedDate}&end=${formattedDate}&format=JSON`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`NASA API error: ${res.status}`);

    const json = await res.json();
    const parameters = json?.properties?.parameter;

    if (!parameters || Object.keys(parameters).length === 0)
      throw new Error("No NASA data available for this date");

    const result = {};
    displayOrder.forEach((key) => {
      const nasaKey = nasaParams[key];
      const values = parameters[nasaKey] ? Object.values(parameters[nasaKey]) : null;
      result[key] = values && values.length > 0 ? values : null;
    });

    return result;
  };

  const fetchWeatherbitData = async (selectedDate) => {
    if (!coordinates?.lat || !coordinates?.lng) {
      throw new Error("Invalid coordinates for Weatherbit API");
    }

    const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${coordinates.lat}&lon=${coordinates.lng}&key=${WEATHERBIT_API_KEY}&days=16`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weatherbit API error: ${res.status}`);

    const json = await res.json();
    const targetTime = new Date(selectedDate).getTime() / 1000;

    const closestDay = json.data.reduce((prev, curr) =>
      Math.abs(curr.ts - targetTime) < Math.abs(prev.ts - targetTime) ? curr : prev
    );

    return {
      temp: closestDay.temp != null ? [closestDay.temp] : null,
      temp_max: closestDay.max_temp != null ? [closestDay.max_temp] : null,
      temp_min: closestDay.min_temp != null ? [closestDay.min_temp] : null,
      wind_speed: closestDay.wind_spd != null ? [closestDay.wind_spd] : null,
      humidity: closestDay.rh != null ? [closestDay.rh] : null,
      solar_radiation: closestDay.solar_rad != null ? [closestDay.solar_rad] : null,
    };
  };

  const fetchData = async (selectedDate) => {
    if (!selectedDate || !coordinates?.lat || !coordinates?.lng) {
      setError("Invalid date or coordinates");
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      let result;
      const isFuture = selectedDate > maxAllowed;

      if (!isFuture) {
        try {
          result = await fetchNASAData(selectedDate);
        } catch (nasaErr) {
          console.warn("NASA POWER failed, falling back to Weatherbit:", nasaErr.message);
          result = await fetchWeatherbitData(selectedDate);
        }
      } else {
        result = await fetchWeatherbitData(selectedDate);
      }

      setData(result);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (date && coordinates?.lat != null && coordinates?.lng != null) {
      fetchData(date);
    }
  }, [coordinates, date]);

  return (
    <div className="weather-fetcher-wrapper">
      <div className="date-input-container">
        <label htmlFor="weather-date">Select Date: </label>
        <input
          type="date"
          id="weather-date"
          value={date}
          onChange={(e) => setDate(e.target.value)} // update context date
        />
        <small>
          *Dates ≤ 27 Sep 2025 try NASA POWER (fallback to Weatherbit if no data);
          future dates use Weatherbit forecast.
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
            ) : null
          )}
        </div>
      )}
    </div>
  );
}

export default WeatherFetcher;
