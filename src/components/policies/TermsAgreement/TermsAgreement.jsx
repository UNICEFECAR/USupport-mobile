import React from "react";
import { View, Linking, StyleSheet } from "react-native";
import { CheckBox } from "../../inputs";
import { AppText } from "../../texts";

import { appStyles } from "#styles";

import Config from "react-native-config";
const { WEBSITE_URL } = Config;

export const TermsAgreement = ({
  isChecked,
  setIsChecked,
  textOne,
  textTwo,
  textThree,
  textFour,
}) => {
  return (
    <View style={styles.container}>
      <CheckBox isChecked={isChecked} setIsChecked={setIsChecked} />
      <AppText>
        <AppText namedStyle="text">{textOne}</AppText>
        <AppText
          namedStyle="text"
          onPress={() => {
            Linking.openURL(`${WEBSITE_URL}/privacy-policy`);
          }}
          style={styles.purpleText}
        >
          {` ${textTwo} `}
        </AppText>
        <AppText namedStyle="text">{`${textThree} `}</AppText>
        <AppText
          namedStyle="text"
          onPress={() => {
            Linking.openURL(`${WEBSITE_URL}/terms-of-use`);
          }}
          style={styles.purpleText}
        >
          {textFour}
        </AppText>
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    marginHorizontal: 40,
  },
  purpleText: {
    color: appStyles.colorSecondary_9749fa,
  },
});
