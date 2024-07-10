import { WorkoutData, createTable, getLatestWorkout, insertData } from "@/database";
import { addMinutesToDate, capitalizeFirstLetter, locations, workoutType } from "@/utils";
import HealthKit, {
  HKQuantityTypeIdentifier,
  HKUnits,
  HKWorkoutRouteTypeIdentifier,
  HKWorkoutTypeIdentifier,
  UnitOfEnergy,
  UnitOfLength,
} from "@kingstinct/react-native-healthkit";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import Modal from "react-native-modal";

const App = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [type, setType] = useState("walking");
  const [calories, setCalories] = useState("");
  const [distance, setDistance] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [latestWorkout, setLatestWorkout] = useState<WorkoutData | null>(null);
  const [currentStepCount, setCurrentStepCount] = useState(100);

  const fetchLatestWorkout = () => {
    getLatestWorkout((data) => {
      if (data) {
        console.log("this is the data ", data);
        setLatestWorkout(data);
      } else {
        console.log("No workout data found");
      }
    });
  };

  useEffect(() => {
    createTable();
    fetchLatestWorkout();
    // let subscription: Pedometer.Subscription;
    (async () => {
      try {
        const isHealthDataAvailable = await HealthKit.isHealthDataAvailable();
        if (!isHealthDataAvailable) {
          return;
        }
        const result = await HealthKit.requestAuthorization(
          [],
          [
            HKQuantityTypeIdentifier.distanceCycling,
            HKQuantityTypeIdentifier.distanceWalkingRunning,
            HKQuantityTypeIdentifier.stepCount,
            HKQuantityTypeIdentifier.activeEnergyBurned,
            HKWorkoutTypeIdentifier,
            HKWorkoutRouteTypeIdentifier,
          ]
        );
        if (result) {
          setIsReady(true);
        }
        // const isAvailable = await Pedometer.isAvailableAsync();
        // console.log("is available ", isAvailable);
        // if (!isAvailable) {
        //   return;
        // }
        // const pedometerPermission = await Pedometer.requestPermissionsAsync();
        // if (pedometerPermission.granted) {
        //   subscription = Pedometer.watchStepCount((result) => {
        //     setCurrentStepCount(result.steps);
        //   });
        // }
      } catch (e) {
        console.log(e);
      }
    })();

    // return () => subscription?.remove();
  }, []);

  const saveStepsToHealthKit = async () => {
    try {
      const start = new Date();
      const end = addMinutesToDate(new Date(), 60);

      let options: Record<string, unknown> = {
        type: capitalizeFirstLetter(type),
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        energyBurned: Number(calories),
        energyBurnedUnit: "calorie",
        distance: Number(distance) * 1000,
        distanceUnit: "meter",
        steps: currentStepCount,
      };

      const workoutOptions = {
        end: addMinutesToDate(new Date(), 60),
        totals: {
          energyBurned: Number(calories),
          distance: Number(distance) * 1000,
        },
      };

      const steps = await HealthKit.saveQuantitySample(
        HKQuantityTypeIdentifier.stepCount,
        HKUnits.Count,
        currentStepCount,
        { start, end }
      );

      const userDistance = await HealthKit.saveQuantitySample(
        type === "cycling" ? HKQuantityTypeIdentifier.distanceCycling : HKQuantityTypeIdentifier.distanceWalkingRunning,
        UnitOfLength.Meter,
        Number(distance) * 1000,
        { start, end }
      );

      const energyBurned = await HealthKit.saveQuantitySample(
        HKQuantityTypeIdentifier.activeEnergyBurned,
        UnitOfEnergy.SmallCalories,
        Number(calories),
        { start, end }
      );

      await Promise.all([energyBurned, steps, userDistance]);

      const workoutResult = await HealthKit.saveWorkoutSample(workoutType(type), [], new Date(), workoutOptions);

      if (workoutResult) {
        console.log("workout created: ", workoutResult);
        const workoutRouteResult = await HealthKit.saveWorkoutRoute(workoutResult, locations);
        if (workoutRouteResult) {
          console.log("workout route created");
          insertData({ ...options, id: workoutResult } as unknown as WorkoutData, fetchLatestWorkout);
          setDistance("");
          setCalories("");
          setType("walking");
          setCurrentStepCount(100);
          setModalVisible(false);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  if (!isReady) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Button title="Add Workout" onPress={() => setModalVisible(true)} />
      {latestWorkout ? (
        <View style={{ gap: 10 }}>
          <Text style={{ fontWeight: "600" }}>Workout details:</Text>
          <Text>{`Start date time: ${latestWorkout.startDate}`}</Text>
          <Text>{`End date time: ${latestWorkout.endDate}`}</Text>
          <Text>{`Distance covered: ${Math.floor(latestWorkout.distance / 1000)} km`}</Text>
          <Text>{`Energy burnt: ${Math.floor(latestWorkout.energyBurned)} calories`}</Text>
          <Text>{`Steps: ${latestWorkout.steps}`}</Text>
          <Text>{`Type: ${latestWorkout.type}`}</Text>
        </View>
      ) : null}
      <Modal isVisible={isModalVisible}>
        <View style={styles.modalContent}>
          <Text>Select Workout Type</Text>
          <Picker selectedValue={type} onValueChange={(itemValue) => setType(itemValue)}>
            <Picker.Item label="Walking" value="walking" />
            <Picker.Item label="Running" value="running" />
            <Picker.Item label="Cycling" value="cycling" />
          </Picker>
          <Text>Calories Burned</Text>
          <TextInput
            placeholder="Enter calories burned"
            keyboardType="numeric"
            returnKeyType="done"
            value={calories}
            onChangeText={setCalories}
            style={styles.input}
          />
          <Text>Distance Covered (km)</Text>
          <TextInput
            placeholder="Enter distance covered"
            keyboardType="numeric"
            returnKeyType="done"
            value={distance}
            onChangeText={setDistance}
            style={styles.input}
          />
          <Button disabled={!calories || !distance} title="Save" onPress={saveStepsToHealthKit} />
          <Button title="Cancel" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default App;
