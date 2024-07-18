import React, { FC, useCallback, useMemo, useState } from "react";
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";

import { ISong, MusicItem, MusicKit, Player } from "@lomray/react-native-apple-music";
import Animated, { LinearTransition, SlideInRight, SlideOutRight } from "react-native-reanimated";
import { DEFAULT_PLACEHOLDER, blurhash } from "@/constants";
import { IAlbum } from "@lomray/react-native-apple-music/types/album";

type Props = {
  songs: ISong[];
  selectedAlbum: IAlbum | null;
};

const { width, height } = Dimensions.get("window");

export const AlbumSongs: FC<Props> = ({ songs, selectedAlbum }) => {
  const [alreadySet, setAlreadySet] = useState(false);

  const playSong = async (item: ISong) => {
    if (selectedAlbum?.localId && !alreadySet) {
      setAlreadySet(true);
      await MusicKit.setLocalPlaybackQueue(selectedAlbum.localId, MusicItem.ALBUM);
    }

    if (item.localId) {
      Player.playLocalSongInQueue(item.localId);
    }
  };

  const filteredSongs = useMemo(
    () =>
      songs
        .filter((v) => v.albumId === selectedAlbum?.localId)
        .sort((a, b) => (a.localId || "").localeCompare(b.localId || "")),
    [songs, selectedAlbum?.localId]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: ISong; index: number }) => (
      <TouchableOpacity onPress={() => playSong(item)} style={styles.itemContainer}>
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

  if (!selectedAlbum) {
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
              source={{ uri: selectedAlbum.artworkUrl || DEFAULT_PLACEHOLDER }}
              placeholder={{ blurhash }}
              contentFit="cover"
              transition={1000}
            />
            <Text numberOfLines={1} style={styles.albumTitle}>
              {selectedAlbum.title}
            </Text>
            <Text numberOfLines={1} style={styles.artistName}>
              {selectedAlbum.artistName}
            </Text>
          </View>
        }
        contentContainerStyle={styles.contentContainerStyle}
        data={filteredSongs}
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
