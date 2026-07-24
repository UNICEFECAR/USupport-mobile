import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { View, StyleSheet, Platform } from "react-native";

import { AppText } from "../../texts";
import { Emoticon, Icon } from "../../icons";
import { appStyles } from "#styles";
import { useGetTheme } from "#hooks";

/**
 * MoodTrackDetails
 *
 * Content for the mood entry modal — single sheet with sectioned layout.
 *
 * @return {jsx}
 */
export const MoodTrackDetails = ({ mood, t }) => {
  const { colors, isDarkMode, isHighContrast } = useGetTheme();
  const primary = colors.primary || appStyles.colorPrimary_20809e;

  const commentBody = useMemo(() => {
    if (mood.comment == null) return "";
    return typeof mood.comment === "string"
      ? mood.comment.trim()
      : `${mood.comment}`.trim();
  }, [mood.comment]);

  const showComment = commentBody.length > 0;
  const showCritical = mood?.is_critical === true || mood?.isCritical === true;

  const borderColor = isHighContrast
    ? colors.textSecondary
    : colors.cardMediaGradientBorder || "rgba(104, 77, 253, 0.2)";

  const dividerColor = isHighContrast
    ? colors.textSecondary
    : colors.cardMediaSeparator || "rgba(15, 32, 47, 0.1)";

  const sheetBg = isHighContrast
    ? { backgroundColor: "transparent" }
    : isDarkMode
      ? { backgroundColor: "rgba(255, 255, 255, 0.05)" }
      : { backgroundColor: "rgba(255, 255, 255, 0.55)" };

  const quoteBg = isHighContrast
    ? { backgroundColor: "transparent" }
    : isDarkMode
      ? { backgroundColor: "rgba(255, 255, 255, 0.06)" }
      : { backgroundColor: "rgba(104, 77, 253, 0.08)" };

  const criticalBg = isDarkMode
    ? "rgba(229, 57, 53, 0.12)"
    : "rgba(229, 57, 53, 0.08)";

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.sheet,
          sheetBg,
          {
            borderColor,
          },
          isHighContrast && styles.sheetHC,
          Platform.OS === "ios" &&
            !isHighContrast && {
              shadowColor: isDarkMode ? "#000" : primary,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: isDarkMode ? 0.18 : 0.1,
              shadowRadius: 14,
            },
        ]}
      >
        {showCritical ? (
          <View
            style={[
              styles.criticalBlock,
              {
                backgroundColor: isHighContrast ? "transparent" : criticalBg,
                borderColor: appStyles.colorRed_eb5757,
              },
            ]}
          >
            <View style={styles.criticalIconWrap}>
              <Icon
                name="warning"
                size="md"
                color={appStyles.colorRed_eb5757}
              />
            </View>
            <AppText
              style={[
                styles.criticalCopy,
                { color: appStyles.colorRed_eb5757 },
              ]}
            >
              {t("critical_text")}
            </AppText>
          </View>
        ) : null}

        {showCritical ? (
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />
        ) : null}

        <View style={styles.moodBlock}>
          <AppText style={[styles.moodEyebrow, { color: colors.text }]}>
            {t("you_felt")}
          </AppText>
          <View
            style={[
              styles.emoticonWrap,
              {
                backgroundColor: isHighContrast
                  ? "transparent"
                  : isDarkMode
                    ? "rgba(139, 115, 255, 0.22)"
                    : "rgba(104, 77, 253, 0.12)",
                borderColor: isHighContrast
                  ? colors.textSecondary
                  : "transparent",
              },
              isHighContrast && styles.emoticonWrapHC,
            ]}
          >
            <Emoticon name={mood.mood} size="lg" />
          </View>
          <AppText
            style={[styles.moodTitle, { color: colors.text }]}
            numberOfLines={3}
          >
            {t(mood.mood)}
          </AppText>
        </View>

        {showComment ? (
          <>
            <View style={[styles.divider, { backgroundColor: dividerColor }]} />
            <View style={styles.noteBlock}>
              <AppText
                style={[styles.noteLabel, { color: colors.textSecondary }]}
              >
                {t("comment_text")}
              </AppText>
              <View
                style={[
                  styles.noteQuote,
                  quoteBg,
                  {
                    borderColor: isHighContrast
                      ? colors.textSecondary
                      : isDarkMode
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(104, 77, 253, 0.12)",
                  },
                  isHighContrast && styles.noteQuoteHC,
                ]}
              >
                <AppText
                  style={[styles.noteBody, { color: colors.text }]}
                  lineHeight={24}
                >
                  {commentBody}
                </AppText>
              </View>
            </View>
          </>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: "100%",
    alignItems: "stretch",
    paddingTop: 4,
    paddingBottom: 4,
  },
  sheet: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  sheetHC: {
    borderWidth: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth * 2,
    width: "100%",
    alignSelf: "stretch",
    opacity: 0.85,
  },
  criticalBlock: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0,
  },
  criticalIconWrap: {
    marginTop: 2,
  },
  criticalCopy: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: appStyles.fontSemiBold,
  },
  moodBlock: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  moodEyebrow: {
    alignSelf: "center",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: appStyles.fontSemiBold,
    letterSpacing: 0.3,
    marginBottom: 14,
    opacity: 0.9,
  },
  emoticonWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
  },
  emoticonWrapHC: {
    borderWidth: 2,
  },
  moodTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: appStyles.fontSemiBold,
    letterSpacing: -0.25,
    textAlign: "center",
  },
  noteBlock: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
    width: "100%",
    gap: 10,
  },
  noteLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: appStyles.fontSemiBold,
    textTransform: "uppercase",
    letterSpacing: 0.55,
  },
  noteQuote: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  noteQuoteHC: {
    borderWidth: 2,
  },
  noteBody: {
    fontSize: 16,
    fontFamily: appStyles.fontRegular,
  },
});

MoodTrackDetails.propTypes = {
  mood: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
};
