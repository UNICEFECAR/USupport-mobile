import React, { useState, useEffect, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trans, useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View, Modal } from "react-native";
import Joi from "joi";

import { PrivacyPolicy } from "../PrivacyPolicy";

import {
  AccessToken,
  AppButton,
  AppText,
  Block,
  ButtonWithIcon,
  Dropdown,
  Error,
  Heading,
  Input,
  Loading,
  ProfilePicturePreview,
  Toggle,
  TransparentModal,
} from "#components";

import { appStyles } from "#styles";

import {
  useGetClientData,
  useUpdateClientData,
  useLogout,
  useGetTheme,
} from "#hooks";
import { localStorage, clientSvc } from "#services";
import { validate, validateProperty, showToast } from "#utils";

/**
 * UserDetails
 *
 * User Details block
 *
 * @return {jsx}
 */
export const UserDetails = ({
  openChangePasswordBackdrop,
  openDeleteAccountBackdrop,
  openSelectAvatarBackdrop,
  openDeletePictureBackdrop,
  openDeleteChatHistoryBackdrop,
  navigation,
}) => {
  const { colors } = useGetTheme();
  const { t } = useTranslation("user-details");

  const queryClient = useQueryClient();

  const countriesData = queryClient.getQueryData(["countries"]);

  const [clientDataQuery, clientData, oldData, setClientData] =
    useGetClientData();
  const [canSaveChanges, setCanSaveChanges] = useState(false);
  const [errors, setErrors] = useState({});

  const [dataProcessing, setDataProcessing] = useState(null);
  const [dataProcessingModalOpen, setDataProcessingModalOpen] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const defaultSchema = {
    nickname: Joi.string().required().label(t("nickname_error")),
  };
  const [schema, setSchema] = useState(Joi.object(defaultSchema));
  const [schemaObject, setSchemaObject] = useState(defaultSchema);

  useEffect(() => {
    if (!clientDataQuery.isLoading && clientDataQuery.isSuccess) {
      const schemaCopy = { ...schemaObject };
      // If the user has access token  make the email field optional
      if (clientDataQuery.data.accessToken) {
        schemaCopy["email"] = Joi.string()
          .email({ tlds: { allow: false } })
          .allow(null, "", " ")
          .label(t("email_error"));
      } else {
        schemaCopy["email"] = Joi.string()
          .email({ tlds: { allow: false } })
          .required()
          .label(t("email_error"));
      }
      setSchema(Joi.object(schemaCopy));
      setSchemaObject(schemaCopy);
    }
  }, [clientDataQuery.isLoading]);

  useEffect(() => {
    if (clientData && oldData) {
      if (dataProcessing === null) {
        setDataProcessing(clientData.dataProcessing);
      }

      const userDataString = JSON.stringify(clientData);
      const oldDataString = JSON.stringify(oldData);

      setCanSaveChanges(userDataString !== oldDataString);

      // If the email field is empty and the user doesn't have access token
      // then the email field is required and we need to show an error
      if (!clientData.email && !clientData.accessToken) {
        setErrors({ email: t("email_error") });
      }

      if (errors.nickname && clientData.nickname) {
        setErrors({ nickname: "" });
      }

      // If we have errors(from onBlur) and user changes input value
      // or the user has accessToken and the email field is empty
      // remove the error
      if (
        (errors.email && clientData.email) ||
        (clientData.accessToken && !clientData.email)
      ) {
        setErrors({ email: "" });
      }
    }
  }, [clientData, oldData]);

  const nicknameSchema = Joi.object({
    nickname: Joi.string().required().label(t("nickname_error")),
  });

  const emailSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .label(t("email_error")),
  });

  const sexOptions = [
    { label: t("sex_male"), value: "male" },
    { label: t("sex_female"), value: "female" },
    { label: t("sex_unspecified"), value: "unspecified" },
    { label: t("sex_none"), value: "notMentioned" },
  ];

  const urbanRuralOptions = [
    { label: t("place_of_living_urban"), value: "urban" },
    { label: t("place_of_living_rural"), value: "rural" },
  ];

  const [ages, setAges] = useState();
  useEffect(() => {
    if (countriesData) {
      localStorage.getItem("country").then((country) => {
        const selectedCountry = countriesData?.find((c) => c.value === country);
        const minAge = selectedCountry?.minAge;
        const maxAge = selectedCountry?.maxAge;
        setAges({
          minAge,
          maxAge,
        });
      });
    }
  }, [countriesData]);

  // Create an array of year objects from year 1900 to current year
  const getYearsOptions = useCallback(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    if (ages) {
      for (
        let year = currentYear - ages.maxAge;
        year <= currentYear - ages.minAge;
        year++
      ) {
        years.push({ label: year.toString(), value: year });
      }
      return years.reverse();
    }
    return [];
  }, [countriesData, ages]);

  const onUpdateSuccess = () => {
    showToast({
      message: t("success_message"),
    });
  };
  const onUpdateError = (error) => {
    setErrors({ submit: error });
  };
  const userDataMutation = useUpdateClientData(onUpdateSuccess, onUpdateError);

  const openChangePasswordModal = () => setDataProcessingModalOpen(true);

  const closeDataProcessingModal = (shouldUpdateDataProcessing = true) => {
    if (shouldUpdateDataProcessing === true) {
      setDataProcessing(true);
    }
    setDataProcessingModalOpen(false);
  };

  const handleNicknameBlur = () => {
    validateProperty(
      "nickname",
      clientData.nickname,
      nicknameSchema,
      setErrors
    );
  };

  const handleEmailBlur = () => {
    if (
      (clientData.accessToken && clientData.email) ||
      !clientData.accessToken
    ) {
      validateProperty("email", clientData.email, emailSchema, setErrors);
    }
  };

  const handleChange = (field, value) => {
    const dataCopy = { ...clientData };
    dataCopy[field] = value;
    setClientData(dataCopy);
  };

  const handleSave = async () => {
    const dataToValidate = {
      email: clientData.email,
      nickname: clientData.nickname,
    };
    if ((await validate(dataToValidate, schema, setErrors)) === null) {
      userDataMutation.mutate(clientData);
    }
  };

  const handleDiscard = () => {
    setClientData(oldData);
  };

  const updateDataProcessing = async (value) => {
    setDataProcessing(value); // Perform an optimistic update

    const res = await clientSvc.changeDataProcessingAgreement(value);
    return res.data.data_processing;
  };

  const updateDataProcessingMutation = useMutation(updateDataProcessing, {
    onSuccess: (data) => {
      setDataProcessing(data);
      closeDataProcessingModal(false);
      queryClient.invalidateQueries({ queryKey: ["client-data"] });
    },
    onError: (error) => {
      setDataProcessing((prev) => !prev); // Revert the optimistic update
    },
  });

  const handleToggleClick = () => {
    setDataProcessing(!dataProcessing);
    if (dataProcessing) {
      openChangePasswordModal();
    } else {
      // Change the dataProcessing value to true
      updateDataProcessingMutation.mutate(true);
    }
  };

  const logoutMutation = useLogout();

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Disable the save button IF:
  // 1. The user doesn't have access token and the email field is empty
  // 2. The nickname field is empty
  // 3. There are email or nickname errors in the state
  // canSaveChanges variable is true only if the user has made any changes to the original data
  const isSaveDisabled =
    (!clientData?.email && !clientData?.accessToken) ||
    errors.email ||
    errors.nickname ||
    !clientData?.nickname
      ? true
      : !canSaveChanges;

  return (
    <Block style={styles.block}>
      <Heading heading={t("heading")} handleGoBack={handleGoBack} />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {clientDataQuery.isLoading || !clientData ? (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
            }}
          >
            <Loading style={{ alignSelf: "center" }} />
          </View>
        ) : (
          <>
            <ProfilePicturePreview
              image={clientData.image}
              handleDeleteClick={openDeletePictureBackdrop}
              handleChangeClick={openSelectAvatarBackdrop}
              changePhotoText={t("change_photo")}
              style={styles.profilePicturePreview}
            />
            {clientData.accessToken ? (
              <AccessToken
                accessToken={clientData.accessToken}
                accessTokenLabel={t("access_token")}
                successLabel={t("access_token_copy")}
                classes="user-details__grid-item__access-token"
                style={styles.accessToken}
              />
            ) : null}

            <View style={[styles.inputsContainer, styles.zIndex3]}>
              <Input
                value={clientData.name}
                label={t("name")}
                onChange={(value) => handleChange("name", value)}
                placeholder={t("name_placeholder")}
                style={styles.input}
                autoCapitalize={true}
              />

              <Input
                value={clientData.surname}
                label={t("surname")}
                onChange={(value) => handleChange("surname", value)}
                placeholder={t("surname_placeholder")}
                style={styles.input}
                autoCapitalize={true}
              />

              <Input
                label={t("nickname") + "*"}
                value={clientData.nickname}
                onChange={(value) => handleChange("nickname", value)}
                onBlur={handleNicknameBlur}
                placeholder={t("nickname_placeholder")}
                errorMessage={errors.nickname}
                style={styles.input}
              />

              <Input
                label={t("email") + (!clientData.accessToken ? "*" : "")}
                value={clientData.email}
                autoCapitalize="none"
                onChange={(value) => handleChange("email", value)}
                onBlur={handleEmailBlur}
                placeholder={t("email_placeholder")}
                errorMessage={errors.email}
                style={styles.input}
              />

              <Dropdown
                options={sexOptions}
                selected={clientData.sex}
                setSelected={(option) => handleChange("sex", option)}
                label={t("sex")}
                style={[styles.input, styles.zIndex5]}
                dropdownId={"sex"}
                placeholder={t("sex_placeholder")}
              />

              <Dropdown
                options={getYearsOptions()}
                selected={clientData.yearOfBirth}
                setSelected={(option) => handleChange("yearOfBirth", option)}
                label={t("year_of_birth")}
                style={[styles.input, styles.zIndex4]}
                dropdownId={"yearOfBirth"}
                placeholder={t("year_of_birth_placeholder")}
              />

              <Dropdown
                options={urbanRuralOptions}
                selected={clientData.urbanRural}
                setSelected={(option) => handleChange("urbanRural", option)}
                label={t("living_place")}
                style={[styles.input, styles.zIndex3]}
                dropdownId={"livingOfPlace"}
                placeholder={t("living_place_placeholder")}
              />
            </View>

            {errors.submit ? <Error message={errors.submit} /> : null}

            <View style={styles.buttonContainer}>
              <AppButton
                label={t("button_text")}
                size="lg"
                onPress={handleSave}
                disabled={isSaveDisabled}
                loading={userDataMutation.isLoading}
              />

              <AppButton
                type="secondary"
                label={t("button_secondary_text")}
                size="lg"
                disabled={!canSaveChanges}
                onPress={handleDiscard}
                style={styles.button}
              />
            </View>

            <View style={styles.privacyPolicyContainer}>
              <AppText
                style={[styles.privacyPolicyText, { color: colors.text }]}
              >
                {t("privacy")}
              </AppText>

              <View style={styles.toggleContainer}>
                <AppText
                  namedStyle="text"
                  style={{ color: colors.textSecondary }}
                >
                  <Trans
                    components={[
                      <AppText
                        style={{
                          color: appStyles.colorPrimary_20809e,
                        }}
                        isBold
                        onPress={() => setShowPrivacyPolicy(true)}
                      />,
                    ]}
                  >
                    {t("consent")}
                  </Trans>
                </AppText>
                <Toggle
                  isToggled={dataProcessing ? true : false}
                  handleToggle={handleToggleClick}
                />
              </View>
            </View>

            <View>
              <AppButton
                type="ghost"
                label={t("change_password")}
                onPress={openChangePasswordBackdrop}
                size="lg"
                style={styles.textButton}
              />
              <ButtonWithIcon
                iconName="exit"
                iconSize="md"
                size="lg"
                iconColor={appStyles.colorPrimary_20809e}
                label={t("logout")}
                type="ghost"
                onPress={logoutMutation.mutate}
                style={styles.textButton}
              />
              <ButtonWithIcon
                iconName={"circle-actions-close"}
                iconSize={"md"}
                size="lg"
                iconColor={"#eb5757"}
                color={"red"}
                label={t("delete_account")}
                type={"ghost"}
                onPress={openDeleteAccountBackdrop}
                style={styles.textButton}
              />
              <ButtonWithIcon
                iconName={"circle-actions-close"}
                iconSize={"md"}
                size="lg"
                iconColor={"#eb5757"}
                color={"red"}
                label={t("delete_chat")}
                type={"ghost"}
                onPress={openDeleteChatHistoryBackdrop}
                style={[styles.textButton, styles.marginBottom20]}
              />
            </View>
          </>
        )}
      </ScrollView>
      <TransparentModal
        isOpen={dataProcessingModalOpen}
        handleClose={() => closeDataProcessingModal(true)}
        heading={
          <Trans
            components={[
              <AppText
                style={{
                  color: appStyles.colorPrimary_20809e,
                }}
                isBold
                onPress={() => setShowPrivacyPolicy(true)}
              />,
            ]}
          >
            {t("data_processing_modal_heading")}
          </Trans>
        }
        text={t("data_processing_modal_text")}
        ctaLabel={t("data_processing_modal_confirm_button")}
        ctaHandleClick={() => {
          updateDataProcessingMutation.mutate(false);
        }}
        isCtaLoading={updateDataProcessingMutation.isLoading}
        secondaryCtaLabel={t("data_processing_modal_cancel_button")}
        secondaryCtaType="secondary"
        secondaryCtaHandleClick={() => closeDataProcessingModal(true)}
      />
      {showPrivacyPolicy && (
        <Modal style={{}} open={showPrivacyPolicy} animationType="slide">
          <PrivacyPolicy
            isModal
            handleModalClose={() => setShowPrivacyPolicy(false)}
          />
        </Modal>
      )}
    </Block>
  );
};

const styles = StyleSheet.create({
  block: { flex: 1 },
  profilePicturePreview: { alignSelf: "center", marginTop: 84 },
  accessToken: {
    marginTop: 20,
    width: "93%",
    alignItems: "center",
  },
  inputsContainer: {
    paddingTop: 8,
    alignItems: "center",
  },
  input: { marginTop: 24 },
  buttonContainer: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 20,
  },
  button: { marginTop: 16 },
  privacyPolicyContainer: {
    paddingTop: 20,
    width: "93%",
    alignSelf: "center",
  },
  privacyPolicyText: {
    fontFamily: "Nunito_600SemiBold",
    color: appStyles.colorBlue_3d527b,
    fontSize: 18,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 4,
    paddingBottom: 32,
  },
  textButton: {
    marginTop: 20,
    justifyContent: "flex-start",
  },
  zIndex5: { zIndex: 5 },
  zIndex4: { zIndex: 4 },
  zIndex3: { zIndex: 3 },
  marginBottom20: { marginBottom: 20 },
});
