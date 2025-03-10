import { WorkoutData, createTable, getLatestWorkout, insertData } from "@/database";
import { addMinutesToDate, capitalizeFirstLetter, locations, workoutType } from "@/utils";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import BottomSheet from "@gorhom/bottom-sheet";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";

import { AlbumList } from "@/components/AlbumList";
import { MusicBar } from "@/components/MusicBar";
import { SongList } from "@/components/SongList";
import { LIBRARY_ITEMS } from "@/constants";
import HealthKit, {
  HKQuantityTypeIdentifier,
  HKUnits,
  UnitOfEnergy,
  UnitOfLength,
} from "@kingstinct/react-native-healthkit";
import { Auth, AuthStatus, ISong, MusicKit, useLocalCurrentSong } from "@lomray/react-native-apple-music";
import { IAlbum } from "@lomray/react-native-apple-music/types/album";
import Animated, { LinearTransition, SlideInLeft, SlideOutRight } from "react-native-reanimated";
import { AlbumSongs } from "@/components/AlbumSongs";
import { IArtist } from "@lomray/react-native-apple-music/types/artist";
import { ArtistList } from "@/components/ArtistList";
import { IPlaylist } from "@lomray/react-native-apple-music/types/playlist";
import { PlaylistList } from "@/components/PlaylistList";
import { PlaylistSongs } from "@/components/PlaylistSongs";

