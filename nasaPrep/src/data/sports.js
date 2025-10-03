// src/data/sports.js
const sports = [
  {
    name: "Football",
    conditions: {
      minTemp: 5,
      maxTemp: 35,
      maxWind: 10,
      maxHumidity: 85,
      maxPrecip: 5,
    },
    reason: {
      tooCold: "Too cold for safe play.",
      tooHot: "Too hot, risk of heatstroke.",
      tooWindy: "Too windy, unsafe conditions.",
      tooHumid: "Humidity is too high, exhausting for players.",
      tooRainy: "Pitch too wet/slippery due to rain.",
    },
  },
  {
    name: "Tennis",
    conditions: {
      minTemp: 10,
      maxTemp: 32,
      maxWind: 7,
      maxHumidity: 80,
      maxPrecip: 2,
      maxUV: 8,
    },
    reason: {
      tooCold: "Tennis requires warmer temperatures.",
      tooHot: "Court may become dangerously hot.",
      tooWindy: "Wind affects ball trajectory.",
      tooHumid: "High humidity reduces performance.",
      tooRainy: "Rain makes courts slippery and unplayable.",
      tooSunny: "UV index too high, risk of sunburn.",
    },
  },
  {
    name: "Skiing",
    conditions: {
      minTemp: -15,
      maxTemp: 5,
      maxWind: 15,
      minSnow: 10, // at least 10 mm fresh snow
    },
    reason: {
      tooWarm: "Snow may melt, unsafe skiing.",
      tooCold: "Extremely cold for skiing.",
      tooWindy: "Strong winds make skiing dangerous.",
      notEnoughSnow: "Not enough snow to ski safely.",
    },
  },
  {
    name: "Running",
    conditions: {
      minTemp: 0,
      maxTemp: 30,
      maxHumidity: 85,
      maxUV: 9,
      maxPrecip: 3,
    },
    reason: {
      tooCold: "Too cold for a safe run.",
      tooHot: "Heatstroke risk while running.",
      tooHumid: "Humidity too high, exhausting run.",
      tooSunny: "UV index too high, unsafe without protection.",
      tooRainy: "Rain makes running slippery and unsafe.",
    },
  },
  {
    name: "Cycling",
    conditions: {
      minTemp: 5,
      maxTemp: 35,
      maxWind: 12,
      maxPrecip: 3,
      maxUV: 10,
    },
    reason: {
      tooCold: "Too cold for cycling.",
      tooHot: "Risk of heatstroke.",
      tooWindy: "Strong winds make cycling unsafe.",
      tooRainy: "Slippery roads, not safe for cycling.",
      tooSunny: "UV index too high for cycling without protection.",
    },
  },
  {
    name: "Swimming (Outdoor)",
    conditions: {
      minTemp: 20,
      maxTemp: 38,
      maxWind: 8,
      maxPrecip: 2,
      maxUV: 11,
    },
    reason: {
      tooCold: "Too cold for outdoor swimming.",
      tooHot: "Dangerous heat for swimming outdoors.",
      tooWindy: "Wind makes swimming unsafe.",
      tooRainy: "Rain makes swimming unpleasant.",
      tooSunny: "UV index dangerously high.",
    },
  },
  {
    name: "Hiking",
    conditions: {
      minTemp: 5,
      maxTemp: 30,
      maxWind: 10,
      maxHumidity: 85,
      maxPrecip: 5,
      maxUV: 9,
      maxClouds: 95, // avoid heavy overcast
    },
    reason: {
      tooCold: "Too cold for a comfortable hike.",
      tooHot: "Too hot, risk of heatstroke during hiking.",
      tooWindy: "High winds make hiking dangerous in exposed areas.",
      tooHumid: "High humidity makes hiking exhausting.",
      tooRainy: "Trails unsafe or muddy due to rain.",
      tooSunny: "UV index too high, risk of sunburn.",
      tooCloudy: "Visibility may be poor for hiking.",
    },
  },
  {
  name: "Basketball (Outdoor)",
  conditions: {
    minTemp: 10,       // °C
    maxTemp: 35,
    maxWind: 8,        // m/s
    maxHumidity: 80,   // %
    maxPrecip: 2,      // mm
    maxUV: 9,          // UV index
  },
  reason: {
    tooCold: "Too cold for outdoor basketball.",
    tooHot: "Too hot, risk of heatstroke or dehydration.",
    tooWindy: "Wind affects ball control and trajectory.",
    tooHumid: "Humidity too high, exhausting to play.",
    tooRainy: "Court slippery and unsafe due to rain.",
    tooSunny: "UV index too high, risk of sunburn.",
  }
}

];

export function checkSportSuitability(sport, weather) {
  const {
    temp,
    wind_speed,
    humidity,
    precip,
    uv,
    snow,
    clouds,
    solar_radiation,
  } = weather;

  const {
    minTemp,
    maxTemp,
    maxWind,
    maxHumidity,
    maxPrecip,
    maxUV,
    minSnow,
    maxClouds,
  } = sport.conditions;

  const { reason } = sport;

  const messages = [];

  if (minTemp !== undefined && temp < minTemp)
    messages.push(reason.tooCold);
  if (maxTemp !== undefined && temp > maxTemp)
    messages.push(reason.tooHot || reason.tooWarm);
  if (maxWind !== undefined && wind_speed > maxWind)
    messages.push(reason.tooWindy);
  if (maxHumidity !== undefined && humidity > maxHumidity)
    messages.push(reason.tooHumid);
  if (maxPrecip !== undefined && precip > maxPrecip)
    messages.push(reason.tooRainy);
  if (maxUV !== undefined && uv > maxUV)
    messages.push(reason.tooSunny);
  if (minSnow !== undefined && (!snow || snow < minSnow))
    messages.push(reason.notEnoughSnow);
  if (maxClouds !== undefined && clouds > maxClouds)
    messages.push(reason.tooCloudy);

  if (messages.length > 0) {
    return { suitable: false, message: messages.join(" AND ") };
  }

  return { suitable: true, message: "Great weather for " + sport.name + "!" };
}

export default sports;
