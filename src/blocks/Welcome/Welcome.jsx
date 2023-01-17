import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { AppText, AppButton, Block, Dropdown } from "#components";

import { languageSvc, countrySvc, localStorage } from "#services";
import { appStyles } from "#styles";

export function Welcome() {
  const { t, i18n } = useTranslation("welcome");
  const navigate = () => {};
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  const fetchCountries = async () => {
    const localStorageCountry = await localStorage.getItem("country");
    const localStorageCountryID = await localStorage.getItem("country_id");

    const res = await countrySvc.getActiveCountries();
    const countries = res.data.map((x) => {
      const countryObject = {
        value: x.alpha2,
        label: x.name,
        id: x["country_id"],
        minAge: x["min_client_age"],
        maxAge: x["max_client_age"],
      };

      if (localStorageCountry === x.alpha2) {
        if (!localStorageCountryID) {
          localStorage.setItem("country_id", x["country_id"]);
        }
        setSelectedCountry(x.alpha2);
      }

      return countryObject;
    });
    return countries;
  };

  const fetchLanguages = async () => {
    const localStorageLanguage = await localStorage.getItem("language");

    const res = await languageSvc.getActiveLanguages();
    const languages = res.data.map((x) => {
      const languageObject = {
        value: x.alpha2,
        label: x.name,
        id: x["language_id"],
      };
      if (localStorageLanguage === x.alpha2) {
        setSelectedLanguage(x.alpha2);
        i18n.changeLanguage(localStorageLanguage);
      }
      return languageObject;
    });
    return languages;
  };

  const countriesQuery = useQuery(["countries"], fetchCountries, {
    retry: false,
  });
  const languagesQuery = useQuery(["languages"], fetchLanguages, {
    retry: false,
  });

  const handleContinue = () => {
    const country = selectedCountry;
    const language = selectedLanguage;

    localStorage.setItem("country", country);
    localStorage.setItem(
      "country_id",
      countriesQuery.data.find((x) => x.value === selectedCountry).id
    );
    localStorage.setItem("language", language);

    i18n.changeLanguage(language);

    navigate("/register-preview");
  };

  return (
    <ScrollView contentContainerStyle={styles.flexGrow}>
      <Block style={styles.flexGrow}>
        <View style={styles.headingContainer}>
          <AppText namedStyle="h3">{t("heading")}</AppText>
          <Image
            resizeMode="contain"
            source={require("../../assets/logo-vertical.png")}
            style={styles.logo}
          />
        </View>
        <View style={styles.dropdownsContainer}>
          <Dropdown
            options={countriesQuery.data}
            selected={selectedCountry}
            setSelected={setSelectedCountry}
            label={t("country")}
            placeholder={t("placeholder")}
            style={[styles.dropdown, { zIndex: 3 }]}
          />
          <Dropdown
            options={languagesQuery.data}
            selected={selectedLanguage}
            setSelected={setSelectedLanguage}
            label={t("language")}
            placeholder={t("placeholder")}
            style={[styles.dropdown, { zIndex: 2 }]}
          />
        </View>
        <View style={{ flex: 1, justifyContent: "flex-end", marginBottom: 30 }}>
          <AppButton
            label={t("button")}
            size="lg"
            disabled={!selectedCountry || !selectedLanguage}
            onPress={handleContinue}
          />
        </View>
      </Block>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: { width: 300, height: 150, marginTop: 16 },
  dropdown: { marginBottom: 24 },
  dropdownsContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  flexGrow: { flexGrow: 1 },
});
