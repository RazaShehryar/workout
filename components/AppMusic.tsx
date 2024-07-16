import React from "react";
import { View, Image, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import Animated, { Extrapolation, interpolate, useSharedValue, useDerivedValue } from "react-native-reanimated";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

const AnimatedView = Animated.View;
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const songCoverSizes = [50, Dimensions.get("window").width - 60];
const songCoverTopPositions = [10, Dimensions.get("window").width / 2 - songCoverSizes[1] / 2];
const songCoverLeftPositions = [20, Dimensions.get("window").width / 2 - songCoverSizes[1] / 2];
const snapPoints = [70, songCoverSizes[1] + songCoverTopPositions[1] + 15 + 24 + 10 + 30 + 28];

const song = {
  id: "0",
  name: `Ain't A Thing`,
  album: "TIM",
  artist: "Avicii",
  length: "3:04",
};

const songs = [...Array(40)].map((_, index) => ({
  id: `${index}`,
  name: "Song Name",
  artist: "Artist Name",
  cover: "#" + (((1 << 24) * Math.random()) | 0).toString(16),
}));

const AppleMusic = () => {
  let bottomSheetRef = React.createRef<BottomSheet>();
  let fall = useSharedValue(1);

  const animatedSongCoverTopPosition = interpolate(
    fall.value,
    [0, 1],
    songCoverTopPositions.slice().reverse(),
    Extrapolation.CLAMP
  );

  const animatedSongCoverSize = interpolate(
    fall.value,
    [0, 1],
    [songCoverSizes[0], songCoverSizes[1]].slice().reverse(),
    Extrapolation.CLAMP
  );

  const animatedHeaderContentOpacity = interpolate(fall.value, [0.75, 1], [0, 1], Extrapolation.CLAMP);

  const onFlatListTouchStart = () => {
    bottomSheetRef.current!.snapToIndex(0);
  };

  const onHeaderPress = () => {
    bottomSheetRef.current!.snapToIndex(1);
  };

  const subtractedValue = useDerivedValue(() => {
    return animatedSongCoverSize - snapPoints[0];
  });

  const contentHeight = useDerivedValue(() => {
    return subtractedValue.value - animatedSongCoverTopPosition;
  });

  const animatedBackgroundOpacityValue = useDerivedValue(() => {
    return 1 - animatedHeaderContentOpacity;
  });

  const RenderContent = () => {
    const animatedBackgroundOpacity = animatedBackgroundOpacityValue;
    const animatedContentOpacity = interpolate(fall.value, [0, 1], [1, 0], Extrapolation.CLAMP);

    return (
      <AnimatedView style={[styles.contentContainer]}>
        <AnimatedView style={[styles.contentBackground, { opacity: animatedBackgroundOpacity }]} />

        <AnimatedView style={{ opacity: animatedContentOpacity }}>
          <AnimatedView style={{ height: contentHeight.value }} />

          <View style={styles.seekBarContainer}>
            <View style={styles.seekBarTrack} />
            <View style={styles.seekBarThumb} />
            <View style={styles.seekBarTimingContainer}>
              <Text style={styles.seekBarTimingText}>0:00</Text>
              <Text style={styles.seekBarTimingText}>{`-${song.length}`}</Text>
            </View>
          </View>

          <Text style={styles.songTitleLarge}>{song.name}</Text>
          <Text style={styles.songInfoText}>{`${song.artist} ⏤ ${song.album}`}</Text>
        </AnimatedView>
      </AnimatedView>
    );
  };

  const renderSongCover = () => {
    const animatedSongCoverLeftPosition = interpolate(
      fall.value,
      [0, 1],
      songCoverLeftPositions.slice().reverse(),
      Extrapolation.CLAMP
    );

    return (
      <AnimatedView
        key={"song-cover-container"}
        style={[
          styles.songCoverContainer,
          {
            height: animatedSongCoverSize,
            width: animatedSongCoverSize,
            left: animatedSongCoverLeftPosition,
            top: animatedSongCoverTopPosition,
          },
        ]}>
        <Image key={"song-cover"} style={styles.songCoverImage} source={require("../assets/images/avicii-tim.jpg")} />
      </AnimatedView>
    );
  };

  const subValue = useDerivedValue(() => {
    return 1 - animatedHeaderContentOpacity;
  });

  const RenderHeader = () => {
    const animatedBackgroundOpacity = subValue.value;
    return [
      <TouchableWithoutFeedback key={"header-container"} onPress={onHeaderPress}>
        <AnimatedView style={styles.headerContainer}>
          <AnimatedView
            style={[
              styles.headerBackground,
              {
                opacity: animatedBackgroundOpacity,
              },
            ]}>
            {renderHandler()}
          </AnimatedView>
          <AnimatedBlurView
            intensity={100}
            tint={"default"}
            style={[
              styles.headerContentContainer,
              {
                opacity: animatedHeaderContentOpacity,
              },
            ]}>
            <View style={styles.headerTopBorder} />
            <Text style={styles.songTitleSmall}>{song.name}</Text>
            <TouchableOpacity style={styles.headerActionButton}>
              <Ionicons name="play" size={32} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionButton}>
              <Ionicons name="play-forward" size={32} />
            </TouchableOpacity>
          </AnimatedBlurView>
        </AnimatedView>
      </TouchableWithoutFeedback>,
      renderSongCover(),
    ];
  };

  const renderShadow = () => {
    const animatedShadowOpacity = interpolate(fall.value, [0, 1], [0.5, 0]);

    return (
      <AnimatedView
        pointerEvents="none"
        style={[
          styles.shadowContainer,
          {
            opacity: animatedShadowOpacity,
          },
        ]}
      />
    );
  };

  const animatedBar1Rotation = (value: number, outputRange: number[]) => {
    "worklet";
    return interpolate(value, [0, 1], outputRange, Extrapolation.CLAMP);
  };

  const rotateValue = useDerivedValue(() => {
    return `${animatedBar1Rotation(fall.value, [0.3, 0])}rad`;
  });

  const antiRotateValue = useDerivedValue(() => {
    return `${animatedBar1Rotation(fall.value, [-0.3, 0])}rad`;
  });

  const renderHandler = () => {
    return (
      <View style={styles.handlerContainer}>
        <AnimatedView
          style={[
            styles.handlerBar,
            {
              left: -7.5,
              transform: [{ rotate: rotateValue.value }],
            },
          ]}
        />
        <AnimatedView
          style={[
            styles.handlerBar,
            {
              right: -7.5,
              transform: [{ rotate: antiRotateValue.value }],
            },
          ]}
        />
      </View>
    );
  };

  const renderSongItem = ({ item }: { item: any }) => {
    return (
      <View style={styles.songListItemContainer}>
        <View
          style={[
            {
              backgroundColor: `${item.cover}`,
            },
            styles.songListItemCover,
          ]}
        />
        <View style={styles.songListItemInfoContainer}>
          <Text>{item.name}</Text>
          <Text style={styles.songListItemSecondaryText}>{item.artist}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <BottomSheet ref={bottomSheetRef} index={1} animatedIndex={fall} snapPoints={snapPoints}>
        <BottomSheetView style={styles.bottomSheetView}>
          <RenderHeader />
          <RenderContent />
          <FlatList
            data={songs}
            renderItem={renderSongItem}
            keyExtractor={(item, index) => `${item.id}${index}`}
            onTouchStart={onFlatListTouchStart}
          />
        </BottomSheetView>
      </BottomSheet>

      {/* {renderShadow()} */}
    </View>
  );
};

const styles = StyleSheet.create({
  // Bottom sheet view
  bottomSheetView: {
    flex: 1,
    alignItems: "center",
  },

  // Screen
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // Shadow
  shadowContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },

  // Content
  contentContainer: {
    alignItems: "center",
    height: snapPoints[1] - snapPoints[0],
    overflow: "visible",
  },

  contentBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#fff",
  },

  // Header
  headerContainer: {
    height: snapPoints[0],
  },

  headerBackground: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
  },

  headerContentContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingRight: 20,
    paddingLeft: 20 + songCoverSizes[0] + 20,
  },

  headerTopBorder: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    opacity: 0.5,
    height: 0.25,
    backgroundColor: "#9B9B9B",
  },

  headerActionButton: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: 50,
    minWidth: 50,
  },

  // Handler
  handlerContainer: {
    position: "absolute",
    alignSelf: "center",
    top: 10,
    height: 20,
    width: 20,
  },

  handlerBar: {
    position: "absolute",
    backgroundColor: "#D1D1D6",
    top: 5,
    borderRadius: 3,
    height: 5,
    width: 20,
  },

  // Song
  songCoverContainer: {
    position: "absolute",
    top: 10,
    left: 20,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.25,
    shadowRadius: 15.0,
  },

  songTitleLarge: {
    marginTop: 10,
    textAlign: "center",
    color: "#333",
    fontWeight: "bold",
    fontSize: 30,
    lineHeight: 30,
  },

  songTitleSmall: {
    flexGrow: 1,
    color: "#333",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 16,
  },

  songInfoText: {
    textAlign: "center",
    color: "#FE2D55",
    fontSize: 24,
    lineHeight: 28,
  },

  songCoverImage: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#333",
  },

  // Seek Bar
  seekBarContainer: {
    height: 24,
    marginTop: 15,
    width: songCoverSizes[1],
  },

  seekBarThumb: {
    position: "absolute",
    backgroundColor: "#8E8E93",
    top: -2,
    borderRadius: 6,
    width: 6,
    height: 6,
  },

  seekBarTrack: {
    backgroundColor: "#DDDEDD",
    height: 2,
    borderRadius: 4,
  },

  seekBarTimingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  seekBarTimingText: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 13,
    fontWeight: "500",
    color: "#8E8E93",
  },

  // Song List Item
  songListItemContainer: {
    flexDirection: "row",
  },

  songListItemCover: {
    marginLeft: 20,
    marginRight: 15,
    marginVertical: 5,
    width: songCoverSizes[0],
    height: songCoverSizes[0],
    borderRadius: 4,
  },

  songListItemInfoContainer: {
    flexGrow: 1,
    borderBottomColor: "#CAC9CE",
    borderBottomWidth: 0.5,
    justifyContent: "center",
  },

  songListItemSecondaryText: {
    fontSize: 12,
    color: "#8E8D92",
  },
});

export default AppleMusic;
