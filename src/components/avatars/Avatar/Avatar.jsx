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
  xs: {
    width: 26,
    height: 26,
  },
  sm: {
    width: 32,
    height: 32,
  },
  md: {
    width: 56,
    height: 56,
  },
  lg: {
    width: 80,
    height: 80,
  },
});

Avatar.propTypes = {
  /**
   * Image url
   */
  image: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),

  /**
   * Size of the avatar
   * @default "sm"
   * @type {"sm" | "md"}
   * */
  size: PropTypes.oneOf(["xs", "sm", "md", "lg"]),

  /**
   * Additional styles for the component
   * */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};
