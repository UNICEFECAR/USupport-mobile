import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { View, StyleSheet, Pressable } from "react-native";

import { Backdrop, AppText, Icon, LinearGradient } from "#components";
import { useGetTheme } from "#hooks";
import { appStyles } from "#styles";

/**
 * UserGuide
 *
 * The UserGuide backdrop
 *
 * @return {jsx}
 */
export const UserGuide = ({
  isOpen,
  onClose,
  handleOpenEmergencySituation,
}) => {
  const { t } = useTranslation("backdrops", { keyPrefix: "user-guide" });
  const navigation = useNavigation();
  const { colors } = useGetTheme();

  const buttons = [
    { name: "emergency_services", icon: "phone-emergency", path: "SOSCenter" },
    { name: "map", icon: "location", onClick: handleOpenEmergencySituation },
    {
      name: "rights",
      icon: "read-book",
      path: "ChildrenRights",
      params: { start: "rights-intro" },
    },
  ];

  const handleOptionPress = (button) => {
    if (button.onClick) {
      button.onClick();
      return;
    }
    navigation.navigate(button.path, button.params);
  };

  return (
    <Backdrop
      classes="user-guide"
      isOpen={isOpen}
      onClose={onClose}
      heading={t("heading")}
    >
      <View style={styles.container}>
        {buttons.map((button) => (
          <Pressable
            key={button.name}
            onPress={() => handleOptionPress(button)}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: appStyles.colorWhite_ff },
              pressed && styles.cardPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t(button.name)}
          >
            <LinearGradient
              gradient={styles.iconGradient}
              style={styles.cardIcon}
            >
              <Icon name={button.icon} size="md" color="#fff" />
            </LinearGradient>

            <View style={styles.cardText}>
              <AppText
                namedStyle="text"
                style={[styles.cardDescription, { color: colors.textTertiary }]}
              >
                {t(button.name)}
              </AppText>
            </View>
          </Pressable>
        ))}
      </View>
    </Backdrop>
  );
};

const styles = StyleSheet.create({
  container: { width: "100%", alignItems: "center" },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e0e4fb",
    width: "96%",
    maxWidth: 420,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,

    // Match web `box-shadow: 0 5px 12px rgba(38, 32, 84, 0.08)`
    shadowColor: "#262054",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  cardPressed: {
    borderWidth: 1,
    borderColor: appStyles.colorPrimaryPressed_0c5f7a,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  iconGradient: {
    degrees: 135.77,
    locations: [0, 20, 70, 100],
    colors: ["#a597d9", "#9f90dc", "#775ff3", "#684dfd"],
  },
  cardText: { flex: 1 },
  cardDescription: { lineHeight: 20 },
  cardChevron: { marginLeft: 4 },
});
