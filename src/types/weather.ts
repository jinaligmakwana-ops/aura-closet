export interface WeatherData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  temperature: number; // Celsius
  apparentTemperature: number;
  humidity: number;
  precipitation: number;
  weatherCode: number;
  condition: string;
  description: string;
  icon: string;
  isDay: boolean;
  windSpeed: number;
  tempMax: number;
  tempMin: number;
  precipitationProbability: number;
  recommendation: string;
}

export interface CitySearchResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string; // state/region
}

export type TempUnit = 'C' | 'F';
