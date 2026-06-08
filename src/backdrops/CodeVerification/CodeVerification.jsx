import React, { useState, useEffect, useRef } from "react";
import { TextInput, View, StyleSheet } from "react-native";
import { Backdrop, AppText, TransparentModal } from "#components";
import { useTranslation } from "react-i18next";
import { appStyles } from "#styles";
import { ReportIssue } from "#modals";

export default function CodeVerification({
  isOpen,
  onClose,
  handleGoBack,
  inAuthFlow = false,
  showTimer,
  resendTimer,
  handleRegister,
  requestOTP,
  canRequestOTP,
  submitError,
  isMutating,
  email = "",
}) {
  const { t } = useTranslation("backdrops", { keyPrefix: "code-verification" });
  const [isReportIssueOpen, setIsReportIssueOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsReportIssueOpen(false);
    }
  }, [isOpen]);

  const [data, setData] = useState([
    {
      name: "first",
      value: "",
      reference: useRef(null),
      previousIndex: null,
      nextIndex: 1,
    },
    {
      name: "second",
      value: "",
      reference: useRef(null),
      previousIndex: 0,
      nextIndex: 2,
    },
    {
      name: "third",
      value: "",
      reference: useRef(null),
      previousIndex: 1,
      nextIndex: 3,
    },
    {
      name: "fourth",
      value: "",
      reference: useRef(null),
      previousIndex: 2,
      nextIndex: null,
    },
  ]);

  useEffect(() => {
    if (isOpen) {
      data[0].reference.current?.focus();
    }
  }, [isOpen]);

  const pinValue = useRef();

  const changeText = async (currentIndex, text, nextIndex) => {
    const dataCopy = [...data];
    if (text !== "") {
      nextIndex !== null
        ? dataCopy[nextIndex].reference.current?.focus()
        : null;
    }
    dataCopy[currentIndex].value = text;
    pinValue.current = dataCopy.map((x) => x.value).join("");

    setData(dataCopy);
  };

  const goToPreviousBox = (previousIndex, keyValue) => {
    const dataCopy = [...data];
    previousIndex !== null && keyValue === "Backspace"
      ? dataCopy[previousIndex].reference.current?.focus()
      : null;
  };

  const handleResendCode = () => {
    requestOTP();
  };

  const goBack = handleGoBack ?? onClose;

  const pinInputs = (
    <View style={styles.codeContainer}>
      {data.map((box, index) => {
        return (
          <TextInput
            key={box.name}
            value={box.value}
            ref={box.reference}
            keyboardType={"numeric"}
            maxLength={1}
            onChangeText={(newText) =>
              changeText(index, newText, box.nextIndex)
            }
            onKeyPress={({ nativeEvent: { key: keyValue } }) =>
              goToPreviousBox(box.previousIndex, keyValue)
            }
            maxFontSizeMultiplier={appStyles.maxFontSizeMultiplier}
            style={styles.textInput}
          />
        );
      })}
    </View>
  );

  const footerContent = (
    <View style={styles.footer}>
      <AppText style={styles.footerTextCenter}>{t("didnt_get_code")} </AppText>
      <View style={styles.footerActions}>
        {canRequestOTP ? (
          <AppText onPress={handleResendCode} style={styles.linkText}>
            {t("resend")}
          </AppText>
        ) : (
          <AppText>{t("resend")}</AppText>
        )}
        {showTimer && (
          <AppText>{t("seconds", { seconds: resendTimer })}</AppText>
        )}
      </View>
      <View style={styles.reportIssueRow}>
        <AppText style={styles.footerTextCenter}>{t("report_issue_text")} </AppText>
        <AppText
          onPress={() => setIsReportIssueOpen(true)}
          style={styles.linkText}
        >
          {t("report_issue_cta")}
        </AppText>
      </View>
    </View>
  );

  if (inAuthFlow) {
    return (
      <>
        <TransparentModal
          isOpen={isOpen}
          handleClose={goBack}
          heading={t("heading")}
          text={t("text")}
          ctaLabel={t("send")}
          ctaHandleClick={() => handleRegister(pinValue.current)}
          isCtaLoading={isMutating}
          errorMessage={submitError}
          hasCloseIcon={false}
          scrollableBody={false}
        >
          {pinInputs}
          {footerContent}
        </TransparentModal>

        <ReportIssue
          isOpen={isReportIssueOpen}
          onClose={() => setIsReportIssueOpen(false)}
          initialEmail={email}
        />
      </>
    );
  }

  return (
    <>
      <Backdrop
        isOpen={isOpen}
        onClose={onClose}
        heading={t("heading")}
        text={t("text")}
        ctaLabel={t("send")}
        ctaHandleClick={() => handleRegister(pinValue.current)}
        errorMessage={submitError}
        isCtaLoading={isMutating}
        footerComponent={footerContent}
      >
        {pinInputs}
      </Backdrop>

      <ReportIssue
        isOpen={isReportIssueOpen}
        onClose={() => setIsReportIssueOpen(false)}
        initialEmail={email}
      />
    </>
  );
}

const styles = StyleSheet.create({
  codeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  textInput: {
    backgroundColor: appStyles.colorWhite_ff,
    margin: 5,
    borderRadius: 19,
    width: 64,
    height: 64,
    textAlign: "center",
    fontSize: 30,
    fontWeight: "700",
    color: "#5F549B",
    ...appStyles.shadow2,
  },
  footer: {
    marginTop: 12,
    flexDirection: "column",
    paddingBottom: 10,
  },
  footerTextCenter: {
    textAlign: "center",
  },
  footerActions: {
    flexDirection: "column",
    alignItems: "center",
  },
  reportIssueRow: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
  },
  linkText: {
    color: appStyles.colorPrimary_20809e,
  },
});

export { CodeVerification };
