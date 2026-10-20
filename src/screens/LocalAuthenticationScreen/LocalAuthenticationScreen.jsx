import React, { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import * as LocalAuthentication from "expo-local-authentication";
import BcryptReactNative from "bcrypt-react-native";
import { TextInput } from "react-native-gesture-handler";

import { Icon, Screen, AppText, Error } from "#components";
import { localStorage } from "#services";
import { appStyles } from "#styles";
import { useGetTheme } from "#hooks";

const PIN_LENGTH = 4;

export function LocalAuthenticationScreen({
  userPin,
  setHasAuthenticatedWithPin,
}) {
  const { colors, isHighContrast } = useGetTheme();
  const { t } = useTranslation("screens", {
    keyPrefix: "local-authentication-screen",
  });
  const [pin, setPin] = useState("");
  const inputRef = useRef(null);

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
      const hasEnabledBiometrics =
        await localStorage.getItem("biometrics-enabled");
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
    inputRef.current?.focus();
  }, []);

  const changeText = async (text) => {
    const newPin = text.replace(/\D/g, "").slice(0, PIN_LENGTH);
    setPin(newPin);

    if (newPin.length === PIN_LENGTH) {
      const areEqual = await BcryptReactNative.compareSync(
        String(newPin),
        userPin
      );
      if (!areEqual) {
        clearPin();
        setError(true);
      } else {
        setHasAuthenticatedWithPin(true);
      }
    }
  };

  const clearPin = () => {
    setPin("");
    inputRef.current?.focus();
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
          {Array.from({ length: PIN_LENGTH }, (_, index) => (
            <View
              key={index}
              style={[styles.box, { backgroundColor: colors.card }]}
            >
              <Text
                style={[styles.boxText, isHighContrast ? styles.boxTextHC : {}]}
                maxFontSizeMultiplier={appStyles.maxFontSizeMultiplier}
              >
                {pin[index] ? (isPinVisible ? pin[index] : "•") : ""}
              </Text>
            </View>
          ))}
          {/* A single input laid over the boxes; the boxes only display its characters */}
          <TextInput
            autoFocus
            ref={inputRef}
            value={pin}
            onChangeText={changeText}
            secureTextEntry
            keyboardType="number-pad"
            maxLength={PIN_LENGTH}
            caretHidden
            contextMenuHidden
            style={styles.hiddenInput}
          />
        </View>

        {error ? (
          <Error style={styles.errorMessage} message={t("wrong_pin")} />
        ) : null}
        <TouchableOpacity onPress={() => setIsPinVisible(!isPinVisible)}>
          <View style={styles.viewPinButton}>
            <Icon
              name={isPinVisible ? "hide" : "view"}
              size="md"
              color={isHighContrast ? "#fff" : appStyles.colorSecondary_9749fa}
            />
            <AppText
              style={[
                styles.viewPinButtonText,
                isHighContrast ? { color: "#fff" } : null,
              ]}
            >
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
  boxTextHC: {
    color: "#ffff00",
  },
  hiddenInput: {
    ...StyleSheet.absoluteFillObject,
    color: "transparent",
    backgroundColor: "transparent",
    opacity: 0.011,
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
