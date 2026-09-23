import React, { useState } from "react";
import { View, Linking, StyleSheet, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CheckBox } from "../../inputs";
import { AppText } from "../../texts";
import { appStyles } from "#styles";
import { useGetTheme } from "#hooks";
import { PrivacyPolicy } from "../../../blocks/PrivacyPolicy";
import { TermsOfUse } from "../../../blocks/TermsOfUse";

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
  // Used when rendered outside a navigator (e.g. the auth modals),
  // where there is no navigation object to push the policy screens
  const [openPolicy, setOpenPolicy] = useState(null);

  const openPolicyPage = (screen) => {
    if (navigation) {
      navigation.navigate(screen);
    } else {
      setOpenPolicy(screen);
    }
  };

  const closePolicy = () => setOpenPolicy(null);

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
            onPress={() => openPolicyPage("PrivacyPolicy")}
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
            onPress={() => openPolicyPage("TermsOfUse")}
            style={styles.purpleText}
          >
            {textFour}
          </AppText>
        )}
      </AppText>
      <Modal
        visible={!!openPolicy}
        animationType="slide"
        onRequestClose={closePolicy}
      >
        <SafeAreaView
          style={[styles.policyModal, { backgroundColor: colors.background }]}
        >
          {openPolicy === "PrivacyPolicy" && (
            <PrivacyPolicy isModal handleModalClose={closePolicy} />
          )}
          {openPolicy === "TermsOfUse" && (
            <TermsOfUse isModal handleModalClose={closePolicy} />
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  policyModal: {
    flex: 1,
  },
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
