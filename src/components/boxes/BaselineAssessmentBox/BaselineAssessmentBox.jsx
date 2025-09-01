import { View } from "react-native";

import { Box } from "../Box";
import { AppButton } from "../../buttons";
import { getDateView } from "../../../utils";
import { StatusBadge } from "../../cards/StatusBadge";
import { ProgressBar } from "../../progress";
import { AppText } from "../../texts";

/**
 * BaselineAssesmentBox
 *
 * Baseline . assesment box
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
  return (
    <Box boxShadow={3} style={{ padding: 16, marginTop: 16 }}>
      <View style={{ position: "absolute", top: -22, right: 0, zIndex: 10 }}>
        <StatusBadge
          label={t(status)}
          status={status === "completed" ? "active" : "in-progress"}
        />
      </View>
      <ProgressBar progress={progress} showPercentage />
      <AppText style={{ textAlign: "center", marginTop: 8 }}>
        {t("started_at", { date: getDateView(startedAt) })}
      </AppText>
      <AppText style={{ textAlign: "center", marginTop: 4 }}>
        {t("answered_questions", { current: currentPosition })}
      </AppText>
      <AppButton
        label={status === "in_progress" ? t("continue") : t("view")}
        onPress={handleViewAssessment}
        variant="secondary"
        style={{ width: "50%", alignSelf: "center", marginTop: 16 }}
      />
    </Box>
  );
};

BaselineAssesmentBox.propTypes = {
  // Add propTypes here
};

BaselineAssesmentBox.defaultProps = {
  // Add defaultProps here
};
