import React from "react";
import { StyleSheet, View, TouchableOpacity, PixelRatio } from "react-native";

import { Avatar } from "../../avatars";
import { ButtonWithIcon, ButtonOnlyIcon } from "../../buttons/";
import { Icon } from "../../icons";

import { useGetClientData, useGetTheme } from "#hooks";

import { appStyles } from "#styles";

import Config from "react-native-config";
const { AMAZON_S3_BUCKET } = Config;

export const HeaderNavigation = ({
  t,
  navigation,
  style,
  hasUnreadNotifications,
  isTmpUser,
  handleRegistrationModalOpen,
}) => {
  const { isDarkMode } = useGetTheme();
  const fontScale = PixelRatio.getFontScale();

  const getClientDataEnabled = isTmpUser === false ? true : false;
  const clientDataQuery = useGetClientData(getClientDataEnabled);
  const clientData = isTmpUser ? {} : clientDataQuery[0].data;

  return (
    <View
      style={[
        styles.container,
        isDarkMode && { backgroundColor: appStyles.colorBlack_12 },
        { ...appStyles.shadow2 },
        style,
      ]}
    >
      <TouchableOpacity onPress={() => navigation.push("UserProfile")}>
        <Avatar
          image={{
            uri: `${AMAZON_S3_BUCKET}/${clientData?.image || "default"}`,
          }}
        />
      </TouchableOpacity>
      {fontScale < 1.6 ? (
        <ButtonWithIcon
          iconName="phone-emergency"
          label={t("emergency_button_label")}
          color="red"
          onPress={() => navigation.navigate("SOSCenter")}
        />
      ) : (
        <ButtonOnlyIcon
          iconName="phone-emergency"
          iconSize="md"
          color="red"
          onPress={() => navigation.navigate("SOSCenter")}
        />
      )}
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
          color={
            isDarkMode ? appStyles.colorWhite_ff : appStyles.colorGray_a6b4b8
          }
        />
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
