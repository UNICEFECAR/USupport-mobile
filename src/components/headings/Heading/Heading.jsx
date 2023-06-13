import React from "react";
import propTypes from "prop-types";
import { View, StyleSheet, TouchableOpacity } from "react-native";

import { Icon } from "../../icons";
import { AppText } from "../../texts";
import { appStyles } from "#styles";

export const Heading = ({
  heading,
  subheading,
  hasGoBackArrow = true,
  handleGoBack,
  buttonComponent,
  hasBackground = true,
  hasCloseIcon = false,
  handleCloseIconPress,
  style,
}) => {
  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: hasBackground
            ? appStyles.colorWhite_ff
            : "transparent",
        },
      ]}
    >
      <View style={[styles.container, style]}>
        {hasGoBackArrow && !hasCloseIcon && (
          <TouchableOpacity onPress={handleGoBack}>
            <Icon
              style={styles.backArrow}
              name="arrow-chevron-back"
              color={appStyles.colorPrimary_20809e}
            />
          </TouchableOpacity>
        )}
        <AppText namedStyle="h3">{heading}</AppText>
        <View style={styles.button}>{buttonComponent}</View>
        {hasCloseIcon && (
          <TouchableOpacity onPress={handleCloseIconPress}>
            <Icon
              style={styles.backArrow}
              name="close-x"
              color={appStyles.colorPrimary_20809e}
              onPress={handleCloseIconPress}
            />
          </TouchableOpacity>
        )}
      </View>
      {subheading && (
        <AppText style={styles.subheading} namedStyle="text">
          {subheading}
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 0,
    zIndex: 3,
    width: appStyles.screenWidth,
    paddingLeft: 16,
  },
  container: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "flex-start",
    paddingBottom: 16,
    paddingTop: 16,
  },
  backArrow: {
    marginRight: 16,
  },
  button: {
    marginLeft: "auto",
    maxWidth: "50%",
    marginRight: 8,
  },
  subheading: {
    textAlign: "left",
    width: "100%",
  },
});

Heading.propTypes = {
  /**
   * The heading text
   */
  heading: propTypes.string,

  /**
   * The subheading text
   */
  subheading: propTypes.string,

  /**
   * The function to handle the go back action
   */
  handleGoBack: propTypes.func,

  /**
   * The component to render as the button
   */
  buttonComponent: propTypes.node,

  /**
   * Whether or not to show the go back arrow
   * @default true
   */
  hasGoBackArrow: propTypes.bool,

  /**
   * Additional styles to apply to the component
   */
  style: propTypes.oneOfType([propTypes.object, propTypes.array]),
};
