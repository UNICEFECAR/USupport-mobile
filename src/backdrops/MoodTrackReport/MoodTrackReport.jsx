import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { View, StyleSheet } from "react-native";
import DatePicker from "react-native-date-picker";
import Joi from "joi";

import { Backdrop, Input } from "#components";
import { validate, getDateView, getDateDashes } from "#utils";
import { useGenerateMoodTrackReport } from "#hooks";

/**
 * MoodTrackReport
 *
 * The MoodTrackReport backdrop
 *
 * @return {jsx}
 */
export const MoodTrackReport = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation("backdrops", {
    keyPrefix: "mood-track-report",
  });
  const lang = i18n.language;

  const [data, setData] = useState({ startDate: null, endDate: null });
  const [errors, setErrors] = useState({});

  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const startRef = useRef();
  const endRef = useRef();

  const onError = (errorMessage) => {
    setErrors({ submit: errorMessage });
  };

  const generateReportMutation = useGenerateMoodTrackReport(() => {}, onError);

  const schema = Joi.object({
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
  });

  const handleGenerateReport = async () => {
    if ((await validate(data, schema, setErrors)) === null) {
      if (data.startDate && data.endDate && data.endDate < data.startDate) {
        setErrors({ endDate: t("end_date_before_start_error") });
        return;
      }

      await generateReportMutation.mutateAsync({
        startDate: getDateDashes(data.startDate),
        endDate: getDateDashes(data.endDate),
      });
    }
  };

  return (
    <Backdrop
      isOpen={isOpen}
      onClose={onClose}
      heading={t("heading")}
      text={t("subheading")}
      ctaLabel={t("export_button")}
      ctaHandleClick={handleGenerateReport}
      isCtaDisabled={
        !data.startDate || !data.endDate || generateReportMutation.isLoading
      }
      isCtaLoading={generateReportMutation.isLoading}
      secondaryCtaLabel={t("cancel_button")}
      secondaryCtaHandleClick={onClose}
      errorMessage={errors.submit}
      secondaryCtaStyle={styles.secondaryCtaStyle}
    >
      <View style={styles.contentContainer}>
        <Input
          label={t("start_date")}
          value={data.startDate ? getDateView(data.startDate) : ""}
          onFocus={() => setStartOpen(true)}
          reference={startRef}
          errorMessage={errors.startDate}
        />
        <Input
          label={t("end_date")}
          value={data.endDate ? getDateView(data.endDate) : ""}
          onFocus={() => setEndOpen(true)}
          reference={endRef}
          errorMessage={errors.endDate}
        />
        <DatePicker
          modal
          open={startOpen}
          date={data.startDate || new Date()}
          onConfirm={(date) => {
            setStartOpen(false);
            startRef.current?.blur?.();
            setData({ ...data, startDate: date });
          }}
          onCancel={() => {
            setStartOpen(false);
            startRef.current?.blur?.();
          }}
          mode="date"
          locale={lang}
          confirmText={t("confirm")}
          cancelText={t("cancel_button")}
          title={t("start_date")}
        />
        <DatePicker
          modal
          open={endOpen}
          date={data.endDate || new Date()}
          onConfirm={(date) => {
            setEndOpen(false);
            endRef.current?.blur?.();
            setData({ ...data, endDate: date });
          }}
          onCancel={() => {
            setEndOpen(false);
            endRef.current?.blur?.();
          }}
          mode="date"
          locale={lang}
          confirmText={t("confirm")}
          cancelText={t("cancel_button")}
          title={t("end_date")}
        />
      </View>
    </Backdrop>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    gap: 1.2,
    paddingBottom: 1.2,
  },
  secondaryCtaStyle: {
    marginBottom: 90,
  },
});
