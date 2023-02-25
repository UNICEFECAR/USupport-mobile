import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, View, TextInput, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import BcryptReactNative from "bcrypt-react-native";

import { Block, AppText, Icon, AppButton, Error } from "#components";
import { localStorage } from "#services";
import { showToast } from "#utils";
import { appStyles } from "#styles";
/**
 * ChangePasscode
 *
 * ChangePasscode screen
 *
 * @returns {JSX.Element}
 */
export const ChangePasscode = ({ navigation, route }) => {
  const { t } = useTranslation("change-passcode");

  let { userPin, oldPin, isRemove } = route.params;
  const heading = userPin
    ? t("enter_passcode")
    : oldPin
    ? t("confirm_passcode")
    : t("create_passcode");

  const [isPinVisible, setIsPinVisible] = useState(false);
  const [error, setError] = useState(false);

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

  const removePin = async () => {
    await localStorage.removeItem("pin-code");
    showToast({
      message: t("remove_success"),
    });
    navigation.goBack();
  };

  const submitPin = async () => {
    const salt = await BcryptReactNative.getSalt(10);
    const hashedPin = await BcryptReactNative.hash(salt, pinValue.current);

    try {
      await localStorage.setItem("pin-code", hashedPin);
      showToast({
        message: t("success"),
      });
    } catch {
      showToast({
        message: t("error"),
        type: "error",
      });
    } finally {
      navigation.navigate("Passcode");
    }
  };

  const clearPin = () => {
    let dataCopy = [...data];
    dataCopy.forEach((item, index) => {
      dataCopy[index].value = "";
    });
    data[0].reference.current?.focus();
    setData([...dataCopy]);
  };

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
      // If there is no oldPin and no userPin then we are on the initial set pin page
      // and we need to redirect to the confirm pin page
      if (!oldPin && !userPin && text !== "") {
        navigation.push("ChangePasscode", {
          oldPin: pinValue.current,
        });

        // If there is an oldPin then we check if its the same as the currently typed one
        // and if they match, we open the modal, and redirect
      } else if (oldPin) {
        if (oldPin !== pinValue.current) {
          setError(true);
          clearPin();
        } else {
          setError(false);
          submitPin();
        }
      } else if (userPin) {
        const areEqual = await BcryptReactNative.compareSync(
          pinValue.current,
          userPin
        );
        if (!areEqual) {
          setError(true);
          clearPin();
        } else {
          if (isRemove) {
            removePin();
          } else {
            navigation.push("ChangePasscode", {
              isChangePinPage: true,
            });
          }
        }
      }
    }
  };

  const handleContinue = () => {
    navigation.push("ChangePasscode", {
      oldPin: pinValue.current,
    });
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
    <Block style={styles.block}>
      <View>
        <AppText namedStyle="h3">{heading}</AppText>
        <View style={styles.pinContainer}>
          {data.map((box, index) => {
            return (
              <TextInput
                key={box.name}
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
                style={styles.textInput}
              />
            );
          })}
        </View>
        {error ? (
          <Error style={styles.error} message={t("pin_not_matching")} />
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
        {!userPin && !oldPin && data.filter((x) => x.value).length === 4 ? (
          <AppButton
            label="Continue"
            size="lg"
            style={styles.button}
            onPress={handleContinue}
          />
        ) : null}
      </View>
    </Block>
  );
};

const styles = StyleSheet.create({
  block: { flexGrow: 1, justifyContent: "center", alignItems: "center" },
  pinContainer: {
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
  viewPinButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 16,
  },
  viewPinButtonText: { color: appStyles.colorSecondary_9749fa, marginLeft: 5 },
  button: { marginTop: 16 },
  error: { alignSelf: "center", marignTop: 10 },
});
