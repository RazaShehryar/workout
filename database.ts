import * as SQLite from "expo-sqlite/legacy";

const db = SQLite.openDatabase("workout.db");

export interface WorkoutData {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  energyBurned: number;
  energyBurnedUnit: string;
  distance: number;
  distanceUnit: string;
}

export const createTable = (): void => {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS workout (
        id TEXT PRIMARY KEY,
        type TEXT,
        startDate TEXT,
        endDate TEXT,
        energyBurned REAL,
        energyBurnedUnit TEXT,
        distance REAL,
        distanceUnit TEXT
      );`,
      [],
      () => {
        console.log("Table created successfully");
      },
      (error) => {
        console.log("Error creating table", error);
        return false;
      }
    );
  });
};

export const insertData = (data: WorkoutData, callback?: () => void): void => {
  const { id, type, startDate, endDate, energyBurned, energyBurnedUnit, distance, distanceUnit } = data;
  db.transaction((tx) => {
    tx.executeSql(
      "INSERT INTO workout (id, type, startDate, endDate, energyBurned, energyBurnedUnit, distance, distanceUnit) VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
      [id, type, startDate, endDate, energyBurned, energyBurnedUnit, distance, distanceUnit],
      () => {
        callback?.();
        console.log("Data inserted successfully");
      },
      (_, error) => {
        console.log("Error inserting data", error);
        return false;
      }
    );
  });
};

export const getLatestWorkout = (callback: (data: WorkoutData | null) => void): void => {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT * FROM workout ORDER BY startDate DESC LIMIT 1;",
      [],
      (_, { rows }) => {
        if (rows.length > 0) {
          callback(rows.item(0) as WorkoutData);
        } else {
          callback(null);
        }
      },
      (_, error) => {
        console.log("Error retrieving latest workout", error);
        return false;
      }
    );
  });
};
