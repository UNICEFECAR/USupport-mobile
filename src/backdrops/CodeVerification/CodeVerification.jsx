import React, { useState, useEffect, useRef } from "react";
import {
  Keyboard,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
  StyleSheet,
} from "react-native";
import { Backdrop, AppText, TransparentModal } from "#components";
import { useTranslation } from "react-i18next";
import { appStyles } from "#styles";
import { ReportIssue } from "#modals";

const CODE_LENGTH = 4;

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

  const [code, setCode] = useState("");
  const inputRef = useRef(null);

  const focusInput = () => {
    const input = inputRef.current;
    if (!input) return;
    // When the keyboard was closed (back button, swipe down) or the focus
    // happened before the modal was on screen, the input is still focused but
    // without a keyboard - focus() is a no-op then, so refocus it from scratch
    if (input.isFocused() && !Keyboard.isVisible()) {
      input.blur();
    }
    input.focus();
  };

  useEffect(() => {
    if (!isOpen) return;
    setCode("");
    // Wait for the modal/backdrop to be on screen, otherwise the input is
    // focused but the keyboard doesn't open
    const timeout = setTimeout(focusInput, 400);
    return () => clearTimeout(timeout);
  }, [isOpen]);

  const changeText = (text) => {
    const newCode = text.replace(/\D/g, "").slice(0, CODE_LENGTH);
    setCode(newCode);

    // Automatically submit once the whole code is entered
    if (newCode.length === CODE_LENGTH && !isMutating) {
      handleRegister(newCode);
    }
  };

  const handleResendCode = () => {
    requestOTP();
  };

  const goBack = handleGoBack ?? onClose;

  // A single hidden input behind the boxes; the boxes only display its
  // characters and focus it on press
  const pinInputs = (
    <Pressable
      style={styles.codeContainer}
      onPress={focusInput}
      accessible={false}
    >
      {Array.from({ length: CODE_LENGTH }, (_, index) => (
        <View key={index} style={styles.box}>
          <Text
            style={styles.boxText}
            maxFontSizeMultiplier={appStyles.maxFontSizeMultiplier}
          >
            {code[index] || ""}
          </Text>
        </View>
      ))}
      {/* Touches go to the Pressable - a tap on the already focused input
          itself wouldn't reopen a closed keyboard */}
      <View style={styles.hiddenInputWrapper} pointerEvents="none">
        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={changeText}
          keyboardType="number-pad"
          maxLength={CODE_LENGTH}
          textContentType="oneTimeCode"
          autoComplete={
            Platform.OS === "android" ? "sms-otp" : "one-time-code"
          }
          caretHidden
          style={styles.hiddenInput}
        />
      </View>
    </Pressable>
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
          ctaHandleClick={() => handleRegister(code)}
          isCtaLoading={isMutating}
          errorMessage={submitError}
          hasCloseIcon={false}
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
        ctaHandleClick={() => handleRegister(code)}
        errorMessage={submitError}
        isCtaLoading={isMutating}
        footerComponent={footerContent}
        hasKeyboardListener
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
  box: {
    backgroundColor: appStyles.colorWhite_ff,
    margin: 5,
    borderRadius: 19,
    width: 64,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
    ...appStyles.shadow2,
  },
  boxText: {
    textAlign: "center",
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "700",
    color: "#5F549B",
  },
  hiddenInputWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  hiddenInput: {
    ...StyleSheet.absoluteFillObject,
    color: "transparent",
    backgroundColor: "transparent",
    opacity: 0.011,
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
