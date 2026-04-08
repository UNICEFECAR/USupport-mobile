import { View, StyleSheet } from "react-native";

import { AppText } from "../../texts";
import { Icon } from "../../icons";
import { NewButton } from "../../buttons";
import { getDateView } from "../../../utils";
import { StatusBadge } from "../../cards/StatusBadge";
import { ProgressBar } from "../../progress";
import LinearGradient from "../../LinearGradient";
import { useGetTheme } from "#hooks";
import { appStyles } from "#styles";

/**
 * BaselineAssesmentBox
 *
 * In-progress baseline assessment card — glass styling aligned with client-ui.
 *
 * @return {jsx}
 */
export const BaselineAssesmentBox = ({
  progress,
  status,
  startedAt,
  currentPosition,
  handleViewAssessment,
  t,
}) => {
  const { colors, isHighContrast } = useGetTheme();
  const isLightTheme = colors.background === appStyles.colorWhite_ff;

  const glassGradient = {
    degrees: 145,
    locations: [0, 100],
    colors:
      isLightTheme && !isHighContrast
        ? ["rgba(255, 255, 255, 0.99)", "rgba(245, 248, 255, 0.85)"]
        : colors.cardMediaGradient,
  };

  return (
    <LinearGradient
      gradient={glassGradient}
      style={[
        styles.box,
        isLightTheme && !isHighContrast
          ? styles.liquidGlassShadowLight
          : appStyles.cardMediaShadowDark,
        { borderColor: colors.cardMediaGradientBorder },
      ]}
    >
      <View style={styles.iconRow}>
        <View style={styles.iconCircle}>
          <Icon name="document" size="lg" color="#6a4ffb" />
        </View>
      </View>
      <View style={styles.statusWrap}>
        <StatusBadge
          label={t(status)}
          status={status === "completed" ? "active" : "in-progress"}
        />
      </View>
      <View style={styles.content}>
        <ProgressBar progress={progress} showPercentage />
        <AppText
          namedStyle="smallText"
          style={[styles.meta, { color: colors.textSecondary }]}
        >
          {`${t("started_at", { date: getDateView(startedAt) })} · ${currentPosition}/27`}
        </AppText>
        <NewButton
          label={status === "in_progress" ? t("continue") : t("view")}
          onPress={handleViewAssessment}
          size="lg"
          isFullWidth
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  liquidGlassShadowLight: {
    shadowColor: "rgb(95, 108, 145)",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 4,
  },
  box: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
    overflow: "hidden",
    padding: 16,
    position: "relative",
    width: "100%",
  },
  iconRow: {
    alignItems: "center",
    marginBottom: 8,
    width: "100%",
  },
  iconCircle: {
    alignItems: "center",
    backgroundColor: "rgba(106, 79, 251, 0.12)",
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  statusWrap: {
    position: "absolute",
    right: 16,
    top: 12,
    zIndex: 2,
  },
  content: {
    gap: 12,
    marginTop: 8,
    width: "100%",
  },
  meta: {
    textAlign: "center",
  },
});
