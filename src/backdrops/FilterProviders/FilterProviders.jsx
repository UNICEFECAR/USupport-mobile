import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import DatePicker from "react-native-date-picker";

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
import { getDateView } from "#utils";

/**
 * FilterProviders
 *
 * The FilterProviders backdrop
 *
 * @return {jsx}
 */
export const FilterProviders = ({
  isOpen,
  onClose,
  onSave,
  allFilters,
  setAllFilters,
}) => {
  const { t } = useTranslation("filter-providers");

  const initialFilters = {
    providerTypes: [],
    providerSex: [],
    maxPrice: "",
    language: null,
    onlyFreeConsultation: false,
    availableAfter: "",
    availableBefore: "",
  };

  const [data, setData] = useState({ ...allFilters });

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
    { label: t("not_mentioned"), value: "notMentioned", isSelected: false },
  ]);

  useEffect(() => {
    const dataCopy = JSON.stringify(data);
    const allFiltersCopy = JSON.stringify(allFilters);
    if (dataCopy !== allFiltersCopy) {
      setData(allFilters);
    }

    setProviderTypes((prev) => {
      return prev.map((x) => {
        return {
          ...x,
          isSelected: allFilters.providerTypes.includes(x.value),
        };
      });
    });

    setProviderSex((prev) => {
      return prev.map((x) => {
        return {
          ...x,
          isSelected: allFilters.providerSex.includes(x.value),
        };
      });
    });
  }, [allFilters]);

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
    return languages.sort((a, b) =>
      a.label > b.label ? 1 : b.label > a.label ? -1 : 0
    );
  };
  const languagesQuery = useQuery(["languages"], fetchLanguages, {
    retry: false,
  });

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

    setAllFilters();
    onSave(dataCopy);
  };
  const [availableAfterOpen, setAvailableAfterOpen] = useState();
  const [availableBeforeOpen, setAvailableBeforeOpen] = useState();

  const availableAfterRef = useRef();
  const availableBeforeRef = useRef();

  const handleFilterReset = () => {
    setAllFilters(initialFilters);
    onSave(initialFilters);
    setProviderTypes((prev) => prev.map((x) => ({ ...x, isSelected: false })));
    setProviderSex((prev) => prev.map((x) => ({ ...x, isSelected: false })));
  };

  return (
    <Backdrop
      isOpen={isOpen}
      onClose={onClose}
      heading={t("heading")}
      text={t("subheading")}
      ctaLabel={t("button_label")}
      ctaHandleClick={handleSave}
      closeBackdropOnCtaClick
      secondaryCtaLabel={t("reset_filter")}
      secondaryCtaHandleClick={handleFilterReset}
      secondaryCtaType="secondary"
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
      <Input
        value={data.availableAfter ? getDateView(data.availableAfter) : ""}
        onChange={(value) => handleSelect("availableAfter", value)}
        onFocus={() => setAvailableAfterOpen(true)}
        reference={availableAfterRef}
        label={t("available_after")}
        placeholder={"DD/MM/YYYY"}
        style={styles.marginBottom32}
      />
      <Input
        value={data.availableBefore ? getDateView(data.availableBefore) : ""}
        onChange={(value) => handleSelect("availableBefore", value)}
        onFocus={() => setAvailableBeforeOpen(true)}
        reference={availableBeforeRef}
        label={t("available_before")}
        placeholder={"DD/MM/YYYY"}
        style={styles.marginBottom32}
      />
      <DatePicker
        modal
        open={availableAfterOpen}
        date={data.availableAfter || new Date()}
        onConfirm={(date) => {
          setAvailableAfterOpen(false);
          availableAfterRef.current.blur();
          handleSelect("availableAfter", date);
        }}
        onCancel={() => {
          setAvailableAfterOpen(false);
          availableAfterRef.current.blur();
        }}
        mode="date"
      />
      <DatePicker
        modal
        open={availableBeforeOpen}
        date={data.availableBefore || new Date()}
        onConfirm={(date) => {
          setAvailableBeforeOpen(false);
          availableBeforeRef.current.blur();
          handleSelect("availableBefore", date);
        }}
        onCancel={() => {
          setAvailableBeforeOpen(false);
          availableBeforeRef.current.blur();
        }}
        mode="date"
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
        dropdownId="filterLanguage"
      />
      <View style={styles.toggleContainer}>
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
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 40,
  },
});
