import React from "react";
import { View, Linking, StyleSheet } from "react-native";

import { CheckBox } from "../../inputs";
import { AppText } from "../../texts";
import { appStyles } from "#styles";
import { useGetTheme } from "#hooks";

import Config from "react-native-config";
const { WEBSITE_URL } = Config;

export const TermsAgreement = ({
  isChecked,
  setIsChecked,
  textOne,
  textTwo,
  navigation,
  textThree,
  textFour,
  style,
}) => {
  const { colors } = useGetTheme();

  return (
    <View style={[styles.container, style]}>
      <CheckBox
        isChecked={isChecked}
        setIsChecked={setIsChecked}
        style={styles.checkbox}
      />
      <AppText>
        <AppText namedStyle="text" style={{ color: colors.text }}>
          {textOne}
        </AppText>
        {textTwo && (
          <AppText
            namedStyle="text"
            onPress={() => {
              navigation.navigate("PrivacyPolicy");
            }}
            style={styles.purpleText}
          >
            {` ${textTwo} `}
          </AppText>
        )}
        {textThree && (
          <AppText
            namedStyle="text"
            style={{ color: colors.text }}
          >{`${textThree} `}</AppText>
        )}
        {textFour && (
          <AppText
            namedStyle="text"
            onPress={() => {
              navigation.navigate("TermsOfUse");
            }}
            style={styles.purpleText}
          >
            {textFour}
          </AppText>
        )}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  checkbox: {
    marginTop: 4,
  },
  container: {
    alignItems: "flex-start",
    alignSelf: "flex-start",
    flexDirection: "row",
  },
  purpleText: {
    color: appStyles.colorSecondary_9749fa,
  },
});
