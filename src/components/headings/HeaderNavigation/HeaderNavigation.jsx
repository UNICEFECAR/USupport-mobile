import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";

import { Avatar } from "../../avatars";
import { specialistPlaceholder } from "#assets";
import { ButtonWithIcon } from "../../buttons/ButtonWithIcon/ButtonWithIcon";
import { Icon } from "../../icons";

import { appStyles } from "#styles";

export const HeaderNavigation = ({ t, navigation, style }) => {
  return (
    <View style={[styles.container, { ...appStyles.shadow2 }, style]}>
      <TouchableOpacity onPress={() => navigation.push("UserProfile")}>
        <Avatar image={specialistPlaceholder} />
      </TouchableOpacity>
      <ButtonWithIcon
        iconName="phone-emergency"
        size="sm"
        label={t("emergency_button_label")}
        color="purple"
        onPress={() => navigation.navigate("SOSCenter")}
      />
      <TouchableOpacity onPress={() => {}}>
        <Icon name="notification-unread" color={appStyles.colorGray_a6b4b8} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: appStyles.colorWhite_ff,
  },
});
