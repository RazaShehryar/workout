import React, { FC, useCallback } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { IArtist } from "@lomray/react-native-apple-music/types/artist";
import Animated, { LinearTransition, SlideInRight, SlideOutRight } from "react-native-reanimated";

type Props = {
  artists: IArtist[];
  onSelectArtist: (value: IArtist) => void;
};

export const ArtistList: FC<Props> = ({ artists, onSelectArtist }) => {
  const renderItem = useCallback(
    ({ item, index }: { item: IArtist; index: number }) => (
      <TouchableOpacity onPress={() => onSelectArtist(item)} style={styles.itemContainer}>
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

  const keyExtractor = useCallback((item: IArtist) => item.id, []);

  return (
    <Animated.View
      key="fede0"
      entering={SlideInRight}
      exiting={SlideOutRight}
      layout={LinearTransition.duration(250)}
      style={styles.container}>
      <FlatList
        contentContainerStyle={styles.contentContainerStyle}
        data={artists.filter((v) => v.localId)}
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
