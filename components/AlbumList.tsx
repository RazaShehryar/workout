import React, { FC, useCallback } from "react";
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";

import { ISong, Player } from "@lomray/react-native-apple-music";
import Animated, { LinearTransition, SlideInRight, SlideOutRight } from "react-native-reanimated";
import { DEFAULT_PLACEHOLDER, blurhash } from "@/constants";
import { IAlbum } from "@lomray/react-native-apple-music/types/album";

type Props = {
  albums: IAlbum[];
  onSelectAlbum: (value: IAlbum) => void;
};

const { width, height } = Dimensions.get("window");

export const AlbumList: FC<Props> = ({ albums, onSelectAlbum }) => {
  const renderItem = useCallback(
    ({ item }: { item: IAlbum }) => (
      <TouchableOpacity onPress={() => onSelectAlbum(item)} style={styles.itemContainer}>
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
        <Text style={styles.artistName}>{item.artistName}</Text>
      </TouchableOpacity>
    ),
    []
  );

  const keyExtractor = useCallback((item: IAlbum) => item.id, []);

  return (
    <Animated.View
      key="fede0"
      entering={SlideInRight}
      exiting={SlideOutRight}
      layout={LinearTransition.duration(250)}
      style={styles.container}>
      <FlatList
        contentContainerStyle={styles.contentContainerStyle}
        data={albums}
        numColumns={2}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: width * 0.425,
    height: height * 0.2,
    borderRadius: 10,
  },
  artistName: { fontWeight: "400", fontSize: 14, color: "gray" },
  itemContainer: { flex: 1 },
  itemTitle: { marginTop: 10, fontWeight: "500", fontSize: 16, width: "90%" },
  contentContainerStyle: { gap: 20, paddingBottom: 125 },
  container: { flexGrow: 1 },
});