const App = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [type, setType] = useState("walking");
  const [calories, setCalories] = useState("");
  const [distance, setDistance] = useState("");
  const [currentState, setCurrentState] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [songs, setSongs] = useState<ISong[]>([]);
  const [dupAlbums, setDupAlbums] = useState<IAlbum[]>([]);
  const [albums, setAlbums] = useState<IAlbum[]>([]);
  const [artists, setArtists] = useState<IArtist[]>([]);
  const [playlists, setPlaylists] = useState<IPlaylist[]>([]);
  const [playlistSongs, setPlaylistSongs] = useState<ISong[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<IArtist | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<IAlbum | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<IPlaylist | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [latestWorkout, setLatestWorkout] = useState<WorkoutData | null>(null);
  const [currentStepCount, setCurrentStepCount] = useState(100);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = ["1%", "50%", "90%"];

  const { song } = useLocalCurrentSong();

  const currentlyPlaying = useMemo(() => songs.find((v) => v.localId === song?.id) || null, [songs, song?.id]);

  const fetchLatestWorkout = () => {
    getLatestWorkout((data) => {
      if (data) {
        setLatestWorkout(data);
      } else {
        console.log("No workout data found");
      }
    });
  };

  useEffect(() => {
    createTable();
    fetchLatestWorkout();
    (async () => {
      try {
        const isHealthDataAvailable = await HealthKit.isHealthDataAvailable();
        if (!isHealthDataAvailable) {
          return;
        }
        setIsReady(true);
        // const result = await HealthKit.requestAuthorization(
        //   [],
        //   [
        //     HKQuantityTypeIdentifier.distanceCycling,
        //     HKQuantityTypeIdentifier.distanceWalkingRunning,
        //     HKQuantityTypeIdentifier.stepCount,
        //     HKQuantityTypeIdentifier.activeEnergyBurned,
        //     HKWorkoutTypeIdentifier,
        //     HKWorkoutRouteTypeIdentifier,
        //   ]
        // );
        // if (result) {
        //   setIsReady(true);
        // }
        const result = await Auth.authorize();
        setAuthStatus(result);
        // console.log("HERE 1");
        // const results = await MusicKit.setLocalPlaybackQueue("2383407936412471541");

        // console.log("User`s library Results:", results);

        // await MusicKit.setPlaybackQueue("pl.e35b41bd9acf48aeaddeb51dc91f2f76", MusicItem.PLAYLIST);
        // Player.play();
        // const types = [CatalogSearchType.SONGS, CatalogSearchType.ALBUMS]; // Define the types of items you're searching for. The result will contain items among songs/albums
        // const results = await MusicKit.catalogSearch("Spider man", types);
        // console.log("Search Results:", results);
      } catch (e) {
        console.log(e);
      }
    })();
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
        UnitOfEnergy.Kilocalories,
        Number(calories),
        { start, end }
      );

      await Promise.all([energyBurned, steps, userDistance]);

      const workoutResult = await HealthKit.saveWorkoutSample(workoutType(type), [], new Date(), workoutOptions);

      if (workoutResult) {
        const workoutRouteResult = await HealthKit.saveWorkoutRoute(workoutResult, locations);
        if (workoutRouteResult) {
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

  const handleOpenMusicSheet = () => {
    if (authStatus === "authorized") {
      bottomSheetRef.current?.expand();
    }
  };

  useEffect(() => {
    (async () => {
      if (authStatus === "authorized") {
        const songsResponse = await MusicKit.getUserLibrarySongs();
        await MusicKit.setLocalPlaybackQueueAll();
        if (songsResponse) {
          setSongs(songsResponse.items);
        }
        const albumsResponse = await MusicKit.getUserLibraryAlbums();
        if (albumsResponse) {
          setAlbums(albumsResponse.items);
          setDupAlbums(albumsResponse.items);
        }
        const artistsResponse = await MusicKit.getUserLibraryArtists();
        if (artistsResponse) {
          setArtists(artistsResponse.items);
        }
        const playlistsResponse = await MusicKit.getUserLibraryPlaylists();
        if (playlistsResponse) {
          setPlaylists(playlistsResponse.items);
        }
      }
    })();
  }, [authStatus]);

  const onSelectAlbum = async (item: IAlbum) => {
    if (item.localId) {
      setSelectedAlbum(item);
      setCurrentState("AlbumSongs");
    }
  };

  const onSelectArtist = async (item: IArtist) => {
    if (item.localId) {
      setDupAlbums((items) => items.filter((v) => v.artistId === item.localId));
      setSelectedArtist(item);
      setCurrentState("Albums");
    }
  };

  const onSelectPlaylist = async (item: IPlaylist) => {
    if (item.localId) {
      setSelectedPlaylist(item);
      const result = await MusicKit.getUserLibraryPlaylistSongs(item.id);
      if (result) {
        setPlaylistSongs(result.items);
      }
      setCurrentState("PlaylistSongs");
    }
  };

  const onGoBack = () => {
    setCurrentState((state) => {
      const result = state === "AlbumSongs" ? "Albums" : state === "PlaylistSongs" ? "Playlists" : "";
      return result;
    });
  };

  if (!isReady) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Button title="Add Workout" onPress={() => setModalVisible(true)} />
      <Button title="Open Music" onPress={handleOpenMusicSheet} />
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
      <BottomSheet ref={bottomSheetRef} index={-1} snapPoints={snapPoints} style={{ borderRadius: 10 }}>
        <View style={styles.bottomSheetContent}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            {currentState ? (
              <Ionicons name="arrow-back" size={24} color="black" onPress={onGoBack} suppressHighlighting />
            ) : (
              <View style={{ flex: 0.1 }} />
            )}
            <Text style={styles.bottomSheetText}>
              {["AlbumSongs", "PlaylistSongs"].includes(currentState) ? "" : currentState || "Library"}
            </Text>
            <View style={{ flex: 0.1 }} />
          </View>
          <View style={{ marginTop: 30, gap: 30 }}>
            {currentState === "Songs" ? (
              <SongList songs={songs} />
            ) : currentState === "Albums" ? (
              <AlbumList albums={dupAlbums} onSelectAlbum={onSelectAlbum} selectedArtist={selectedArtist} />
            ) : currentState === "AlbumSongs" ? (
              <AlbumSongs songs={songs} selectedAlbum={selectedAlbum} />
            ) : currentState === "Artists" ? (
              <ArtistList artists={artists} onSelectArtist={onSelectArtist} />
            ) : currentState === "Playlists" ? (
              <PlaylistList playlists={playlists} onSelectPlaylist={onSelectPlaylist} />
            ) : currentState === "PlaylistSongs" ? (
              <PlaylistSongs songs={playlistSongs} selectedPlaylist={selectedPlaylist} />
            ) : (
              <Animated.View
                key="fede4"
                entering={SlideInLeft}
                exiting={SlideOutRight}
                style={{ gap: 30 }}
                layout={LinearTransition.duration(250)}>
                {LIBRARY_ITEMS.map((item) => (
                  <TouchableOpacity
                    onPress={() => {
                      setCurrentState(item.title);
                      if (item.title === "Albums") {
                        setDupAlbums(albums);
                      }
                    }}
                    key={item.title}
                    style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      {item.icon}
                      <View style={{ borderBottomWidth: 1, borderBottomColor: "red", paddingBottom: 6, width: "100%" }}>
                        <Text style={{ fontWeight: "500", fontSize: 24 }}>{item.title}</Text>
                      </View>
                    </View>
                    <MaterialIcons
                      name="chevron-right"
                      size={24}
                      color="gray"
                      style={{ paddingBottom: 6, position: "absolute", right: 0 }}
                    />
                  </TouchableOpacity>
                ))}
              </Animated.View>
            )}
          </View>
          {/* Add your music player content here */}
        </View>
      </BottomSheet>
      <MusicBar currentlyPlaying={currentlyPlaying} />
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
  bottomSheetContent: {
    backgroundColor: "white",
    padding: 20,
    flex: 1,
  },
  bottomSheetText: {
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default App;
