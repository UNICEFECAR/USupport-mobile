import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import { Icon } from "./Icon";
import { AppText } from "../texts";
import { appStyles } from "#styles";

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
  return (
    <View style={styles.like}>
      <View style={styles.voteWrapper}>
        <TouchableOpacity
          onPress={() =>
            handleClick(isLiked ? "remove-like" : "like", answerId)
          }
        >
          <View
            style={[
              styles.iconContainer,
              isLiked && styles.iconContainerSelected,
            ]}
          >
            <Icon name="like" />
            <View style={styles.textContainer}>
              <AppText namedStyle="smallText">{likes}</AppText>
            </View>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.voteWrapper}>
        <TouchableOpacity
          onPress={() =>
            handleClick(isDisliked ? "remove-dislike" : "dislike", answerId)
          }
        >
          <View
            style={[
              styles.iconContainer,
              isDisliked && styles.iconContainerSelected,
            ]}
          >
            <Icon name="dislike" />
            <View style={styles.textContainer}>
              <AppText namedStyle="smallText">{dislikes}</AppText>
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
  iconContainer: {
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
