import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Input } from "../Input";
import { ButtonWithIcon } from "../../buttons";

export const SendMessage = ({ handleSubmit, t, hideOptions = () => {} }) => {
  const [message, setMessage] = useState("");
  const handleSend = () => {
    handleSubmit(message);
    setMessage("");
  };
  return (
    <View style={styles.container}>
      <Input
        style={styles.input}
        placeholder={t("send_message")}
        value={message}
        onChangeText={setMessage}
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
    // marginBottom: 18,
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
    // padding: 30,
    // justifyContent: "center",
  },
});
