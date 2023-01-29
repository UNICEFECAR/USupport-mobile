import React from "react";
import { View, StyleSheet, Image } from "react-native";

import { AppText } from "../../texts/AppText/AppText";
import { AppButton } from "#components";

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
            color="purple"
            size="sm"
            label={btnLabelCall}
            onPress={() => handleClick("phone")}
          />
        ) : null}
        {link ? (
          <AppButton
            color="purple"
            size="sm"
            label={btnLabelLink}
            onPress={() => handleClick("link")}
          />
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  emergencyCenter: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: appStyles.colorWhite_ff,
    borderWidth: 1,
    borderColor: "transparent",
    ...appStyles.shadow2,
    width: "100%",
    maxWidth: 420,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    objectFit: "cover",
    objectPosition: "center",
  },
  buttonsContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 16,
  },

  textHeading: {
    fontFamily: appStyles.fontBold,
    color: appStyles.colorBlue_3d527b,
    textAlign: "left",
  },
  text: {
    marginTop: 4,
    textAlign: "left",
  },
});
