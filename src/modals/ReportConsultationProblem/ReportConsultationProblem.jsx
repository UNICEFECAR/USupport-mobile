import React, { useRef, useState } from "react";
import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import { getLocales, getCalendars } from "expo-localization";
import "react-native-get-random-values";
import { useTranslation } from "react-i18next";
import { TransparentModal, AppText, Textarea } from "#components";
import { useReportConsultationProblem } from "#hooks";

const uuid = () => {
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 15) | 64;
  b[8] = (b[8] & 63) | 128;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
};

export const ReportConsultationProblem = ({
  consultationId,
  onClose,
  getCallContext,
}) => {
  const { t, i18n } = useTranslation("consultationReport");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const payload = useRef(null);
  const mutation = useReportConsultationProblem(() => setSent(true));
  const close = () => {
    if (!mutation.isLoading) onClose();
  };
  const submit = () => {
    if (mutation.isLoading || !message.trim()) return;
    payload.current ||= {
      consultationId,
      idempotencyKey: uuid(),
      message: message.trim(),
      source: Platform.OS === "ios" ? "ios_app" : "android_app",
      appVersion: DeviceInfo.getVersion(),
      osName: DeviceInfo.getSystemName(),
      osVersion: DeviceInfo.getSystemVersion(),
      deviceType: DeviceInfo.isTablet() ? "tablet" : "phone",
      browserName: null,
      browserVersion: null,
      interfaceLanguage: (
        i18n.resolvedLanguage ||
        i18n.language ||
        getLocales()[0]?.languageCode ||
        "en"
      ).slice(0, 16),
      reporterTimezone: getCalendars()[0]?.timeZone || null,
      callContext: getCallContext(),
    };
    mutation.mutate(payload.current);
  };
  return (
    <TransparentModal
      isOpen
      heading={t(sent ? "success_title" : "title")}
      handleClose={close}
      ctaLabel={t(sent ? "close" : "send")}
      ctaHandleClick={sent ? close : submit}
      isCtaDisabled={!sent && (!message.trim() || mutation.isLoading)}
      isCtaLoading={mutation.isLoading}
      errorMessage={mutation.isError ? t("error") : undefined}
    >
      {sent ? (
        <AppText accessibilityLiveRegion="polite">{t("success")}</AppText>
      ) : (
        <Textarea
          label={t("message_label")}
          accessibilityLabel={t("message_label")}
          value={message}
          disabled={mutation.isLoading}
          onChange={(value) => {
            setMessage([...value].slice(0, 2000).join(""));
            payload.current = null;
            mutation.reset();
          }}
        />
      )}
    </TransparentModal>
  );
};
