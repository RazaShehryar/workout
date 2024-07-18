import React, { FC, useCallback } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";

import { IPlaylist } from "@lomray/react-native-apple-music/types/playlist";
import Animated, { LinearTransition, SlideInRight, SlideOutRight } from "react-native-reanimated";
import { DEFAULT_PLACEHOLDER, blurhash } from "@/constants";

type Props = {
  playlists: IPlaylist[];
  onSelectPlaylist: (value: IPlaylist) => void;
};

export const PlaylistList: FC<Props> = ({ playlists, onSelectPlaylist }) => {
  const renderItem = useCallback(
    ({ item, index }: { item: IPlaylist; index: number }) => (
      <TouchableOpacity onPress={() => onSelectPlaylist(item)} style={styles.itemContainer}>
        <View style={{ flex: 1 }}>
          <View style={styles.itemContainer}>
            <Image
              style={styles.image}
              source={{ uri: item.artworkUrl || DEFAULT_PLACEHOLDER }}
              placeholder={{ blurhash }}
              contentFit="cover"
              transition={1000}
            />
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

  const keyExtractor = useCallback((item: IPlaylist) => item.id, []);

  return (
    <Animated.View
      key="fede9"
      entering={SlideInRight}
      exiting={SlideOutRight}
      layout={LinearTransition.duration(250)}
      style={styles.container}>
      <FlatList
        contentContainerStyle={styles.contentContainerStyle}
        data={playlists.filter((v) => v.localId)}
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
  contentContainerStyle: { gap: 30, paddingBottom: 125 },
  container: { flexGrow: 1 },
});
