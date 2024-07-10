import { WorkoutData, createTable, getLatestWorkout, insertData } from "@/database";
import { addMinutesToDate, capitalizeFirstLetter } from "@/utils";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import AppleHealthKit, { HealthActivityOptions, HealthKitPermissions } from "react-native-health";
import Modal from "react-native-modal";
import { Pedometer } from "expo-sensors";

const permissions = {
  permissions: {
    write: [
      AppleHealthKit.Constants.Permissions.Workout,
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.StepCount,
    ],
  },
} as HealthKitPermissions;

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
    AppleHealthKit.initHealthKit(permissions, (err, results) => {
      if (err) {
        console.log("error initializing Healthkit: ", err);
        setIsReady(false);
        return;
      }
      setIsReady(true);
      console.log("Healthkit initialized: ", results);
    });
    fetchLatestWorkout();
    let subscription: Pedometer.Subscription;
    (async () => {
      try {
        const isAvailable = await Pedometer.isAvailableAsync();
        console.log("is available ", isAvailable);
        if (!isAvailable) {
          return;
        }
        const pedometerPermission = await Pedometer.requestPermissionsAsync();
        if (pedometerPermission.granted) {
          subscription = Pedometer.watchStepCount((result) => {
            setCurrentStepCount(result.steps);
          });
        }
      } catch (e) {
        console.log(e);
      }
    })();
    // return () => subscription?.remove();
  }, []);

  const saveStepsToHealthKit = () => {
    const startDate = new Date().toISOString();
    const endDate = addMinutesToDate(new Date(), 60).toISOString();

    let options: Record<string, unknown> = {
      type: capitalizeFirstLetter(type),
      startDate,
      endDate,
      energyBurned: Number(calories),
      energyBurnedUnit: "calorie",
      distance: Number(distance) * 1000,
      distanceUnit: "meter",
    };

    const stepsData = { value: currentStepCount, startDate, endDate };

    let steps = currentStepCount;

    AppleHealthKit.saveSteps(stepsData, (err, results) => {
      if (err) {
        steps = 0;
        console.log("error saving steps to Healthkit: ", err);
        return;
      }
      console.log("Steps saved to Healthkit: ", results.toString());
    });

    AppleHealthKit.saveWorkout(options as unknown as HealthActivityOptions, (err, results) => {
      if (err) {
        console.log("error saving workout to Healthkit: ", err);
        return;
      }
      const id = results.toString();
      options = { ...options, id, steps };

      if (id) {
        insertData(options as unknown as WorkoutData, fetchLatestWorkout);
        setDistance("");
        setCalories("");
        setType("walking");
        setCurrentStepCount(100);
        setModalVisible(false);
      }
    });
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
