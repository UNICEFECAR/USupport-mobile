import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import Config from "react-native-config";

import { Avatar } from "../../avatars/Avatar/Avatar";
import { Icon } from "../../icons/Icon";
import { AppText } from "../../texts/AppText/AppText";
import { appStyles } from "#styles";
import { useGetTheme } from "#hooks";

const { AMAZON_S3_BUCKET } = Config;

/**
 * OrganizationOverview
 *
 * Organization overview card component that displays key organization information
 *
 * @return {jsx}
 */
export const OrganizationOverview = ({
  //   image,
  name,
  unitName,
  paymentMethod,
  specialisations,
  address,
  onPress,
  t,
  style,
}) => {
  const { colors, isDarkMode } = useGetTheme();

  //   const imageURI =
  //     image && image !== "default" ? AMAZON_S3_BUCKET + "/" + image : null;

  return (
    <Pressable onPress={onPress} style={[styles.touchableOpacity, style]}>
      <View
        style={[
          styles.organizationOverview,
          { backgroundColor: colors.card },
          { ...appStyles.shadow2 },
        ]}
      >
        {/* <Avatar image={imageURI ? { uri: imageURI } : null} size="md" /> */}
        <View style={styles.content}>
          <View style={styles.textContent}>
            <View style={styles.nameContainer}>
              <AppText style={styles.nameText}>{name}</AppText>
              {paymentMethod.id && (
                <View style={styles.paymentBadge}>
                  <AppText
                    namedStyle="smallText"
                    style={[
                      styles.paymentBadgeText,
                      isDarkMode && { color: colors.text },
                    ]}
                  >
                    {t(paymentMethod.name)}
                  </AppText>
                </View>
              )}
            </View>
            {unitName && (
              <AppText
                namedStyle="smallText"
                style={{ color: colors.textSecondary }}
              >
                {unitName}
              </AppText>
            )}
            {specialisations?.length > 0 && (
              <AppText
                namedStyle="smallText"
                style={{ paddingVertical: 6, color: colors.text }}
              >
                {specialisations
                  .map((spec) => t(typeof spec === "string" ? spec : spec.name))
                  .join(", ")}
              </AppText>
            )}
            {address && (
              <View style={styles.addressContainer}>
                <Icon
                  name="location"
                  size="sm"
                  color={appStyles.colorPrimary_20809e}
                  style={styles.locationIcon}
                />
                <AppText
                  namedStyle="smallText"
                  style={{ color: colors.textSecondary }}
                  numberOfLines={2}
                >
                  {address}
                </AppText>
              </View>
            )}
          </View>
          <View>
            <Icon
              name="arrow-chevron-forward"
              color={appStyles.colorPrimary_20809e}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  touchableOpacity: {
    width: "100%",
    alignItems: "center",
  },
  organizationOverview: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    textAlign: "left",
    width: "96%",
    maxWidth: 420,
    borderRadius: 16,
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginLeft: 16,
    maxWidth: "85%",
  },
  textContent: {
    paddingRight: 10,
    width: "100%",
  },
  nameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexGrow: 1,
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  nameText: {
    color: appStyles.colorPrimary_20809e,
    wordBreak: "break-word",
    fontFamily: appStyles.fontBold,
    flex: 1,
  },
  paymentBadge: {
    backgroundColor: appStyles.colorPurple_dac3f6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  paymentBadgeText: {
    color: appStyles.colorSecondary_9749fa,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 4,
  },
  locationIcon: {
    marginRight: 8,
    marginTop: 2,
  },
});
