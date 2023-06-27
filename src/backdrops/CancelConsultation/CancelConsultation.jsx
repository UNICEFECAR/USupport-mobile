import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { Backdrop, ConsultationInformation } from "#components";
import { localStorage } from "#services";
import { ONE_HOUR, showToast } from "#utils";
import { useCancelConsultation } from "#hooks";

export const CancelConsultation = ({
  isOpen,
  onClose,
  consultation,
  currencySymbol,
  secondaryCtaStyle,
}) => {
  const { t } = useTranslation("cancel-consultation");

  const queryClient = useQueryClient();

  const [error, setError] = useState();

  const { providerName, timestamp, image, price } = consultation;

  const startDate = new Date(timestamp);
  const endDate = new Date(timestamp + ONE_HOUR);

  const isConsultationLessThan24HoursBefore =
    new Date().getTime() + 24 * ONE_HOUR >= startDate.getTime();

  const onCancelSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["all-consultations"] });
    onClose();
    showToast({ message: t("cancel_success") });
  };
  const onCancelError = (error) => {
    setError(error);
  };
  const cancelConsultationMutation = useCancelConsultation(
    onCancelSuccess,
    onCancelError
  );

  const handleCancelClick = () => {
    cancelConsultationMutation.mutate({
      consultationId: consultation.consultationId,
      price: consultation.price,
      shouldRefund:
        isConsultationLessThan24HoursBefore || consultation.campaignId
          ? false
          : true,
    });
  };

  return (
    <Backdrop
      title="CancelConsultation"
      isOpen={isOpen}
      onClose={onClose}
      heading={
        isConsultationLessThan24HoursBefore && !consultation.campaignId
          ? t("paid_heading", {
              price: consultation.price,
              currencySymbol,
            })
          : t("heading")
      }
      text={
        isConsultationLessThan24HoursBefore &&
        !consultation.campaignId &&
        t("paid_cancel_subheading")
      }
      ctaLabel={t("cancel_button_label")}
      ctaHandleClick={handleCancelClick}
      isCtaDisabled={cancelConsultationMutation.isLoading}
      showLoadingIfDisabled
      ctaColor={
        isConsultationLessThan24HoursBefore || consultation.campaignId
          ? "red"
          : "green"
      }
      secondaryCtaLabel={t("keep_button_label")}
      secondaryCtaHandleClick={onClose}
      secondaryCtaStyle={secondaryCtaStyle}
      errorMessage={error}
    >
      <ConsultationInformation
        startDate={startDate}
        endDate={endDate}
        providerName={providerName}
        providerImage={image || "default"}
        price={consultation.campaignId ? null : price}
        currencySymbol={currencySymbol}
        t={t}
      />
    </Backdrop>
  );
};
