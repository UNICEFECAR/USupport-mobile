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

import { validateProperty, validate } from "#utils";

import { localStorage } from "#services";

import { appStyles } from "#styles";

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

  const onMutateSuccess = () => {
    navigation.push("RegisterSupport");
  };

  const onMutateError = (error) => {
    setErrors({ submit: error });
  };

  const updateClientDetailsMutation = useUpdateClientData(
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
    if ((await validate(data, schema, setErrors)) === null) {
      updateClientDetailsMutation.mutate({
        ...data,
        email: clientData?.email,
        nickname: clientData?.nickname,
      });
    }
  };

  const canContinue = data.sex && data.yearOfBirth && data.urbanRural;

  return (
    <Block style={styles.flex1}>
      <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
        <Heading
          heading={t("heading")}
          hasGoBackArrow={false}
          style={styles.heading}
        />

        <View style={styles.inputContainer}>
          <Input
            autoCapitalize={true}
            label={t("input_name_label")}
            placeholder={t("input_name_placeholder")}
            name="name"
            onChange={(value) => handleSelect("name", value)}
            value={data.name}
            onBlur={() => handleBlur("name")}
            style={styles.marginBottom24}
          />
          <Input
            autoCapitalize={true}
            label={t("input_surname_label")}
            placeholder={t("input_surname_placeholder")}
            name="surname"
            onChange={(value) => handleSelect("surname", value)}
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
            dropdownId="registerSex"
          />
          <Dropdown
            options={getYearsOptions()}
            selected={data.yearOfBirth}
            errorMessage={errors.yearOfBirth}
            setSelected={(option) => handleSelect("yearOfBirth", option)}
            label={t("dropdown_year_label")}
            style={[styles.marginBottom24, styles.backdrop2]}
            dropdownId="registerYob"
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
            disabled={!canContinue}
            loading={updateClientDetailsMutation.isLoading}
            size="lg"
            label={t("button_continue_label")}
            onPress={() => handleContinue()}
          />
        </View>
      </ScrollView>
    </Block>
  );
};

const styles = StyleSheet.create({
  heading: { marginLeft: 10 },
  flex1: { flex: 1 },
  inputContainer: { alignItems: "center" },
  marginBottom24: { marginBottom: 24 },
  backdrop1: { zIndex: 3 },
  backdrop2: { zIndex: 2 },
  buttonContainer: {
    flexGrow: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 24,
  },
  scrollViewContentContainer: {
    flex: 1,
    flexGrow: 1,
  },
});
