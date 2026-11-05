import { WeatherData, CitySearchResult } from '../types/weather';

export function cToF(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

export function formatTemp(c: number, unit: 'C' | 'F'): string {
  if (unit === 'F') {
    return `${cToF(c)}°F`;
  }
  return `${Math.round(c)}°C`;
}

export function getWeatherConditionInfo(code: number, isDay: boolean = true): {
  condition: string;
  description: string;
  icon: string;
  isRainy: boolean;
  isSnowy: boolean;
} {
  // WMO Weather interpretation codes (WW)
  switch (code) {
    case 0:
      return {
        condition: 'Clear Sky',
        description: isDay ? 'Sunny and bright' : 'Clear starry night',
        icon: isDay ? 'Sun' : 'Moon',
        isRainy: false,
        isSnowy: false,
      };
    case 1:
      return {
        condition: 'Mainly Clear',
        description: 'Mostly clear with light clouds',
        icon: isDay ? 'SunDim' : 'Moon',
        isRainy: false,
        isSnowy: false,
      };
    case 2:
      return {
        condition: 'Partly Cloudy',
        description: 'Scattered clouds and pleasant',
        icon: 'CloudSun',
        isRainy: false,
        isSnowy: false,
      };
    case 3:
      return {
        condition: 'Overcast',
        description: 'Covered gray skies, low glare',
        icon: 'Cloud',
        isRainy: false,
        isSnowy: false,
      };
    case 45:
    case 48:
      return {
        condition: 'Foggy',
        description: 'Misty and damp atmosphere',
        icon: 'CloudFog',
        isRainy: false,
        isSnowy: false,
      };
    case 51:
    case 53:
    case 55:
      return {
        condition: 'Drizzle',
        description: 'Light misty drizzle, damp sidewalks',
        icon: 'CloudDrizzle',
        isRainy: true,
        isSnowy: false,
      };
    case 61:
    case 63:
    case 65:
      return {
        condition: 'Rain',
        description: 'Moderate to steady rainfall',
        icon: 'CloudRain',
        isRainy: true,
        isSnowy: false,
      };
    case 66:
    case 67:
      return {
        condition: 'Freezing Rain',
        description: 'Icy cold precipitation, slippery',
        icon: 'CloudRainWind',
        isRainy: true,
        isSnowy: true,
      };
    case 71:
    case 73:
    case 75:
    case 77:
      return {
        condition: 'Snow',
        description: 'Snowfall and freezing temperatures',
        icon: 'CloudSnow',
        isRainy: false,
        isSnowy: true,
      };
    case 80:
    case 81:
    case 82:
      return {
        condition: 'Showers',
        description: 'Passing rain showers throughout the day',
        icon: 'CloudRain',
        isRainy: true,
        isSnowy: false,
      };
    case 85:
    case 86:
      return {
        condition: 'Snow Showers',
        description: 'Cold winter snow flurries',
        icon: 'CloudSnow',
        isRainy: false,
        isSnowy: true,
      };
    case 95:
    case 96:
    case 99:
      return {
        condition: 'Thunderstorm',
        description: 'Thunderstorms and heavy downpour',
        icon: 'CloudLightning',
        isRainy: true,
        isSnowy: false,
      };
    default:
      return {
        condition: 'Pleasant',
        description: 'Moderate weather conditions',
        icon: 'CloudSun',
        isRainy: false,
        isSnowy: false,
      };
  }
}

export function generateWeatherStylistTip(temp: number, isRainy: boolean, windSpeed: number): string {
  if (isRainy) {
    if (temp < 10) {
      return "Cold & rainy day: Pair a warm wool coat with water-resistant boots and grab an umbrella.";
    } else if (temp < 18) {
      return "Wet showers today: Opt for a trench coat or water-repellent jacket over comfy layers.";
    } else {
      return "Warm but rainy: Wear breathable lightweight layers and bring an umbrella or rain hat.";
    }
  }

  if (temp >= 26) {
    return "Hot & sunny: Embrace light linens, cotton tees, sunglasses, and open sandals or breathable sneakers.";
  } else if (temp >= 20) {
    return "Warm & delightful: Perfect for relaxed shirts, light trousers or skirts, and your favorite everyday shoes.";
  } else if (temp >= 15) {
    if (windSpeed > 20) {
      return "Breezy & mild: A stylish denim jacket or trench coat over a classic top will keep wind chills away.";
    }
    return "Crisp & comfortable: Ideal for layering a light sweater or cardigan over a tee with trousers.";
  } else if (temp >= 8) {
    return "Chilly day: Wrap up in a cozy knit sweater, structured coat or leather jacket, and sturdy ankle boots.";
  } else if (temp >= 0) {
    return "Cold winter air: Bundle up with a heavy wool coat or puffer, warm thermal knit, scarf, and boots.";
  } else {
    return "Freezing weather: Full cold-weather armor required! Heavy insulated outerwear, beanies, and warm boots.";
  }
}

export async function fetchWeather(lat: number, lon: number, cityName?: string, countryName?: string): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Weather fetch failed: ${res.statusText}`);
  }

  const data = await res.json();
  const current = data.current;
  const daily = data.daily;

  const weatherCode = current.weather_code ?? 0;
  const isDay = current.is_day === 1;
  const conditionInfo = getWeatherConditionInfo(weatherCode, isDay);

  let city = cityName || 'My Location';
  let country = countryName || '';

  // If cityName wasn't passed, do a quick reverse geocode if possible
  if (!cityName) {
    try {
      const geoRes = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      );
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        city = geoData.city || geoData.locality || geoData.principalSubdivision || 'Current Location';
        country = geoData.countryCode || geoData.countryName || '';
      }
    } catch {
      // Ignore geocoding failure, fallback is fine
    }
  }

  const temp = current.temperature_2m;
  const isRainy = conditionInfo.isRainy || (daily.precipitation_probability_max?.[0] > 50);
  const windSpeed = current.wind_speed_10m ?? 0;

  return {
    city,
    country,
    latitude: lat,
    longitude: lon,
    temperature: temp,
    apparentTemperature: current.apparent_temperature ?? temp,
    humidity: current.relative_humidity_2m ?? 50,
    precipitation: current.precipitation ?? 0,
    weatherCode,
    condition: conditionInfo.condition,
    description: conditionInfo.description,
    icon: conditionInfo.icon,
    isDay,
    windSpeed,
    tempMax: daily.temperature_2m_max?.[0] ?? temp,
    tempMin: daily.temperature_2m_min?.[0] ?? temp,
    precipitationProbability: daily.precipitation_probability_max?.[0] ?? 0,
    recommendation: generateWeatherStylistTip(temp, isRainy, windSpeed),
  };
}

export async function searchCities(query: string): Promise<CitySearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query.trim()
  )}&count=6&language=en&format=json`;

  const res = await fetch(url);
  if (!res.ok) return [];

  const data = await res.json();
  if (!data.results) return [];

  return data.results.map((item: any) => ({
    id: item.id,
    name: item.name,
    latitude: item.latitude,
    longitude: item.longitude,
    country: item.country,
    admin1: item.admin1,
  }));
}

export async function fetchWeatherByCoords(
  lat: number,
  lon: number,
  cityName?: string,
  countryName?: string
): Promise<WeatherData> {
  return fetchWeather(lat, lon, cityName, countryName);
}

export async function fetchWeatherByCityName(cityName: string): Promise<WeatherData> {
  const searchResults = await searchCities(cityName);
  if (searchResults.length > 0) {
    const first = searchResults[0];
    return fetchWeather(first.latitude, first.longitude, first.name, first.country);
  }
  // Default fallback to London
  return fetchWeather(51.5074, -0.1278, 'London', 'United Kingdom');
}

export async function getCurrentLocationWeather(): Promise<WeatherData> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const data = await fetchWeather(pos.coords.latitude, pos.coords.longitude);
          resolve(data);
        } catch (e) {
          reject(e);
        }
      },
      (err) => reject(err),
      { timeout: 8000 }
    );
  });
}

