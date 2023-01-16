import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CheckBox } from "../../inputs";
import { AppText } from "../../texts";

import { appStyles } from "#styles";

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
        <AppText namedStyle="text" style={styles.purpleText}>
          {` ${textTwo} `}
        </AppText>
        <AppText namedStyle="text">{`${textThree} `}</AppText>
        <AppText namedStyle="text" style={styles.purpleText}>
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
