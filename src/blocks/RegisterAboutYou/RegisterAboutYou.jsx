import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import Joi from "joi";

import {
  Block,
  Heading,
  Input,
  Dropdown,
  RadioButtonSelectorGroup,
  AppButton,
} from "#components";

import { useUpdateClientData, useGetClientData } from "#hooks";

import { localStorage } from "#services";

/**
 * RegisterAboutYou
 *
 * RegisterAboutYou block
 *
 * @return {jsx}
 */
export const RegisterAboutYou = ({ navigation }) => {
  const { t } = useTranslation("register-about-you");

  const queryClient = useQueryClient();
  const countriesData = queryClient.getQueryData(["countries"]);

  const schema = Joi.object({
    name: Joi.string().allow(null, "", " ").label(t("nickname_error")),
    surname: Joi.string().allow(null, "", " ").label(t("nickname_error")),
    sex: Joi.string().invalid(null).label(t("sex_error")),
    yearOfBirth: Joi.number().invalid(null).label(t("year_of_birth_error")),
    urbanRural: Joi.string().invalid(null).label(t("place_of_living_error")),
  });

  const clientData = useGetClientData()[1];

  const sexOptions = [
    { label: t("sex_male"), value: "male" },
    { label: t("sex_female"), value: "female" },
    { label: t("sex_unspecified"), value: "unspecified" },
    { label: t("sex_none"), value: "none" },
  ];

  const urbanRuralOptions = [
    { label: t("place_of_living_urban"), value: "urban" },
    { label: t("place_of_living_rural"), value: "rural" },
  ];

  const [data, setData] = useState({
    name: "",
    surname: "",
    sex: "",
    yearOfBirth: "",
    urbanRural: "",
  });

  useEffect(() => {
    if (clientData) {
      setData({
        name: clientData.name,
        surname: clientData.surname,
        sex: clientData.sex,
        yearOfBirth: clientData.yearOfBirth,
        urbanRural: clientData.urbanRural,
      });
    }
  }, [clientData]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const country = localStorage.getItem("country");
  const selectedCountry = countriesData?.find((c) => c.value === country);
  const minAge = selectedCountry?.minAge;
  const maxAge = selectedCountry?.maxAge;
  // Create an array of year objects from year 1900 to current year
  const getYearsOptions = useCallback(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (
      let year = currentYear - maxAge;
      year <= currentYear - minAge;
      year++
    ) {
      years.push({ label: year.toString(), value: year });
    }
    return years.reverse();
  }, [countriesData]);
  const onMutateSuccess = () => {
    navigate("/register/support");
  };

  const onMutateError = (error) => {
    setErrors({ submit: error });
    setIsSubmitting(false);
  };

  // Make sure we get the freshest data before sending it to the mutation function
  const getDataToSend = useCallback(() => {
    return {
      ...data,
      email: clientData?.email,
      nickname: clientData?.nickname,
    };
  }, [clientData, data]);

  const updateClientDetailsMutation = useUpdateClientData(
    getDataToSend(),
    onMutateSuccess,
    onMutateError
  );

  const handleBlur = (field) => {
    validateProperty(field, data[field], schema, setErrors);
  };

  const handleSelect = (field, value) => {
    const newData = { ...data };

    newData[field] = value;

    setData(newData);
  };

  const handleContinue = async () => {
    setIsSubmitting(true);

    if ((await validate(data, schema, setErrors)) === null) {
      updateClientDetailsMutation.mutate();
    } else {
      setIsSubmitting(false);
    }
  };

  const canContinue = data.sex && data.yearOfBirth && data.urbanRural;

  return (
    <Block style={styles.flex1}>
      <ScrollView contentContainerStyle={styles.flex1}>
        <Heading
          heading={t("heading")}
          handleGoBack={() => navigation.goBack()}
        />

        <View style={styles.inputContainer}>
          <Input
            label={t("input_name_label")}
            placeholder={t("input_name_placeholder")}
            name="name"
            onChange={(e) => handleSelect("name", e.currentTarget.value)}
            value={data.name}
            onBlur={() => handleBlur("name")}
            style={styles.marginBottom24}
          />
          <Input
            label={t("input_surname_label")}
            placeholder={t("input_surname_placeholder")}
            name="surname"
            onChange={(e) => handleSelect("surname", e.currentTarget.value)}
            value={data.surname}
            onBlur={() => handleBlur("surname")}
            style={styles.marginBottom24}
          />
          <Dropdown
            options={sexOptions}
            selected={data.sex}
            errorMessage={errors.sex}
            setSelected={(option) => handleSelect("sex", option)}
            label={t("dropdown_sex_label")}
            style={[styles.marginBottom24, styles.backdrop1]}
          />
          <Dropdown
            options={getYearsOptions()}
            selected={data.yearOfBirth}
            errorMessage={errors.yearOfBirth}
            setSelected={(option) => handleSelect("yearOfBirth", option)}
            label={t("dropdown_year_label")}
            style={[styles.marginBottom24, styles.backdrop2]}
          />
          <RadioButtonSelectorGroup
            name="urbanRural"
            label={t("living_place_label")}
            options={urbanRuralOptions}
            selected={data.urbanRural}
            errorMessage={errors.urbanRural}
            setSelected={(option) => handleSelect("urbanRural", option)}
            style={styles.marginBottom24}
          />
        </View>

        <View style={styles.buttonContainer}>
          <AppButton
            disabled={!canContinue || isSubmitting}
            size="lg"
            label={t("button_continue_label")}
            onClick={() => handleContinue()}
          />
        </View>
      </ScrollView>
    </Block>
  );
};

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  inputContainer: {
    alignItems: "center",
  },
  marginBottom24: {
    marginBottom: 24,
  },
  backdrop1: { zIndex: 3 },
  backdrop2: { zIndex: 2 },
  buttonContainer: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  scrollViewContentContainer: {
    flexGrow: 1,
  },
});
