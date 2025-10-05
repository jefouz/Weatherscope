import { useState, useRef, useEffect } from "react";
import { addDays, nextDay } from "date-fns";
import "./Chatbot.css";
import { geocodeCity, fetchWeatherbitData, fetchWeatherbitNextWeek } from "../../components/weatherAPI";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! Ask me about the weather anywhere. Examples: 'Weather in Paris tomorrow', 'Weather in Tokyo last Monday', or 'Weather in New York next week'." }
  ]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const weatherbitApiKey = import.meta.env.VITE_WEATHER_API_KEY;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ------------------- Date Parsing -------------------
  const parseDateFromText = (text) => {
    text = text.toLowerCase();
    const today = new Date();
    const weekdays = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];

    if (/today/i.test(text)) return today;
    if (/tomorrow|tommorow|tomorow/i.test(text)) return addDays(today, 1);
    if (/yesterday/i.test(text)) return addDays(today, -1);

    // Check for "next <weekday>" or "last <weekday>"
    for (let i = 0; i < weekdays.length; i++) {
      const weekday = weekdays[i];
      if (text.includes(`next ${weekday}`)) return nextDay(addDays(today, 7), i);
      if (text.includes(`last ${weekday}`)) return nextDay(addDays(today, -7), i);
      if (text.includes(weekday)) return nextDay(today, i);
    }

    // Detect "next week" or "last week" anywhere in text
    if (/next week/i.test(text)) return "nextWeek";
    if (/last week/i.test(text)) return "lastWeek";

    return today; // fallback
  };

  // ------------------- City Extraction -------------------
  const extractCity = (text) => {
    let city = text.toLowerCase();
    const dateWords = [
      "today","tomorrow","tommorow","tomorow","yesterday",
      "monday","tuesday","wednesday","thursday","friday","saturday","sunday",
      "next","last","week"
    ];
    dateWords.forEach(word => {
      city = city.replace(new RegExp(`\\b${word}\\b`, "gi"), "");
    });
    city = city.replace(/weather in|historical weather in/gi, "");
    return city.trim();
  };

  // ------------------- Send Handler -------------------
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages(prev => [...prev, userMessage]);

    const text = input.toLowerCase();

    // ------------------------- Handle greetings -------------------------
    if (/^hi$|^hello$|^hey$/i.test(text)) {
      setMessages(prev => [...prev, { sender: "bot", text: "Hello! Ask me about the weather anywhere with a date." }]);
      setInput("");
      return;
    }

    if (/help/i.test(text)) {
      setMessages(prev => [...prev, { sender: "bot", text: "You can ask: 'Weather in City today', 'Weather in City tomorrow', 'Weather in City next Monday', or 'Weather in City next week'." }]);
      setInput("");
      return;
    }

    // ------------------------- Weather query -------------------------
    const dateOrWeek = parseDateFromText(text);
    const city = extractCity(text);

    if (!city) {
      setMessages(prev => [...prev, { sender: "bot", text: "Please specify a valid city or country." }]);
      setInput("");
      return;
    }

    const coords = await geocodeCity(city);

    // Strict validation
    if (!coords || !coords.lat || !coords.lon) {
      setMessages(prev => [...prev, { sender: "bot", text: `Sorry, I couldn't find a valid city or country named "${city}".` }]);
      setInput("");
      return;
    }

    // ------------------------- Next week vs single day -------------------------
    if (dateOrWeek === "nextWeek" || dateOrWeek === "lastWeek") {
      const dailyMessages = await fetchWeatherbitNextWeek(coords.lat, coords.lon, weatherbitApiKey, coords.name);
      dailyMessages.forEach(msg => setMessages(prev => [...prev, { sender: "bot", text: msg }]));
    } else {
      const botText = await fetchWeatherbitData(coords.lat, coords.lon, weatherbitApiKey, dateOrWeek, coords.name);
      setMessages(prev => [...prev, { sender: "bot", text: botText }]);
    }

    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="chatbot-wrapper">
      {!open && <button className="chatbot-toggle" onClick={() => setOpen(true)}>💬</button>}

      {open && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <span>Weather Chatbot</span>
            <button className="chatbot-close" onClick={() => setOpen(false)}>✖</button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chatbot-message ${msg.sender === "user" ? "user" : "bot"}`}>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="chatbot-input-box">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="chatbot-input"
            />
            <button onClick={handleSend} className="chatbot-button">Send</button>
          </div>
        </div>
      )}
    </div>
  );
}
