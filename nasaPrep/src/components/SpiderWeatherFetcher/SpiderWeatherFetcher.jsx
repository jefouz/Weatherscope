import React, { useState, useEffect, useRef } from "react";
import "./SpiderWeatherFetcher.css";
import { useLocation } from "../../context/LocationContext";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { jsPDF } from "jspdf";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  Title
);

const WEATHERBIT_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

function SpiderWeatherFetcher() {
  const { coordinates, date, setDate } = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const radarRef = useRef();

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
    setLoading(true);
    setError(null);
    setData(null);

    try {
      let result;
      const isFuture = selectedDate > maxAllowed;

      if (!isFuture) {
        try {
          result = await fetchNASAData(selectedDate);
        } catch {
          result = await fetchWeatherbitData(selectedDate);
        }
      } else {
        result = await fetchWeatherbitData(selectedDate);
      }

      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (date && coordinates?.lat && coordinates?.lng) {
      fetchData(date);
    }
  }, [coordinates, date]);

  const validKeys = data
    ? displayOrder.filter((key) => data[key] && data[key].length && data[key][0] != null)
    : [];

  const radarData = data
    ? {
        labels: validKeys.map((key) => variableLabels[key]),
        datasets: [
          {
            label: `Weather on ${date}`,
            data: validKeys.map((key) => data[key][0]),
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderColor: "rgb(54, 162, 235)",
            pointBackgroundColor: "rgb(54, 162, 235)",
            borderWidth: 2,
          },
        ],
      }
    : null;

  // --- Export functions ---
  const exportJSON = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `weather_${date}.json`;
    link.click();
  };

  const exportCSV = () => {
    if (!data) return;
    const headers = validKeys.map((key) => variableLabels[key]);
    const values = validKeys.map((key) => data[key][0]);
    const csvContent = [headers.join(","), values.join(",")].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `weather_${date}.csv`;
    link.click();
  };

  const exportPDF = async () => {
    if (!data || !radarRef.current) return;
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`Weather Data for ${date}`, 10, 10);

    let y = 20;
    validKeys.forEach((key) => {
      doc.text(`${variableLabels[key]}: ${data[key][0]}`, 10, y);
      y += 10;
    });

    // Add radar chart as image
    const chartCanvas = radarRef.current.firstChild; // Chart.js renders canvas as firstChild
    const chartImage = chartCanvas.toDataURL("image/png", 1.0);
    doc.addImage(chartImage, "PNG", 10, y, 180, 100); // position & size

    doc.save(`weather_${date}.pdf`);
  };

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
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      {radarData && !error && (
        <div ref={radarRef} className="radar-chart-container">
          <Radar data={radarData} options={{ responsive: true }} />
        </div>
      )}

      {data && (
        <div className="export-buttons" style={{ textAlign: "center", marginTop: "20px" }}>
          <button style={{margin:"20px"}} className="btn" onClick={exportJSON}>Export JSON</button>
          <button style={{margin:"20px"}} className="btn" onClick={exportCSV}>Export CSV</button>
          <button style={{margin:"20px"}} className="btn" onClick={exportPDF}>Export PDF</button>
        </div>
      )}
    </div>
  );
}

export default SpiderWeatherFetcher;
