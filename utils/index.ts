import { HKWorkoutActivityType } from "@kingstinct/react-native-healthkit";

export function addMinutesToDate(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const workoutType = (type: string) => {
  if (type === "running") {
    return HKWorkoutActivityType.running;
  } else if (type === "cycling") {
    return HKWorkoutActivityType.cycling;
  }
  return HKWorkoutActivityType.walking;
};

export const locations = [
  {
    latitude: 45.4215,
    longitude: -75.6972,
    altitude: 70.0,
    timestamp: new Date("2024-07-09T10:00:00Z").getTime(),
    speed: 10.5,
    speedAccuracy: 1.0,
    horizontalAccuracy: 5.0, // realistic value for horizontal accuracy in meters
    verticalAccuracy: 10.0, // realistic value for vertical accuracy in meters
    course: 45.0, // realistic value for course in degrees
  },
  {
    latitude: 45.4231,
    longitude: -75.6958,
    altitude: 72.5,
    timestamp: new Date("2024-07-09T10:05:00Z").getTime(),
    speed: 12.0,
    speedAccuracy: 0.8,
    horizontalAccuracy: 5.0,
    verticalAccuracy: 10.0,
    course: 50.0,
  },
  {
    latitude: 45.425,
    longitude: -75.6943,
    altitude: 75.0,
    timestamp: new Date("2024-07-09T10:10:00Z").getTime(),
    speed: 11.2,
    speedAccuracy: 1.2,
    horizontalAccuracy: 5.0,
    verticalAccuracy: 10.0,
    course: 55.0,
  },
  {
    latitude: 45.4268,
    longitude: -75.6929,
    altitude: 78.0,
    timestamp: new Date("2024-07-09T10:15:00Z").getTime(),
    speed: 13.5,
    speedAccuracy: 0.9,
    horizontalAccuracy: 5.0,
    verticalAccuracy: 10.0,
    course: 60.0,
  },
  {
    latitude: 45.4285,
    longitude: -75.6914,
    altitude: 80.5,
    timestamp: new Date("2024-07-09T10:20:00Z").getTime(),
    speed: 14.0,
    speedAccuracy: 0.7,
    horizontalAccuracy: 5.0,
    verticalAccuracy: 10.0,
    course: 65.0,
  },
];
