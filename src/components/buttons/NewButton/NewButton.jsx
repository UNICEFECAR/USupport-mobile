import React, { useState } from "react";
import PropTypes from "prop-types";
import { StyleSheet, Pressable, Text, View } from "react-native";
import LinearGradient from "../../LinearGradient";
import { Loading } from "../../loaders/Loading/Loading";
import { Icon } from "../../icons/Icon";
import { appStyles } from "#styles";
import { useGetTheme } from "#hooks";

/**
 * NewButton
 *
 * NewButton component matching web version styling
 *
 * @return {jsx}
 */
export const NewButton = ({
  children,
  label,
  type = "gradient",
  loading = false,
  disabled = false,
  size = "md",
  onClick,
  onPress,
  iconName,
  iconColor,
  isFullWidth = false,
  style,
  ...props
}) => {
  const { colors, isDarkMode, isHighContrast } = useGetTheme();
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = disabled || loading ? () => {} : onClick || onPress;

  // Client-ui Welcome overrides outline to a solid blue for "Register anonymously"
  const welcomeBlue = {
    normal: "#6a90e9",
    hover: "#5d83dc",
    active: "#4f76cf",
  };

  // Gradient definitions for gradient button type
  const gradientNormal = {
    degrees: 135.77,
    locations: [9.72, 16.15, 65.14, 90.04],
    colors: ["#a597d9", "#9f90dc", "#775ff3", "#684dfd"],
  };

  const gradientActive = {
    degrees: 135.77,
    locations: [9.72, 16.15, 65.14, 90.04],
    colors: ["#8573b1", "#7f6eb4", "#6145bf", "#5237d5"],
  };

  const getGradient = () => {
    return gradientNormal;
  };
  const getTextColor = (pressed = false) => {
    if (disabled || loading) {
      if (
        type === "outline" ||
        type === "ghost" ||
        type === "ghost-purple" ||
        type === "text"
      ) {
        return colors.textSecondary;
      }
      return "#ffffff";
    }

    switch (type) {
      case "welcome-outline":
        return "#ffffff";
      case "outline":
        // Web new-button.scss: theme text main; active #4b6b84 (light) / #e7f1f7 (dark)
        if (isHighContrast) {
          return "#ffff00";
        }
        if (isDarkMode) {
          return pressed ? "#e7f1f7" : colors.text;
        }
        return pressed ? "#4b6b84" : colors.text;
      case "white":
        return "#0e202f";
      case "ghost":
        if (isHighContrast) {
          return "#ffff00";
        }
        return pressed ? "#4b6b84" : "#6989a4";
      case "ghost-purple":
        if (isHighContrast) {
          return "#ffff00";
        }
        return pressed ? "#4a2fd7" : "#6A4FFB";
      case "text":
        // Web: #6989a4; hover #5a7a94; active #4b6b84
        if (isHighContrast) {
          return "#ffff00";
        }
        return pressed ? "#4b6b84" : "#6989a4";
      default:
        return "#ffffff";
    }
  };

  const getBackgroundColor = (pressed = false) => {
    if (disabled || loading) {
      return null;
    }

    switch (type) {
      case "solid":
        if (isHighContrast) {
          return isDarkMode ? "#8c90eb" : "#6a4ffb";
        }
        if (pressed) {
          return isDarkMode ? "#6c70c7" : "#4a2fd7";
        }
        return isDarkMode ? "#8c90eb" : "#6a4ffb";
      case "welcome-outline":
        return pressed ? welcomeBlue.active : welcomeBlue.normal;
      case "outline":
        // Web: active rgba(104,77,253,0.08) light; dark active rgba(193,215,224,0.12)
        if (pressed) {
          return isDarkMode
            ? "rgba(193, 215, 224, 0.12)"
            : "rgba(104, 77, 253, 0.08)";
        }
        return "transparent";
      case "white":
        return pressed ? "#e8e8e8" : "#ffffff";
      case "ghost":
      case "ghost-purple":
      case "text":
        return "transparent";
      default:
        return null;
    }
  };

  const getBorderColor = (pressed = false) => {
    if (disabled || loading) {
      if (type === "welcome-outline") return welcomeBlue.normal;
      return isDarkMode ? "#c1d7e0" : "#cdd8e1";
    }

    switch (type) {
      case "welcome-outline":
        return pressed ? welcomeBlue.active : welcomeBlue.normal;
      case "outline":
        // Web: hover/active use #684dfd; dark uses #c1d7e0
        if (isDarkMode) {
          return pressed ? "#c1d7e0" : "#c1d7e0";
        }
        return pressed ? "#684dfd" : "#cdd8e1";
      default:
        return "transparent";
    }
  };

  const getFontWeight = (pressed = false) => {
    if (type === "text") {
      if (pressed) return appStyles.fontSemiBold;
      return appStyles.fontMedium;
    }
    if (type === "ghost" || type === "ghost-purple") {
      if (pressed) return appStyles.fontSemiBold;
      return appStyles.fontMedium;
    }
    return null;
  };

  const buttonContent = (pressed = false) => {
    const textColor = getTextColor(pressed);
    const fontWeight = getFontWeight(pressed);
    // Web: iconColor || "#ffffff"; for non-gradient types icon should follow label contrast
    const resolvedIconColor =
      iconColor ||
      (type === "gradient" || type === "solid"
        ? "#ffffff"
        : type === "white"
          ? "#0e202f"
          : textColor);
    return (
      <View style={styles.contentContainer}>
        {iconName && (
          <Icon
            name={iconName}
            size="sm"
            color={resolvedIconColor}
            style={styles.icon}
          />
        )}
        {children}
        {loading ? (
          <Loading style={{ width: 20, height: 20 }} />
        ) : (
          label && (
            <Text
              style={[
                styles.text,
                styles[`text_${size}`],
                {
                  color: textColor,
                },
                // Web `.button--text` is consistently 18px / 22px.
                type === "text" && { fontSize: 18, lineHeight: 22 },
                (type === "text" ||
                  type === "ghost" ||
                  type === "ghost-purple") &&
                  fontWeight && {
                    fontFamily: fontWeight,
                  },
                (type === "text" ||
                  type === "ghost" ||
                  type === "ghost-purple") &&
                  styles.textUnderline,
              ]}
              maxFontSizeMultiplier={appStyles.maxFontSizeMultiplier}
            >
              {label}
            </Text>
          )
        )}
      </View>
    );
  };

  if (type === "gradient") {
    const getPadding = () => {
      // Matches client-ui new-button.scss (html 62.5% → 1rem = 10px)
      switch (size) {
        case "xs":
          return { paddingVertical: 2, paddingHorizontal: 11 };
        case "sm":
          return { paddingVertical: 4, paddingHorizontal: 16 };
        case "md":
          return { paddingVertical: 6, paddingHorizontal: 16 };
        case "lg":
          return { paddingVertical: 12, paddingHorizontal: 20 };
        default:
          return { paddingVertical: 6, paddingHorizontal: 16 };
      }
    };

    return (
      <Pressable
        style={({ pressed }) => [
          styles.button,
          styles[`button_${size}`],
          isFullWidth && styles.buttonFullWidth,
          (disabled || loading) && styles.buttonDisabled,
          pressed && !disabled && !loading && styles.buttonGradientPressed,
          { paddingVertical: 0, paddingHorizontal: 0 },
          style,
        ]}
        disabled={disabled || loading}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        onPress={handlePress}
        {...props}
      >
        <LinearGradient
          gradient={
            isPressed && !disabled && !loading ? gradientActive : getGradient()
          }
          style={[
            styles.gradientContainer,
            getPadding(),
            size === "lg" && styles.gradientContainerLg,
          ]}
        >
          {buttonContent(isPressed && !disabled && !loading)}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        styles[`button_${size}`],
        isFullWidth && styles.buttonFullWidth,
        type !== "gradient" && {
          backgroundColor: getBackgroundColor(pressed),
          borderColor: getBorderColor(pressed),
          borderWidth: type === "outline" || type === "welcome-outline" ? 1 : 0,
        },
        (type === "ghost" || type === "ghost-purple") && styles.buttonGhost,
        (disabled || loading) && styles.buttonDisabled,
        pressed && !disabled && !loading && styles.buttonPressed,
        style,
      ]}
      disabled={disabled || loading}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      onPress={handlePress}
      {...props}
    >
      {({ pressed }) => buttonContent(pressed)}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    fontSize: 16,
    lineHeight: 22,
    color: appStyles.colorWhite_ff,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0,
    overflow: "hidden",
  },

  button_xs: {
    minWidth: 89,
    paddingVertical: 2,
    paddingHorizontal: 11,
  },

  button_sm: {
    minWidth: 148,
    paddingVertical: 4,
    paddingHorizontal: 16,
  },

  button_md: {
    minWidth: 168,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },

  button_lg: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },

  buttonFullWidth: {
    width: "100%",
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonGradientPressed: {
    opacity: 0.95,
  },

  buttonPressed: {
    opacity: 0.9,
  },

  buttonGhost: {
    paddingVertical: 0,
    paddingHorizontal: 0,
  },

  gradientContainer: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    // width: "100%",
    alignSelf: "stretch",
  },

  gradientContainerLg: {
    borderRadius: 12,
  },

  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    // width: "100%",
  },

  icon: {
    marginRight: 8,
  },

  text: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: appStyles.fontMedium,
    textAlign: "center",
  },

  text_xs: {
    fontSize: 16,
    lineHeight: 22,
  },

  text_sm: {
    fontSize: 16,
    lineHeight: 22,
  },

  text_md: {
    fontSize: 16,
    lineHeight: 22,
  },

  text_lg: {
    fontSize: 18,
    lineHeight: 22,
    fontFamily: appStyles.fontMedium,
  },

  textUnderline: {
    textDecorationLine: "underline",
  },
});

NewButton.propTypes = {
  /**
   * Button children
   */
  children: PropTypes.node,

  /**
   * Button label text
   */
  label: PropTypes.string,

  /**
   * Button type
   * @default "gradient"
   */
  type: PropTypes.oneOf([
    "gradient",
    "solid",
    "outline",
    "welcome-outline",
    "white",
    "ghost",
    "ghost-purple",
    "text",
  ]),

  /**
   * Loading state
   * @default false
   */
  loading: PropTypes.bool,

  /**
   * Disabled state
   * @default false
   */
  disabled: PropTypes.bool,

  /**
   * Button size
   * @default "md"
   */
  size: PropTypes.oneOf(["xs", "sm", "md", "lg"]),

  /**
   * Click handler (alias for onPress)
   */
  onClick: PropTypes.func,

  /**
   * Press handler
   */
  onPress: PropTypes.func,

  /**
   * Icon name
   */
  iconName: PropTypes.string,

  /**
   * Icon color (web default for gradient/solid: #ffffff)
   */
  iconColor: PropTypes.string,

  /**
   * Full width button
   * @default false
   */
  isFullWidth: PropTypes.bool,

  /**
   * Additional styles
   */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};
