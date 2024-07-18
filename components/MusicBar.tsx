import Ionicons from "@expo/vector-icons/Ionicons";
import React, { FC } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";

import { ISong, Player, useLocalIsPlaying } from "@lomray/react-native-apple-music";
import Animated, { BounceInDown, BounceOutDown, FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import { DEFAULT_PLACEHOLDER, blurhash } from "@/constants";

type Props = {
  currentlyPlaying: ISong | null;
};

export const MusicBar: FC<Props> = ({ currentlyPlaying }) => {
  const { isPlaying } = useLocalIsPlaying();

  if (!currentlyPlaying) {
    return null;
  }
  return (
    <Animated.View
      key="bounce"
      entering={BounceInDown}
      exiting={BounceOutDown}
      layout={LinearTransition.duration(250)}
      style={styles.barView}>
      <View style={styles.rowView}>
        <Image
          style={styles.image}
          source={{ uri: currentlyPlaying.artworkUrl || DEFAULT_PLACEHOLDER }}
          placeholder={{ blurhash }}
          contentFit="cover"
          transition={1000}
        />

        <Text numberOfLines={1} style={styles.titleText}>
          {currentlyPlaying.title}
        </Text>
      </View>

      <View style={styles.iconsView}>
        <Ionicons
          name="play-back"
          size={24}
          color="black"
          onPress={() => {
            Player.skipLocalToPreviousEntry();
            Player.playLocal();
          }}
          suppressHighlighting
        />

        {isPlaying ? (
          <Animated.View key="fede1" entering={FadeIn} exiting={FadeOut}>
            <Ionicons name="pause" size={24} color="black" onPress={Player.pauseLocal} suppressHighlighting />
          </Animated.View>
        ) : (
          <Animated.View key="fede2" entering={FadeIn} exiting={FadeOut}>
            <Ionicons name="play" size={24} color="black" onPress={Player.playLocal} suppressHighlighting />
          </Animated.View>
        )}

        <Ionicons
          name="play-forward"
          size={24}
          color="black"
          onPress={() => {
            Player.skipLocalToNextEntry();
            Player.playLocal();
          }}
          suppressHighlighting
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  rowView: { flexDirection: "row", alignItems: "center", gap: 10 },
  line: { height: 1, width: "100%", backgroundColor: "#d3d3d3", marginTop: 6 },
  artistName: { fontWeight: "400", fontSize: 14, color: "gray" },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconsView: { flexDirection: "row", alignItems: "center", gap: 10, position: "absolute", right: 10 },
  itemTitle: { fontWeight: "500", fontSize: 18 },
  titleText: { fontWeight: "500", fontSize: 16, flex: 0.8 },
  barView: {
    width: "100%",
    position: "absolute",
    alignSelf: "center",
    bottom: 10,
    zIndex: 10,
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#d3d3d3",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  contentContainerStyle: { gap: 10, paddingBottom: 125 },
  container: { flexGrow: 1 },
});
