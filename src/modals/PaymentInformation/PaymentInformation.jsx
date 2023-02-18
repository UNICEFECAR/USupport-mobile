import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Linking } from "react-native";

import { TransparentModal, AppText, Line, AppButton } from "#components";

import { appStyles } from "#styles";

import { Context } from "#services";

import { getDateView, getTime } from "#utils";

export const PaymentInformation = ({ isOpen, onClose, data }) => {
  const { t } = useTranslation("payment-information");

  const { currencySymbol } = useContext(Context);
  const {
    service,
    paymentMethod,
    price,
    date,
    recipient,
    address,
    receipt_url,
  } = data;

  const handleViewReceiptButtonClick = (receiptUrl) => {
    Linking.openURL(receiptUrl);
  };

  const paymentTime = getTime(date);

  return (
    <TransparentModal
      heading={t("heading")}
      isOpen={isOpen}
      handleClose={onClose}
    >
      <AppText style={styles.text}>
        {t("service")}
        <AppText style={styles.textBold}>{t(service)}</AppText>
      </AppText>
      <AppText style={styles.text}>
        {t("date_of_payment")}
        <AppText style={styles.textBold}>{getDateView(date)}</AppText>
      </AppText>
      <AppText style={styles.text}>
        {t("time_of_payment")}
        <AppText style={styles.textBold}>{paymentTime}</AppText>
      </AppText>
      <AppText style={styles.text}>
        {t("payment_method")}
        <AppText style={styles.textBold}>{paymentMethod}</AppText>
      </AppText>
      <AppText style={styles.text}>
        {t("recipient")}
        <AppText style={styles.textBold}>{recipient}</AppText>
      </AppText>
      <AppText style={styles.text}>
        {t("address")}
        <AppText style={styles.textBold}>{address}</AppText>
      </AppText>
      <AppText style={styles.text}>
        {t("email_address")}
        <AppText style={styles.textBold}>usupport@7digit.io</AppText>
      </AppText>
      <Line />
      <AppText style={styles.text}>
        {t("price")}
        <AppText style={styles.textBold}>
          {price} {currencySymbol}
        </AppText>
      </AppText>
      <AppButton
        type="primary"
        label={t("view_receipt")}
        size="lg"
        onPress={() => handleViewReceiptButtonClick(receipt_url)}
        style={styles.button}
      />
    </TransparentModal>
  );
};

const styles = StyleSheet.create({
  text: { marginTop: 4 },
  textBold: { fontFamily: appStyles.fontBold },
  button: { marginTop: 16 },
});
