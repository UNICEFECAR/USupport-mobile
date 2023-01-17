import React from "react";
import PropTypes from "prop-types";
import { StyleSheet, Image } from "react-native";

/**
 * Avatar
 *
 * Avatar component
 *
 * @return {jsx}
 */
export const Avatar = ({ image, size = "sm", style }) => {
  return (
    <Image
      style={[styles.avatar, styles[size], style]}
      source={image}
      alt="avatar"
    />
  );
};

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 100,
    objectFit: "cover",
  },

  sm: {
    width: 32,
    height: 32,
  },

  md: {
    width: 80,
    height: 80,
  },
});

Avatar.propTypes = {
  /**
   * Image url
   */
  image: PropTypes.string,

  /**
   * Size of the avatar
   * @default "sm"
   * @type {"sm" | "md"}
   * */
  size: PropTypes.oneOf(["sm", "md"]),

  /**
   * Additional styles for the component
   * */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};
