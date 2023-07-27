import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { Input } from "../Input";
import { ButtonWithIcon } from "../../buttons";

export const SendMessage = ({
  handleSubmit,
  t,
  hideOptions = () => {},
  emitTyping,
}) => {
  const [message, setMessage] = useState("");
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

  const handleSend = () => {
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

  return (
    <View style={styles.container}>
      <Input
        style={styles.input}
        placeholder={t("send_message")}
        value={message}
        onChangeText={handleTyping}
        onFocus={hideOptions}
      />
      <ButtonWithIcon
        iconName="comment"
        iconSize="md"
        iconColor="#FFFFFF"
        onlyIcon
        onPress={message.length > 0 ? handleSend : () => {}}
        circleSize="sm"
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  input: {
    width: "85%",
  },
  button: {
    borderRadius: 24,
    width: 48,
    height: 48,
    minWidth: 48,
    paddingLeft: 18,
  },
});
