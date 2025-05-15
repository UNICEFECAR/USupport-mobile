import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import { Icon } from "./Icon";
import { AppText } from "../texts";
import { appStyles } from "#styles";
import { useGetTheme } from "#hooks";

/**
 * Like
 *
 * Like component used in MyQA
 *
 * @return {jsx}
 */
export const Like = ({
  handleClick,
  likes,
  isLiked,
  dislikes,
  isDisliked,
  answerId,
}) => {
  const { isDarkMode } = useGetTheme();

  return (
    <View style={styles.like}>
      <View style={styles.voteWrapper}>
        <TouchableOpacity
          onPress={() => {
            if (handleClick) {
              handleClick(isLiked ? "remove-like" : "like", answerId);
            }
          }}
        >
          <View
            style={[
              styles.iconContainer,
              isLiked && styles.iconContainerSelected,
            ]}
          >
            <View style={styles.iconWrapper}>
              <Icon name="like" />
            </View>
            <View style={styles.textContainer}>
              <AppText
                namedStyle="smallText"
                style={isDarkMode && { color: appStyles.colorBlack_37 }}
              >
                {likes}
              </AppText>
            </View>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.voteWrapper}>
        <TouchableOpacity
          onPress={() => {
            if (handleClick) {
              handleClick(isDisliked ? "remove-dislike" : "dislike", answerId);
            }
          }}
        >
          <View
            style={[
              styles.iconContainer,
              isDisliked && styles.iconContainerSelected,
            ]}
          >
            <View style={styles.iconWrapper}>
              <Icon name="dislike" />
            </View>
            <View style={styles.textContainer}>
              <AppText
                namedStyle="smallText"
                style={isDarkMode && { color: appStyles.colorBlack_37 }}
              >
                {dislikes}
              </AppText>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  like: { flexDirection: "row" },
  voteWrapper: {},
  iconWrapper: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    backfaceVisibility: "hidden",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    borderRadius: 18,
    marginTop: 16,
    marginRight: 8,
  },
  iconContainerSelected: {
    backgroundColor: appStyles.colorGreen_c1eaea,
    borderRadius: 18,
  },
  textContainer: {
    position: "absolute",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d2dcde",
    width: 24,
    height: 24,
    top: -12,
    right: -12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: appStyles.colorWhite_ff,
  },
});
