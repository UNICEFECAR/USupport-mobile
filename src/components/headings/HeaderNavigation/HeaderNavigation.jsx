import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";

import { Avatar } from "../../avatars";
import { ButtonWithIcon } from "../../buttons/ButtonWithIcon/ButtonWithIcon";
import { Icon } from "../../icons";

import { useGetClientData } from "#hooks";

import { appStyles } from "#styles";

import { AMAZON_S3_BUCKET } from "@env";

export const HeaderNavigation = ({ t, navigation, style }) => {
  const isTmpUser = false;
  const clientQueryArray = useGetClientData(isTmpUser ? false : true);
  const clientData = isTmpUser ? {} : clientQueryArray[0].data;

  return (
    <View style={[styles.container, { ...appStyles.shadow2 }, style]}>
      <TouchableOpacity onPress={() => navigation.push("UserProfile")}>
        <Avatar
          image={{
            uri: `${AMAZON_S3_BUCKET}/${clientData?.image || "default"}`,
          }}
        />
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