import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { AppText, Icon, Toggle } from "#components";
import { appStyles } from "#styles";
import { useGetTheme } from "#hooks";

/**
 * Card row with icon, title, description, and toggle — matches login mockup.
 */
export function LoginOptionCard({
  iconName,
  title,
  description,
  isToggled,
  onToggle,
  showInfoIcon = false,
  onInfoPress,
}) {
  const { colors } = useGetTheme();

  return (
    <View
      style={[
        styles.card,
        {
          borderColor: colors.cardMediaSeparator ?? appStyles.colorGray_ea,
          backgroundColor: colors.background,
        },
      ]}
    >
      <View style={styles.iconCircle}>
        <Icon
          name={iconName}
          size="md"
          color={appStyles.colorSecondary_9749fa}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <AppText namedStyle="text" isSemibold style={styles.title}>
            {title}
          </AppText>
          {showInfoIcon ? (
            <TouchableOpacity
              onPress={onInfoPress}
              hitSlop={8}
              accessibilityRole="button"
            >
              <Icon
                name="info"
                size="sm"
                color={appStyles.colorSecondary_9749fa}
              />
            </TouchableOpacity>
          ) : null}
        </View>
        <AppText namedStyle="smallText" style={styles.description}>
          {description}
        </AppText>
      </View>

      <Toggle isToggled={isToggled} handleToggle={onToggle} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 12,
    marginBottom: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(151, 73, 250, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  title: {
    flexShrink: 1,
  },
  description: {
    opacity: 0.75,
    lineHeight: 18,
  },
});
