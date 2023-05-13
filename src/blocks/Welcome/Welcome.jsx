import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { AppText, AppButton, Block, Dropdown } from "#components";

import { languageSvc, countrySvc, localStorage, Context } from "#services";

export function Welcome({ navigation }) {
  const { t, i18n } = useTranslation("welcome");
  const { setCurrencySymbol } = useContext(Context);
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
        currencySymbol: x["symbol"],
      };

      if (localStorageCountry === x.alpha2) {
        if (!localStorageCountryID) {
          localStorage.setItem("country_id", x["country_id"]);
        }
        setCurrencySymbol(x.currencySymbol);
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
        label: x.name === "English" ? x.name : `${x.name} (${x.local_name})`,
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

  const handleSelectCountry = (option) => {
    setSelectedCountry(option);
  };

  const handleContinue = () => {
    const country = selectedCountry;
    const language = selectedLanguage;

    const selectedCountryObject = countriesQuery.data.find(
      (x) => x.value === selectedCountry
    );

    const currencySymbol = selectedCountryObject.currencySymbol;

    setCurrencySymbol(currencySymbol);

    localStorage.setItem("country", country);
    localStorage.setItem("country_id", selectedCountryObject.id);
    localStorage.setItem("language", language);
    localStorage.setItem("currency_symbol", currencySymbol);

    i18n.changeLanguage(language);

    navigation.push("RegisterPreview");
  };

  return (
    <ScrollView contentContainerStyle={styles.flexGrow}>
      <Block style={styles.flexGrow}>
        <View style={styles.headingContainer}>
          <AppText namedStyle="h2">{t("heading")}</AppText>
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
            setSelected={handleSelectCountry}
            label={t("country")}
            placeholder={t("placeholder")}
            style={[styles.dropdown, { zIndex: 3 }]}
            dropdownId="country"
          />
          <Dropdown
            options={languagesQuery.data}
            selected={selectedLanguage}
            setSelected={setSelectedLanguage}
            label={t("language")}
            placeholder={t("placeholder")}
            style={[styles.dropdown, { zIndex: 2 }]}
            dropdownId="language"
          />
        </View>
        <View style={styles.buttonContainer}>
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
    justifyContent: "flex-end",
    alignItems: "center",
  },
  logo: { width: 300, height: 150, marginTop: 16 },
  dropdown: { marginBottom: 24 },
  dropdownsContainer: {
    flex: 1,
    justifyContent: "flex-end",
    zIndex: 2,
    alignItems: "center",
  },
  buttonContainer: {
    justifyContent: "flex-end",
    marginBottom: 30,
    flexDirection: "column",
    alignItems: "center",
  },
  flexGrow: { flexGrow: 1 },
});
