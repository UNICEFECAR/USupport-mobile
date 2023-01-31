import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import {
  Backdrop,
  CheckBoxGroup,
  Input,
  Dropdown,
  AppText,
  Toggle,
} from "#components";
import { appStyles } from "#styles";

import { languageSvc } from "#services";

/**
 * FilterProviders
 *
 * The FilterProviders backdrop
 *
 * @return {jsx}
 */
export const FilterProviders = ({ isOpen, onClose }) => {
  const { t } = useTranslation("filter-providers");

  const fetchLanguages = async () => {
    const res = await languageSvc.getAllLanguages();
    const languages = res.data.map((x) => {
      const languageObject = {
        value: x["language_id"],
        alpha2: x.alpha2,
        label: x.name,
        id: x["language_id"],
      };
      return languageObject;
    });
    return languages;
  };
  const languagesQuery = useQuery(["languages"], fetchLanguages, {
    retry: false,
  });

  const [data, setData] = useState({
    providerTypes: [],
    providerSex: [],
    maxPrice: "",
    language: null,
    onlyFreeConsultation: false,
  });

  const [providerTypes, setProviderTypes] = useState([
    {
      label: t("provider_psychologist"),
      value: "psychologist",
      isSelected: false,
    },
    {
      label: t("provider_psychotherapist"),
      value: "psychotherapist",
      isSelected: false,
    },
    {
      label: t("provider_psychiatrist"),
      value: "psychiatrist",
      isSelected: false,
    },
  ]);

  const [providerSex, setProviderSex] = useState([
    {
      label: t("male"),
      value: "male",
      isSelected: false,
    },
    { label: t("female"), value: "female", isSelected: false },
    { label: t("unspecified"), value: "unspecified", isSelected: false },
  ]);

  const handleSelect = (field, value) => {
    const dataCopy = { ...data };
    dataCopy[field] = value;
    setData(dataCopy);
  };

  const handleSave = () => {
    const dataCopy = { ...data };
    dataCopy["providerTypes"] = providerTypes
      .filter((x) => x.isSelected)
      .map((x) => x.value);

    dataCopy["providerSex"] = providerSex
      .filter((x) => x.isSelected)
      .map((x) => x.value);

    setData(dataCopy);
    onClose(dataCopy);
  };

  return (
    <Backdrop
      isOpen={isOpen}
      onClose={handleSave}
      heading={t("heading")}
      text={t("subheading")}
      ctaLabel={t("button_label")}
      ctaHandleClick={handleSave}
      closeBackdropOnCtaClick
    >
      <CheckBoxGroup
        name="providerType"
        label={t("provider_type_checkbox_group_label")}
        options={providerTypes}
        setOptions={setProviderTypes}
        style={styles.marginBottom32}
      />
      <CheckBoxGroup
        name="sex"
        label={t("provider_sex_checkbox_group_label")}
        options={providerSex}
        setOptions={setProviderSex}
        style={styles.marginBottom32}
      />
      <Input
        value={data.maxPrice}
        onChange={(value) => handleSelect("maxPrice", value)}
        label={t("max_price")}
        placeholder={t("max_price_placeholder")}
        type="number"
        style={styles.marginBottom32}
      />
      <Dropdown
        options={languagesQuery.data || []}
        selected={data.language}
        setSelected={(selectedOption) =>
          handleSelect("language", selectedOption)
        }
        label={t("language")}
        placeholder={t("language_placeholder")}
        style={[styles.dropdown, styles.marginBottom32]}
      />
      <View>
        <AppText style={styles.label}>
          {t("providers_free_consultation_label")}
        </AppText>
        <Toggle
          isToggled={data.onlyFreeConsultation}
          handleToggle={(checked) =>
            handleSelect("onlyFreeConsultation", checked)
          }
          style={[styles.marginBottom32, styles.toggle]}
        />
      </View>
    </Backdrop>
  );
};

const styles = StyleSheet.create({
  dropdown: { zIndex: 3 },
  marginBottom32: { marginBottom: 32 },
  toggle: { zIndex: 1 },
  label: {
    color: appStyles.colorBlue_3d527b,
    fontFamily: appStyles.fontSemiBold,
    marginBottom: 4,
  },
});
