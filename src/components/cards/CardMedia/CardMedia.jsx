import React from "react";
import { View, StyleSheet, Image } from "react-native";

import { AppText } from "../../texts/AppText/AppText";
import { Icon } from "../../icons/Icon";
import { AppButton } from "../../buttons/AppButton/AppButton";

import { appStyles } from "#styles";

import articlePlaceholder from "#assets";

/**
 * CardMedia
 *
 * CardMedia component to be used to display article details
 *
 * @return {jsx}
 */
export const CardMedia = ({
  image,
  title,
  creator,
  readingTime,
  categoryName,
  onPress,
  style,
}) => {
  return (
    <View style={[appStyles.shadow2, styles.cardMedia, style]}>
      <Image
        source={image ? { uri: image } : articlePlaceholder}
        style={styles.image}
      />
      <View style={styles.textContainer}>
        <View style={styles.headingContainer}>
          <AppText namedStyle="h3" numberOfLines={1}>
            {title}
          </AppText>
          <View style={styles.categoryContainer}>
            <AppText namedStyle="smallText" style={styles.categoryText}>
              {categoryName}
            </AppText>
          </View>
        </View>
        <View style={styles.creatorContainer}>
          <AppText namedStyle="smallText">By {creator}</AppText>
          <Icon
            size="sm"
            name="time"
            color={appStyles.colorGray_66768d}
            style={styles.icon}
          />
          <AppText namedStyle="smallText">{readingTime} min read</AppText>
        </View>
        <AppButton
          type="secondary"
          label="Read more"
          size="sm"
          style={styles.readMoreButton}
          onPress={onPress}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardMedia: {
    width: "96%",
    maxWidth: 420,
    borderRadius: 24,
    backgroundColor: appStyles.colorWhite_ff,
    ...appStyles.shadow2,
    borderWidth: 1,
    borderColor: "transparent",
    alignSelf: "center",
  },
  headingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryContainer: {
    marginLeft: 12,
    backgroundColor: appStyles.$colorBlue_20809E_0_3,
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 25,
  },
  image: {
    width: "100%",
    height: 160,
    borderTopRightRadius: 24,
    borderTopLeftRadius: 24,
  },
  textContainer: {
    padding: 16,
  },
  creatorContainer: { flexDirection: "row", marginTop: 8 },
  icon: { marginLeft: 16, marginRight: 5 },
  readMoreButton: { marginTop: 16 },
  categoryText: {
    fontFamily: appStyles.fontBold,
    color: appStyles.colorBlue_3d527b,
  },
});
