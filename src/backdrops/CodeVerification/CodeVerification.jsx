import React, { useState, useEffect, useRef } from "react";
import { TextInput, View, StyleSheet } from "react-native";
import { Backdrop, AppText } from "#components";
import { useTranslation } from "react-i18next";
import { appStyles } from "#styles";

export default function CodeVerification({
  isOpen,
  onClose,
  showTimer,
  resendTimer,
  handleRegister,
  requestOTP,
  canRequestOTP,
  submitError,
  isMutating,
}) {
  const { t } = useTranslation("code-verification");
  useEffect(() => {
    data[0].reference.current?.focus();
  }, []);

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
    if (!nextIndex) {
    }
  };

  // This function changes the focus to the previous input box
  // if the backspace/delete key is pressed when there is no
  // text in the current box
  const goToPreviousBox = (previousIndex, keyValue) => {
    const dataCopy = [...data];
    previousIndex !== null && keyValue === "Backspace"
      ? dataCopy[previousIndex].reference.current?.focus()
      : null;
  };

  const handleResendCode = () => {
    requestOTP();
  };

  return (
    <Backdrop
      isOpen={isOpen}
      onClose={onClose}
      heading={t("heading")}
      text={t("text")}
      ctaLabel={t("send")}
      ctaHandleClick={() => handleRegister(pinValue.current)}
      errorMessage={submitError}
      isCtaLoading={isMutating}
      footerComponent={
        <View style={{ marginTop: 12, flexDirection: "row" }}>
          <AppText>{t("didnt_get_code")} </AppText>
          {canRequestOTP ? (
            <AppText
              onPress={handleResendCode}
              style={{ color: appStyles.colorPrimary_20809e }}
            >
              {t("resend")}
            </AppText>
          ) : (
            <AppText
              style={{ color: appStyles.colorPrimary_20809e, opacity: 0.8 }}
            >
              {t("resend")}
            </AppText>
          )}
          <AppText> </AppText>
          <AppText>
            {showTimer ? t("seconds", { seconds: resendTimer }) : ""}
          </AppText>
        </View>
      }
    >
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
    </Backdrop>
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
});

export { CodeVerification };
