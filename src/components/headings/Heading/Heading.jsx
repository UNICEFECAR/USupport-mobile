import React from "react";
import propTypes from "prop-types";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";

import { Icon } from "../../icons";
import { AppText } from "../../texts";

import { appStyles } from "#styles";
import { useGetTheme } from "#hooks";

export const Heading = ({
  heading,
  subheading,
  hasGoBackArrow = true,
  handleGoBack,
  buttonComponent,
  hasBackground = false,
  hasCloseIcon = false,
  handleCloseIconPress,
  headingNamedStyle = "h1",
  style,
  wrapperStyle,
  onLayout,
}) => {
  const { t } = useTranslation("screens", { keyPrefix: "screen" });
  const { colors, isHighContrast } = useGetTheme();
  const actionColor = isHighContrast ? "#fff" : appStyles.colorPrimary_20809e;

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: hasBackground ? colors.background : "transparent",
        },
        wrapperStyle,
      ]}
      onLayout={onLayout}
    >
      {hasGoBackArrow && !hasCloseIcon && (
        <TouchableOpacity
          onPress={handleGoBack}
          style={styles.goBackRow}
          hitSlop={appStyles.hitSlop}
        >
          <Icon
            style={styles.goBackIcon}
            name="arrow-chevron-back"
            color={actionColor}
          />
          <AppText namedStyle="text" isBold style={styles.goBackText}>
            {t("go_back")}
          </AppText>
        </TouchableOpacity>
      )}

      <View style={[styles.container, style]}>
        <View style={styles.headingRow}>
          <AppText style={styles.heading} namedStyle={headingNamedStyle}>
            {heading}
          </AppText>
          {buttonComponent ? (
            <View style={styles.button}>{buttonComponent}</View>
          ) : null}
        </View>
        {hasCloseIcon && (
          <TouchableOpacity
            onPress={handleCloseIconPress}
            hitSlop={appStyles.hitSlop}
          >
            <Icon
              style={styles.closeIcon}
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
    top: 0,
    zIndex: 3,
    width: appStyles.screenWidth,
    paddingTop: 32,
    paddingBottom: 16,
  },
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  goBackRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  goBackIcon: {
    marginRight: 8,
  },
  goBackText: {
    textTransform: "none",
  },
  headingRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: 0,
  },
  button: {
    marginLeft: "auto",
    maxWidth: "40%",
    marginRight: 8,
  },
  heading: {
    textAlign: "left",
    flexShrink: 1,
    marginRight: 12,
  },
  subheading: {
    textAlign: "left",
    width: "100%",
    marginRight: 8,
  },
  closeIcon: {
    marginLeft: 12,
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
   * Typography preset for the heading text.
   * @default "h1"
   */
  headingNamedStyle: propTypes.oneOf(["h1", "h2", "h3", "text", "smallText"]),

  /**
   * Additional styles to apply to the component
   */
  style: propTypes.oneOfType([propTypes.object, propTypes.array]),
};
