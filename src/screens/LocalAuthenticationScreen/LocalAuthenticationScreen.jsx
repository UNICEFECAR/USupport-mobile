import React, { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, View, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import * as LocalAuthentication from "expo-local-authentication";
import BcryptReactNative from "bcrypt-react-native";
import { TextInput } from "react-native-gesture-handler";

import { Icon, Screen, AppText, Error } from "#components";
import { localStorage } from "#services";
import { appStyles } from "#styles";
import { useGetTheme } from "#hooks";

export function LocalAuthenticationScreen({
  userPin,
  setHasAuthenticatedWithPin,
}) {
  const { colors } = useGetTheme();
  const { t } = useTranslation("local-authentication-screen");
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

  const [isPinVisible, setIsPinVisible] = useState(false);
  const [error, setError] = useState(false);
  const [hasBiometricsEnabled, setHasBiometricsEnabled] = useState(false);
  const [hasFaceId, setHasFaceId] = useState(false);

  const handleFaceId = () => {
    LocalAuthentication.authenticateAsync({
      disableDeviceFallback: true,
      cancelLabel: "Cancel",
    }).then((result) => {
      if (result.success) setHasAuthenticatedWithPin(true);
    });
  };

  useEffect(() => {
    const biometricAuth = async () => {
      const hasEnabledBiometrics = await localStorage.getItem(
        "biometrics-enabled"
      );
      setHasBiometricsEnabled(hasEnabledBiometrics);

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (hasHardware) {
        const supportedTypes =
          await LocalAuthentication.supportedAuthenticationTypesAsync();
        setHasFaceId(supportedTypes.includes(2));

        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        if (isEnrolled && hasEnabledBiometrics) {
          handleFaceId();
        }
      }
    };
    biometricAuth();
    data[0].reference.current?.focus();
  }, []);

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
      const areEqual = await BcryptReactNative.compareSync(
        String(pinValue.current),
        userPin
      );
      if (!areEqual) {
        clearPinBoxes();
        setError(true);
      } else {
        setHasAuthenticatedWithPin(true);
      }
    }
  };

  const clearPinBoxes = () => {
    let dataCopy = [...data];
    dataCopy.forEach((item, index) => {
      dataCopy[index].value = "";
    });
    data[0].reference.current?.focus();
    setData([...dataCopy]);
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

  return (
    <Screen style={styles.screen} hasEmergencyButton={false}>
      <View style={styles.pinAndTextContainer}>
        {hasFaceId && hasBiometricsEnabled ? (
          <TouchableOpacity
            onPress={handleFaceId}
            style={{ alignSelf: "center", marginBottom: 18 }}
          >
            <Icon name="face-id" color={appStyles.colorPrimary_20809e} />
          </TouchableOpacity>
        ) : null}
        <View style={styles.textAndIconContainer}>
          <AppText style={styles.enterPin}>{t("enter_pin")}</AppText>
        </View>
        <View style={styles.pinContainer}>
          {data.map((box, index) => {
            return (
              <TextInput
                autoFocus={index === 0 ? true : false}
                key={index}
                value={box.value}
                secureTextEntry={!isPinVisible}
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
                style={[styles.textInput, { backgroundColor: colors.card }]}
              />
            );
          })}
        </View>

        {error ? (
          <Error style={styles.errorMessage} message={t("wrong_pin")} />
        ) : null}
        <TouchableOpacity onPress={() => setIsPinVisible(!isPinVisible)}>
          <View style={styles.viewPinButton}>
            <Icon
              name={isPinVisible ? "hide" : "view"}
              size="md"
              color={appStyles.colorSecondary_9749fa}
            />
            <AppText style={styles.viewPinButtonText}>
              {t(isPinVisible ? "hide_pin" : "view_pin")}
            </AppText>
          </View>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: "center",
    alignItems: "center",
  },
  pinAndTextContainer: {
    height: appStyles.screenHeight * 0.4,
    justifyContent: "center",
  },
  textAndIconContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingBottom: 30,
  },
  pinContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  enterPin: {
    alignSelf: "center",
    textAlign: "center",
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
  errorMessage: {
    textAlign: "center",
    marginTop: 5,
  },
  viewPinButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 16,
  },
  viewPinButtonText: { color: appStyles.colorSecondary_9749fa, marginLeft: 5 },
});
