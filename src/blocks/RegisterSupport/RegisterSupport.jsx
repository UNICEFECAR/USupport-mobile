import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  Block,
  Heading,
  RadioButtonSelectorGroup,
  AppButton,
  Error,
} from "#components";

import { clientSvc } from "#services";

import { useGetClientData } from "#hooks";

import { RequireDataAgreement } from "#modals";

import { showToast } from "#utils";

/**
 * RegisterSupport
 *
 * RegisterSupport block
 *
 * @return {jsx}
 */
export const RegisterSupport = ({ navigation }) => {
  const { t } = useTranslation("register-support");

  const queryClient = useQueryClient();

  const clientData = useGetClientData()[1];

  const [data, setData] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showError, setShowError] = useState(false);

  const hasGivenPermission = useRef();

  useEffect(() => {
    if (clientData) {
      hasGivenPermission.current = clientData.dataProcessing;
    }
  }, [clientData]);

  const options = [
    { label: t("answer_yes_label"), value: "yes" },
    { label: t("answer_no_label"), value: "no" },
  ];

  const closeModal = () => {
    setIsModalOpen(false);
    setData(null);
    if (!hasGivenPermission?.current) {
      setShowError(true);
    }
  };

  const updateDataProcessing = async () => {
    hasGivenPermission.current = true;
    await clientSvc.changeDataProcessingAgreement(true);
    return true;
  };
  const updateDataProcessingMutation = useMutation(updateDataProcessing, {
    onSuccess: () => {
      setShowError(false);
      queryClient.invalidateQueries({ queryKey: ["client-data"] });
      setIsModalOpen(false);
    },
    onError: (error) => {
      hasGivenPermission.current = false;
      const { message: errorMessage } = useError(error);
      showToast({
        message: errorMessage,
        type: "error",
      });
    },
  });

  const handleGivePermission = () => {
    updateDataProcessingMutation.mutate();
  };

  const handleChange = (value) => {
    setData(value);
    if (value === "yes" && !hasGivenPermission?.current) {
      setIsModalOpen(true);
    }
  };

  const handleContinue = () => {
    if (data === "yes" && hasGivenPermission?.current) {
      navigation.navigate("SelectProvider");
    } else {
      navigation.navigate("TabNavigation");
    }
  };

  const canContinue = data !== null;

  return (
    <React.Fragment>
      <Heading
        heading={t("heading")}
        handleGoBack={() => navigation.goBack()}
      />
      <Block style={[styles.flex1, styles.alignItemsCenter, { marginTop: 48 }]}>
        <RadioButtonSelectorGroup
          name="doYouNeedHelp"
          options={options}
          selected={data}
          setSelected={handleChange}
          style={styles.radioButtonSelectorGroup}
        />
        {showError ? <Error message={t("error")} /> : null}
        <View
          style={[
            styles.buttonContainer,
            styles.flex1,
            styles.alignItemsCenter,
          ]}
        >
          <AppButton
            disabled={!canContinue}
            label={t("button_continue_label")}
            size="lg"
            onPress={() => handleContinue()}
          />
        </View>
        <RequireDataAgreement
          isOpen={isModalOpen}
          onClose={closeModal}
          onGivePermission={handleGivePermission}
          isLoading={updateDataProcessingMutation.isLoading}
        />
      </Block>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  radioButtonSelectorGroup: {
    marginTop: 20,
  },
  flex1: {
    flex: 1,
  },
  alignItemsCenter: {
    alignItems: "center",
  },
  buttonContainer: {
    justifyContent: "flex-end",
    width: "100%",
    marginBottom: 24,
  },
});
