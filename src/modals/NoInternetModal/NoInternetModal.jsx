import React from "react";
import { View, StyleSheet } from "react-native";
import { AppText, Icon, TransparentModal } from "../../components";

export const NoInternetModal = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <TransparentModal hasCloseIcon={false}>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Icon color="#156f8c" name="wifi-off" />
        </View>
        <AppText namedStyle="h3" style={styles.text}>
          No Internet Connection
        </AppText>
        <AppText style={styles.text}>
          Please check your network connectivity and try again
        </AppText>
      </View>
    </TransparentModal>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 33,
    height: 31,
  },
  text: {
    marginTop: 20,
    textAlign: "center",
  },
});
