import { useEffect, useState } from "react";
import { useLocation } from "../../context/LocationContext";
import { Line } from "react-chartjs-2";
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

export default function DailyWeatherChart() {
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
          // Historical hourly -> aggregate daily average for 7 days
          const startDate = new Date(date);
          dataArray = [];

          for (let i = 0; i < 7; i++) {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            const startStr = d.toISOString().split("T")[0];
            const end = new Date(d);
            end.setDate(end.getDate() + 1);
            const endStr = end.toISOString().split("T")[0];

            const url = `https://api.weatherbit.io/v2.0/history/hourly?lat=${coordinates.lat}&lon=${coordinates.lng}&start_date=${startStr}&end_date=${endStr}&key=${API_KEY}`;
            const res = await fetch(url);
            const json = await res.json();

            if (json?.data?.length) {
              const temps = json.data.map((h) => h.temp);
              const rhs = json.data.map((h) => h.rh);
              const winds = json.data.map((h) => h.wind_spd);

              dataArray.push({
                date: startStr,
                temp: parseFloat((temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1)),
                rh: parseFloat((rhs.reduce((a, b) => a + b, 0) / rhs.length).toFixed(1)),
                wind_spd: parseFloat((winds.reduce((a, b) => a + b, 0) / winds.length).toFixed(1)),
              });
            }
          }
        } else {
          // Future forecast -> take 7 consecutive days
          const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${coordinates.lat}&lon=${coordinates.lng}&key=${API_KEY}&days=16`;
          const res = await fetch(url);
          const json = await res.json();

          if (json?.data) {
            const startTime = new Date(date).getTime();
            dataArray = json.data
              .filter((d) => {
                const dTime = new Date(d.valid_date).getTime();
                return dTime >= startTime;
              })
              .slice(0, 7)
              .map((d) => ({
                date: d.valid_date,
                temp: d.temp,
                rh: d.rh,
                wind_spd: d.wind_spd,
              }));
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
    labels: weatherData.map((d) => d.date),
    datasets: [
      {
        label: "Temperature (°C)",
        data: weatherData.map((d) => d.temp),
        borderColor: "rgb(255, 99, 132)",
        fill: false,
        tension: 0.3,
      },
      {
        label: "Humidity (%)",
        data: weatherData.map((d) => d.rh),
        borderColor: "rgb(54, 162, 235)",
        fill: false,
        tension: 0.3,
      },
      {
        label: "Wind Speed (m/s)",
        data: weatherData.map((d) => d.wind_spd),
        borderColor: "rgb(75, 192, 192)",
        fill: false,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: `7-Day Weather Forecast from ${date}` },
      tooltip: {
        callbacks: {
          label: function (context) {
            if (context.dataset.label === "Temperature (°C)")
              return `${context.parsed.y} °C`;
            if (context.dataset.label === "Humidity (%)")
              return `${context.parsed.y} %`;
            if (context.dataset.label === "Wind Speed (m/s)")
              return `${context.parsed.y} m/s`;
          },
        },
      },
    },
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow">
      {weatherData.length > 0 ? (
        <Line data={chartData} options={options} />
      ) : (
        <p>Loading 7-day weather data...</p>
      )}
    </div>
  );
}
