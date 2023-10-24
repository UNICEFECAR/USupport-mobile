import React, { useCallback } from "react";
import { View, StyleSheet, Image, Linking } from "react-native";

import { AppText } from "../../texts/";
import { AppButton } from "../../buttons";

import { appStyles } from "#styles";

/**
 * EmergencyCenter
 *
 * EmergencyCenter Component
 *
 * @return {jsx}
 */
export const EmergencyCenter = ({
  title,
  text,
  link,
  phone,
  btnLabelLink,
  btnLabelCall,
  image,
  style,
}) => {
  const handleClick = (type) => {
    if (type === "phone") {
      window.open(`tel:${phone}`);
    } else if (type === "link") {
      window.open(link, "_blank");
    }
  };
  const handlePress = (isPhone = false) => {
    if (isPhone) {
      if (Platform.OS === "android") {
        Linking.openURL(`tel:${phone}`);
      } else {
        Linking.openURL(`tel://${phone}`);
      }
    } else {
      Linking.openURL(link);
    }
  };

  return (
    <View style={[styles.emergencyCenter, style]}>
      {image && (
        <Image
          className="emergency-center__image"
          source={image && { uri: image }}
          style={styles.image}
        />
      )}
      <AppText style={styles.textHeading}>{title}</AppText>
      <AppText namedStyle="smallText" style={styles.text}>
        {text}
      </AppText>
      <View style={styles.buttonsContainer}>
        {phone ? (
          <AppButton
            color="red"
            size="sm"
            label={btnLabelCall}
            onPress={() => handlePress("phone", true)}
          />
        ) : null}
        {link ? (
          <AppButton
            color="purple"
            size="sm"
            label={btnLabelLink}
            onPress={() => handlePress()}
          />
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonsContainer: {
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  emergencyCenter: {
    backgroundColor: appStyles.colorWhite_ff,
    borderColor: "transparent",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    ...appStyles.shadow2,
    maxWidth: 420,
    width: "100%",
  },
  image: {
    borderRadius: 16,
    height: 200,
    marginBottom: 8,
    objectFit: "cover",
    objectPosition: "center",
    width: "100%",
  },

  text: {
    marginTop: 4,
    textAlign: "left",
  },
  textHeading: {
    color: appStyles.colorBlue_3d527b,
    fontFamily: appStyles.fontBold,
    textAlign: "left",
  },
});
