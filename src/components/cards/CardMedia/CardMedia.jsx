import React from "react";
import { View, StyleSheet, Image, Pressable } from "react-native";

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
  t,
  style,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={[appStyles.shadow2, styles.cardMedia, style]}
    >
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
          <AppText namedStyle="smallText">{t("by", { creator })}</AppText>
          <Icon
            size="sm"
            name="time"
            color={appStyles.colorGray_66768d}
            style={styles.icon}
          />
          <AppText namedStyle="smallText">
            {readingTime} {t("min_read")}
          </AppText>
        </View>
        <AppButton
          type="secondary"
          label={t("read_more")}
          size="sm"
          style={styles.readMoreButton}
          onPress={onPress}
        />
      </View>
    </Pressable>
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
