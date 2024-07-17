import Ionicons from "@expo/vector-icons/Ionicons";
import React, { FC, useCallback, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ISong, MusicKit, Player, useLocalIsPlaying } from "@lomray/react-native-apple-music";
import Animated, {
  BounceInDown,
  BounceInUp,
  BounceOutDown,
  FadeIn,
  FadeOut,
  LinearTransition,
  SlideInRight,
  SlideOutRight,
} from "react-native-reanimated";

type Props = {
  songs: ISong[];
};

const DEFAULT_PLACEHOLDER = "https://arthurmillerfoundation.org/wp-content/uploads/2018/06/default-placeholder.png";

export const SongList: FC<Props> = ({ songs }) => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<ISong | null>(null);

  const { isPlaying } = useLocalIsPlaying();

  const playSong = async (item: ISong) => {
    if (item.localId) {
      setCurrentlyPlaying(item);
      Player.play();
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: ISong }) => (
      <TouchableOpacity onPress={() => playSong(item)} style={styles.itemContainer}>
        <Image borderRadius={10} width={50} height={50} source={{ uri: item.artworkUrl || DEFAULT_PLACEHOLDER }} />

        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={styles.itemTitle}>
            {item.title}
          </Text>
          {item.artistName ? <Text style={styles.artistName}>{item.artistName}</Text> : null}
          <View style={styles.line} />
        </View>
      </TouchableOpacity>
    ),
    []
  );

  const keyExtractor = useCallback((item: ISong) => item.id, []);

  return (
    <Animated.View
      key="fede0"
      entering={SlideInRight}
      exiting={SlideOutRight}
      layout={LinearTransition.duration(250)}
      style={styles.container}>
      <FlatList
        contentContainerStyle={styles.contentContainerStyle}
        data={songs}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
      />
      {currentlyPlaying ? (
        <Animated.View
          key="bounce"
          entering={BounceInDown}
          exiting={BounceOutDown}
          layout={LinearTransition.duration(250)}
          style={styles.barView}>
          <View style={styles.rowView}>
            <Image
              borderRadius={10}
              width={50}
              height={50}
              source={{ uri: currentlyPlaying.artworkUrl || DEFAULT_PLACEHOLDER }}
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
              <Animated.View key="fede1" entering={FadeIn} exiting={FadeOut} layout={LinearTransition.duration(250)}>
                <Ionicons name="pause" size={24} color="black" onPress={Player.pauseLocal} suppressHighlighting />
              </Animated.View>
            ) : (
              <Animated.View key="fede2" entering={FadeIn} exiting={FadeOut} layout={LinearTransition.duration(250)}>
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
      ) : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
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
  titleText: { fontWeight: "500", fontSize: 18, flex: 0.9 },
  barView: {
    width: "100%",
    position: "absolute",
    bottom: 30,
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
