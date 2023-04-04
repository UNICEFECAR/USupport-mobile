import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Avatar } from "../../avatars";
import { ButtonWithIcon } from "../../buttons/";
import { Icon } from "../../icons";

import { useGetClientData } from "#hooks";

import { appStyles } from "#styles";

import { AMAZON_S3_BUCKET } from "@env";

export const HeaderNavigation = ({
  t,
  navigation,
  style,
  hasUnreadNotifications,
  isTmpUser,
  handleRegistrationModalOpen,
}) => {
  const getClientDataEnabled = isTmpUser === false ? true : false;
  const clientDataQuery = useGetClientData(getClientDataEnabled);
  const clientData = isTmpUser ? {} : clientDataQuery[0].data;

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
        color="red"
        onPress={() => navigation.navigate("SOSCenter")}
      />
      <TouchableOpacity
        onPress={() => {
          if (isTmpUser) {
            handleRegistrationModalOpen();
            return;
          }
          navigation.push("Notifications");
        }}
      >
        <Icon
          name={hasUnreadNotifications ? "notification-unread" : "notification"}
          color={appStyles.colorGray_a6b4b8}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // marginTop: 10,
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
