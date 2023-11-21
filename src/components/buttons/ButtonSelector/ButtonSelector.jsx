import React, { useState } from "react";
import PropTypes from "prop-types";
import { StyleSheet, Pressable, Text, View } from "react-native";
import { Icon } from "../../icons/Icon";
import { Avatar } from "../../avatars/Avatar";
import { appStyles } from "#styles";
import { useGetTheme } from "#hooks";

/**
 * ButtonSelector
 *
 * ButtonSelector component
 *
 * @return {jsx}
 */
export const ButtonSelector = ({
  label,
  iconName,
  avatar,
  disabled = false,
  style,
  ...props
}) => {
  const { colors, isDarkMode } = useGetTheme();
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Pressable
      style={({ pressed }) => {
        return [
          styles.btn,
          { backgroundColor: colors.card },
          pressed && styles.btnPressed,
          disabled && styles.btnDisabled,
          appStyles.shadow2,
          style,
        ];
      }}
      disabled={disabled}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      {...props}
    >
      <View style={styles.textContainer}>
        {iconName && (
          <View style={styles.leftIcon}>
            <Icon
              name={iconName}
              color={appStyles.colorGray_a6b4b8}
              size="md"
            />
          </View>
        )}
        {!iconName && avatar && <Avatar style={styles.avatar} image={avatar} />}
        <Text
          style={[
            styles.text,
            {
              color: colors.textTertiary,
            },
            isPressed && styles.textPressed,
          ]}
          maxFontSizeMultiplier={appStyles.maxFontSizeMultiplier}
        >
          {label}
        </Text>
      </View>
      <Icon
        name="arrow-chevron-forward"
        color={appStyles.colorBlue_3d527b}
        size="md"
      />
    </Pressable>
  );
};

// define your styles
const styles = StyleSheet.create({
  btn: {
    borderColor: "transparent",
    borderWidth: 1,
    borderRadius: 24,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "96%",
    maxWidth: 420,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  btnPressed: {
    borderColor: appStyles.colorPrimaryPressed_0c5f7a,
  },

  btnDisabled: {
    opacity: 0.4,
  },

  avatar: {},

  leftIcon: {
    paddingVertical: 4,
  },

  text: {
    marginLeft: 11,
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
  },

  textPressed: {
    color: appStyles.colorPrimaryPressed_0c5f7a,
    fontFamily: "Nunito_700Bold",
  },

  textContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
});

ButtonSelector.propTypes = {
  /**
   * Label to render in the ButtonSelector component
   */
  label: PropTypes.string,

  /**
   * Name of the left icon to render
   */
  iconName: PropTypes.string,

  /**
   * URL to the image that needs to be displayed
   */
  avatar: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),

  /**
   * Is the button disabled?
   */
  disabled: PropTypes.bool,

  /**
   * Additional styles to pass
   * */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),

  /**
   * Additional props to pass
   **/
  props: PropTypes.object,
};
