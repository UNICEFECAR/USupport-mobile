import React, { useState } from "react";
import { StyleSheet, Pressable, Text, View, Image } from "react-native";
import { Icon } from "#components";

import { appStyles } from "#styles";

export const ButtonSelector = ({ label, iconName, avatar, ...props }) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Pressable
      style={({ pressed }) => {
        setIsPressed(pressed);
        return [styles.btn, pressed && styles.btnPressed];
      }}
      {...props}
    >
      <View style={styles.textContainer}>
        {iconName && (
          <Icon
            name={iconName}
            color="#A6B4B8"
            size="md"
            style={styles.leftIcon}
          />
        )}
        {!iconName && avatar && (
          <Image style={styles.avatar} source={avatar} alt="avatar" />
        )}
        <Text style={[styles.text, isPressed && styles.textPressed]}>
          {label}
        </Text>
      </View>
      <Icon name="arrow-chevron-forward" color="#3D527B" size="md" />
    </Pressable>
  );
};

// define your styles
const styles = StyleSheet.create({
  btn: {
    backgroundColor: "transparent",
    borderColor: "transparent",
    borderWidth: 1,
    borderRadius: 24,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 343,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  btnPressed: {
    borderColor: appStyles.colorPrimaryPressed_0c5f7a,
  },

  avatar: {
    width: 32,
    height: 32,
    borderRadius: 100,
    marginRight: 8,
    objectFit: "cover",
  },

  leftIcon: {
    paddingVertical: 4,
    paddingRight: 10,
  },

  text: {
    color: appStyles.colorBlack_37,
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
