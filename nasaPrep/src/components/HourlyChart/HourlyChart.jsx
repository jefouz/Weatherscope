import { useEffect, useState } from "react";
import { useLocation } from "../../context/LocationContext";
import { Line } from "react-chartjs-2";
import "./HourlyChart.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function HourlyChart() {
  const { coordinates, date } = useLocation();
  const [weatherData, setWeatherData] = useState([]);
  const maxHistoricalDate = "2025-09-27";

  useEffect(() => {
    if (!coordinates?.lat || !coordinates?.lng || !date) return;

    async function fetchWeather() {
      try {
        const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
        let dataArray = [];
        const isFuture = date > maxHistoricalDate;

        if (!isFuture) {
          // Historical hourly
          const startDate = date;
          const endDate = new Date(date);
          endDate.setDate(endDate.getDate() + 1);
          const endDateStr = endDate.toISOString().split("T")[0];

          const url = `https://api.weatherbit.io/v2.0/history/hourly?lat=${coordinates.lat}&lon=${coordinates.lng}&start_date=${startDate}&end_date=${endDateStr}&key=${API_KEY}`;
          const res = await fetch(url);
          const json = await res.json();

          if (json?.data) {
            dataArray = json.data.filter(
              (d) => d.timestamp_local.split("T")[0] === startDate
            );
          }
        } else {
          // Future forecast daily
          const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${coordinates.lat}&lon=${coordinates.lng}&key=${API_KEY}&days=16`;
          const res = await fetch(url);
          const json = await res.json();

          if (json?.data) {
            const targetTime = new Date(date).getTime() / 1000;
            const day = json.data.reduce((prev, curr) =>
              Math.abs(curr.ts - targetTime) < Math.abs(prev.ts - targetTime)
                ? curr
                : prev
            );

            const minTemp = day.min_temp;
            const maxTemp = day.max_temp;
            const humidity = day.rh;
            const wind = day.wind_spd;

            // Interpolate hourly temperature with sinusoidal curve
            dataArray = Array.from({ length: 24 }, (_, i) => {
              const temp =
                minTemp +
                (maxTemp - minTemp) * Math.sin((Math.PI * i) / 23); // smooth daily curve
              // Slight variation for humidity and wind speed
              const rh = humidity + Math.random() * 5 - 2.5;
              const wind_spd = wind + Math.random() * 1 - 0.5;

              return {
                temp: parseFloat(temp.toFixed(1)),
                rh: parseFloat(rh.toFixed(1)),
                wind_spd: parseFloat(wind_spd.toFixed(2)),
                timestamp_local: `${date}T${i.toString().padStart(2, "0")}:00:00`,
              };
            });
          }
        }

        setWeatherData(dataArray);
      } catch (err) {
        console.error("Error fetching weather:", err);
        setWeatherData([]);
      }
    }

    fetchWeather();
  }, [coordinates, date]);

  const chartData = {
    labels: weatherData.map((d) => d.timestamp_local.split("T")[1]),
    datasets: [
      {
        label: "Temperature (°C)",
        data: weatherData.map((d) => d.temp),
        borderColor: "rgb(255, 99, 132)",
        fill: false,
      },
      {
        label: "Humidity (%)",
        data: weatherData.map((d) => d.rh),
        borderColor: "rgb(54, 162, 235)",
        fill: false,
      },
      {
        label: "Wind Speed (m/s)",
        data: weatherData.map((d) => d.wind_spd),
        borderColor: "rgb(75, 192, 192)",
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: `Weather Data (Hourly) for ${date}` },
    },
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow">
      {weatherData.length > 0 ? (
        <Line data={chartData} options={options} />
      ) : (
        <p>Loading weather data...</p>
      )}
    </div>
  );
}
