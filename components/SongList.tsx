import React, { FC, useCallback } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";

import { ISong, Player } from "@lomray/react-native-apple-music";
import Animated, { LinearTransition, SlideInRight, SlideOutRight } from "react-native-reanimated";
import { DEFAULT_PLACEHOLDER, blurhash } from "@/constants";

type Props = {
  songs: ISong[];
};

export const SongList: FC<Props> = ({ songs }) => {
  const playSong = async (item: ISong) => {
    if (item.localId) {
      Player.playLocalSongInQueue(item.localId);
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: ISong }) => (
      <TouchableOpacity onPress={() => playSong(item)} style={styles.itemContainer}>
        <Image
          style={styles.image}
          source={{ uri: item.artworkUrl || DEFAULT_PLACEHOLDER }}
          placeholder={{ blurhash }}
          contentFit="cover"
          transition={1000}
        />

        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={styles.itemTitle}>
            {item.title}
          </Text>
          <Text style={styles.artistName}>{item.artistName}</Text>
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
    </Animated.View>
  );
};

const styles = StyleSheet.create({
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
  contentContainerStyle: { gap: 10, paddingBottom: 125 },
  container: { flexGrow: 1 },
});
