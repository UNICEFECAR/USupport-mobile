import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";

import appStyles from "../../../styles/appStyles";
import { useGetTheme } from "#hooks";

// Same purple as the sent message bubbles
const SEND_COLOR = "#7c3aed";
const SEND_BUTTON_SIZE = 38;

const SendIcon = ({ color }) => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * SendMessage
 *
 * The chat's message field, with the send button inside it.
 * The button stays grey until there is something to send
 *
 * @return {jsx}
 */
export const SendMessage = ({
  handleSubmit,
  t,
  hideOptions = () => {},
  emitTyping,
}) => {
  const { colors, isDarkMode, isHighContrast } = useGetTheme();
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const emiTypingLastExecuted = useRef(Date.now());
  const interval = 1000;

  useEffect(() => {
    if (Date.now() >= emiTypingLastExecuted.current + interval) {
      emiTypingLastExecuted.current = Date.now();
      if (message) {
        emitTyping("typing");
      }
    } else {
      const timerId = setTimeout(() => {
        emiTypingLastExecuted.current = Date.now();
        if (message) {
          emitTyping("typing");
        }
      }, interval);

      return () => clearTimeout(timerId);
    }
  }, [message, interval]);

  const canSend = message.trim().length > 0;

  const handleSend = () => {
    if (!canSend) return;
    handleSubmit(message);
    setMessage("");
    emitTyping("stop");
  };

  const handleTyping = (value) => {
    if (!value) {
      emitTyping("stop");
    }
    setMessage(value);
  };

  const accentColor = isHighContrast ? colors.tabUnderlinedBorder : SEND_COLOR;
  const borderColor =
    isFocused || canSend
      ? colors.tabUnderlinedBorder
      : isDarkMode
        ? "rgba(255, 255, 255, 0.12)"
        : colors.inputBorder;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDarkMode
            ? "rgba(255, 255, 255, 0.06)"
            : appStyles.colorWhite_ff,
          borderColor,
        },
      ]}
    >
      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholder={t("send_message")}
        placeholderTextColor={colors.textSecondary}
        value={message}
        onChangeText={handleTyping}
        onFocus={() => {
          setIsFocused(true);
          hideOptions();
        }}
        onBlur={() => setIsFocused(false)}
        multiline
        maxFontSizeMultiplier={appStyles.maxFontSizeMultiplier}
      />
      <TouchableOpacity
        onPress={handleSend}
        disabled={!canSend}
        accessibilityRole="button"
        accessibilityLabel={t("send_message")}
        accessibilityState={{ disabled: !canSend }}
        style={[
          styles.button,
          {
            backgroundColor: canSend
              ? accentColor
              : isDarkMode
                ? "rgba(255, 255, 255, 0.1)"
                : appStyles.colorGray_ea,
          },
        ]}
      >
        <SendIcon
          color={
            canSend
              ? isHighContrast
                ? appStyles.colorBlack_37
                : appStyles.colorWhite_ff
              : isDarkMode
                ? "rgba(255, 255, 255, 0.35)"
                : appStyles.colorGray_92989b
          }
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-end",
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    paddingBottom: 4,
    paddingLeft: 16,
    paddingRight: 4,
    paddingTop: 4,
    width: "100%",
  },
  input: {
    flex: 1,
    fontFamily: appStyles.fontRegular,
    fontSize: 15,
    // Grows with the text up to a few lines, then scrolls
    maxHeight: 110,
    minHeight: SEND_BUTTON_SIZE,
    paddingBottom: 9,
    paddingRight: 8,
    paddingTop: 9,
    textAlignVertical: "center",
  },
  button: {
    alignItems: "center",
    borderRadius: SEND_BUTTON_SIZE / 2,
    height: SEND_BUTTON_SIZE,
    justifyContent: "center",
    width: SEND_BUTTON_SIZE,
  },
});
