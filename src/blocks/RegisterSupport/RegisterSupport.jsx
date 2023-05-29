import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  Block,
  Heading,
  RadioButtonSelectorGroup,
  AppButton,
  TransparentModal,
  Error,
} from "#components";

import { clientSvc } from "#services";

import { useGetClientData } from "#hooks";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState();

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
      setSubmitError(null);
      setShowError(false);
      setIsSubmitting(false);
      queryClient.invalidateQueries({ queryKey: ["client-data"] });
      setIsModalOpen(false);
    },
    onError: (error) => {
      hasGivenPermission.current = false;
      setIsSubmitting(false);
      const { message: errorMessage } = useError(error);
      setSubmitError(errorMessage);
    },
  });

  const handleGivePermission = () => {
    setIsSubmitting(true);
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
        <TransparentModal
          heading={t("modal_heading")}
          text={t("modal_paragraph")}
          isOpen={isModalOpen}
          handleClose={closeModal}
          ctaLabel={t("modal_cta_1")}
          ctaHandleClick={handleGivePermission}
          isCtaDisabled={isSubmitting}
          secondaryCtaLabel={t("modal_cta_2")}
          secondaryCtaType="secondary"
          secondaryCtaHandleClick={closeModal}
          errorMessage={submitError}
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
