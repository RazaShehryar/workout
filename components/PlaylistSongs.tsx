import { Image } from "expo-image";
import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { DEFAULT_PLACEHOLDER, blurhash } from "@/constants";
import { ISong, MusicItem, MusicKit, Player, useCurrentSong } from "@lomray/react-native-apple-music";
import { IPlaylist } from "@lomray/react-native-apple-music/types/playlist";
import Animated, { LinearTransition, SlideInRight, SlideOutRight } from "react-native-reanimated";

type Props = {
  songs: ISong[];
  selectedPlaylist: IPlaylist | null;
};

const { width, height } = Dimensions.get("window");

export const PlaylistSongs: FC<Props> = ({ songs, selectedPlaylist }) => {
  const [alreadySet, setAlreadySet] = useState(false);

  const currentPlaying = useRef(0);

  useEffect(() => {
    // Listen for playback state changes
    const playbackListener = Player.addListener("onPlaybackStateChange", async (state) => {
      if (state?.playbackStatus === "stopped") {
        const nextItem = songs.find((_value, ind) => ind === currentPlaying.current + 1);
        if (nextItem?.id && !nextItem?.localId) {
          await MusicKit.setPlaybackQueue(nextItem.id, MusicItem.SONG);
          Player.play();
          currentPlaying.current = currentPlaying.current + 1;
        }
      }
    });

    return () => {
      playbackListener.remove();
    };
  }, []);

  const playSong = async (item: ISong, index: number) => {
    if (selectedPlaylist?.localId && !alreadySet) {
      setAlreadySet(true);

      await MusicKit.setLocalPlaybackQueue(selectedPlaylist.localId, MusicItem.PLAYLIST);
    }

    if (item.localId) {
      Player.playLocalSongInQueue(item.localId);
    } else {
      await MusicKit.setPlaybackQueue(item.id, MusicItem.SONG);
      Player.play();
    }
    currentPlaying.current = index;
  };

  const renderItem = useCallback(
    ({ item, index }: { item: ISong; index: number }) => (
      <TouchableOpacity onPress={() => playSong(item, index)} style={styles.itemContainer}>
        <View style={{ flex: 1 }}>
          <View style={styles.itemContainer}>
            <Text style={[styles.itemTitle, { color: "gray" }]}>{index + 1}</Text>
            <Text numberOfLines={1} style={styles.itemTitle}>
              {item.title}
            </Text>
          </View>

          <View style={styles.line} />
        </View>
      </TouchableOpacity>
    ),
    []
  );

  const keyExtractor = useCallback((item: ISong) => item.id, []);

  if (!selectedPlaylist) {
    return null;
  }
  return (
    <Animated.View
      key="fede0"
      entering={SlideInRight}
      exiting={SlideOutRight}
      layout={LinearTransition.duration(250)}
      style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <View style={{ alignItems: "center", gap: 10 }}>
            <Image
              style={styles.coverImage}
              source={{ uri: selectedPlaylist.artworkUrl || DEFAULT_PLACEHOLDER }}
              placeholder={{ blurhash }}
              contentFit="cover"
              transition={1000}
            />
            <Text numberOfLines={1} style={styles.albumTitle}>
              {selectedPlaylist.title}
            </Text>
          </View>
        }
        contentContainerStyle={styles.contentContainerStyle}
        data={songs}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  albumTitle: {
    fontWeight: "600",
    fontSize: 18,
  },
  coverImage: {
    width: width * 0.7,
    height: height * 0.3,
    borderRadius: 20,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  line: { height: 1, width: "100%", backgroundColor: "#d3d3d3", marginTop: 6 },
  artistName: { fontWeight: "400", fontSize: 14, color: "gray" },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  itemTitle: { fontWeight: "500", fontSize: 18 },
  contentContainerStyle: { gap: 30, paddingBottom: 125 },
  container: { flexGrow: 1 },
});
