import React, { useState, useEffect } from "react";
import MapComponent from "../../components/Map/Map";
import sports, { checkSportSuitability } from "../../data/sports";
import { useLocation } from "../../context/LocationContext";
import "./Sports.css";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

const Sports = () => {
  const { coordinates, date: contextDate, setDate } = useLocation();

  // Default to today's date if contextDate is null
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // Max date = 16 days from today
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 16);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  // Ensure date stays within range
  const safeDate = contextDate
    ? contextDate < todayStr
      ? todayStr
      : contextDate > maxDateStr
      ? maxDateStr
      : contextDate
    : todayStr;

  const [selectedSport, setSelectedSport] = useState(null);
  const [weather, setWeather] = useState(null);
  const [suitability, setSuitability] = useState(null);

  const selectedDate = safeDate;

  // Fetch weather for selected date
  useEffect(() => {
    if (!coordinates || !selectedDate) return;

    const fetchWeather = async () => {
      try {
        const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${coordinates.lat}&lon=${coordinates.lng}&key=${API_KEY}&days=16`;
        const res = await fetch(url);
        const data = await res.json();

        if (data?.data) {
          const normalizedDate = new Date(selectedDate).toISOString().split("T")[0];
          const day = data.data.find(d => d.valid_date === normalizedDate);

          if (day) {
            setWeather({
              temp: day.temp ?? 0,
              wind_speed: day.wind_spd ?? 0,
              humidity: day.rh ?? 0,
              precip: day.precip ?? 0,
              uv: day.uv ?? 0,
              clouds: day.clouds ?? 0,
              snow: day.snow ?? 0,
              solar_radiation: day.solar_rad ?? 0,
            });
          } else {
            setWeather(null);
          }
        }
      } catch (err) {
        console.error("Error fetching weather:", err);
        setWeather(null);
      }
    };

    fetchWeather();
  }, [coordinates, selectedDate]);

  // Update suitability
  useEffect(() => {
    if (selectedSport && weather) {
      setSuitability(checkSportSuitability(selectedSport, weather));
    } else {
      setSuitability(null);
    }
  }, [selectedSport, weather]);

  return (
    <div className="sports-page">
      {/* Map */}
      <div className="map-section">
        <MapComponent />
      </div>
<div className="sports-wrapper">
      {/* Controls */}
      <div className="controls-section">
        {/* Sport Selector */}
        <div className="selector-group">
          <h2>Select Sport</h2>
          <select
            value={selectedSport?.name || ""}
            onChange={(e) =>
              setSelectedSport(sports.find((s) => s.name === e.target.value))
            }
          >
            <option value="">-- Choose a sport --</option>
            {sports.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Picker */}
        <div className="date-group">
          <h2>Select Date</h2>
          <input
            type="date"
            value={selectedDate}
            min={todayStr}
            max={maxDateStr}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      {/* Weather Info */}
      {weather ? (
        <div className="weather-display">
          <h3>Weather Forecast for {selectedDate}</h3>
          <div className="weather-cards">
            <div>🌡️ Temp: {weather.temp}°C</div>
            <div>💨 Wind: {weather.wind_speed} m/s</div>
            <div>💧 Humidity: {weather.humidity}%</div>
            <div>🌧️ Precipitation: {weather.precip} mm</div>
            <div>☀️ UV Index: {weather.uv}</div>
            <div>☁️ Cloud Cover: {weather.clouds}%</div>
            <div>❄️ Snow: {weather.snow} mm</div>
            <div>🔆 Solar Radiation: {weather.solar_radiation} W/m²</div>
          </div>
        </div>
      ) : (
        <p>No forecast available for this date.</p>
      )}

      {/* Suitability */}
      {suitability && (
        <div className={`suitability ${suitability.suitable ? "good" : "bad"}`}>
          <h3>
            {suitability.suitable
              ? suitability.message
              : "Unsuitable Weather Conditions:"}
          </h3>
          {!suitability.suitable && (
            <ul>
              <li>{suitability.message}</li>
            </ul>
          )}
        </div>
      )}</div>
    </div>
  );
};

export default Sports;
