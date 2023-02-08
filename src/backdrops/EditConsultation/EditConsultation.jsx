import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { Backdrop, ConsultationInformation, ButtonSelector } from "#components";
import { ONE_HOUR } from "#utils";

export const EditConsultation = ({
  isOpen,
  onClose,
  consultation,
  openCancelConsultation,
  openSelectConsultation,
  currencySymbol,
}) => {
  const { t } = useTranslation("edit-consultation");

  const { providerName, timestamp, image, price } = consultation;

  const imageUrl = image || "default";
  const startDate = new Date(timestamp);
  const endDate = new Date(timestamp + ONE_HOUR);

  const handleCancelClick = () => {
    onClose();
    openCancelConsultation();
  };

  const handleEditClick = () => {
    onClose();
    openSelectConsultation();
  };

  return (
    <Backdrop
      classes="edit-consultation"
      title="EditConsultation"
      isOpen={isOpen}
      onClose={onClose}
      heading={t("heading")}
      text={t("subheading")}
    >
      <ConsultationInformation
        startDate={startDate}
        endDate={endDate}
        providerName={providerName}
        providerImage={imageUrl}
        price={price}
        currencySymbol={currencySymbol}
        classes="edit-consultation__provider-consultation"
        t={t}
      />
      <View style={styles.buttonContainer}>
        <ButtonSelector
          onPress={handleEditClick}
          iconName="calendar"
          label={t("date_button_label")}
          style={styles.buttonSelector}
        />
        <ButtonSelector
          onPress={handleCancelClick}
          iconName="close-x"
          label={t("cancel_button_label")}
          style={styles.buttonSelector}
        />
      </View>
    </Backdrop>
  );
};

const styles = StyleSheet.create({
  buttonContainer: { paddingVertical: 10 },
  buttonSelector: { marginBottom: 16, alignSelf: "center" },
});

EditConsultation.propTypes = {
  /**
   * Whether the backdrop is open or not
   * @type {boolean}
   **/
  isOpen: PropTypes.bool.isRequired,

  /**
   * Callback to close the backdrop
   * @type {function}
   **/
  onClose: PropTypes.func.isRequired,

  /**
   * Consultation object
   * @type {object}
   **/
  consultation: PropTypes.object.isRequired,

  /**
   * Callback to open the cancel consultation modal
   * @type {function}
   * */
  openCancelConsultation: PropTypes.func,

  /**
   * Callback to open the select consultation backdrop
   * @type {function}
   * */
  openSelectConsultation: PropTypes.func,
};
