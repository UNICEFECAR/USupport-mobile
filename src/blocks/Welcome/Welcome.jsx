import React, { useContext, useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import Config from "react-native-config";

import { AppText, AppButton, Block, Dropdown } from "#components";
import { languageSvc, countrySvc, localStorage, Context } from "#services";
import { useGetTheme } from "#hooks";

const { AMAZON_S3_BUCKET } = Config;

export function Welcome({ navigation }) {
  const { isDarkMode } = useGetTheme();
  const { t, i18n } = useTranslation("blocks", { keyPrefix: "welcome" });
  const {
    setCurrencySymbol,
    setCountry,
    setIsPodcastsActive,
    setIsVideosActive,
  } = useContext(Context);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  useEffect(() => {
    localStorage.getItem("country").then((country) => {
      if (country) {
        setSelectedCountry(country);
      }
    });
  }, []);

  const fetchCountries = async () => {
    const localStorageCountry = await localStorage.getItem("country");
    const localStorageCountryID = await localStorage.getItem("country_id");

    const res = await countrySvc.getActiveCountries();
    const countries = res.data.map((x) => {
      const countryObject = {
        value: x.alpha2,
        label: x.name,
        countryID: x.country_id,
        minAge: x.min_client_age,
        maxAge: x.max_client_age,
        currencySymbol: x.symbol,
        localName: x.local_name,
        podcastsActive: x.podcasts_active,
        videosActive: x.videos_active,
      };
      if (localStorageCountry === x.alpha2) {
        if (!localStorageCountryID) {
          localStorage.setItem("country_id", x["country_id"]);
        }
        console.log(countryObject);
        setCurrencySymbol(x.currencySymbol);
        setSelectedCountry(x.alpha2);
        setCountry(x.alpha2);
        setIsPodcastsActive(countryObject.podcastsActive);
        setIsVideosActive(countryObject.videosActive);
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
  const languagesQuery = useQuery(
    ["languages", selectedCountry],
    fetchLanguages,
    {
      retry: false,
    }
  );

  const handleSelectCountry = async (option) => {
    await localStorage.setItem("country", option);
    setSelectedCountry(option);
    setCountry(option);
  };

  const handleContinue = () => {
    const country = selectedCountry;
    const language = selectedLanguage;

    const selectedCountryObject = countriesQuery.data.find(
      (x) => x.value === selectedCountry
    );

    const currencySymbol = selectedCountryObject.currencySymbol;

    setCurrencySymbol(currencySymbol);
    setCountry(country);
    setIsPodcastsActive(selectedCountryObject.podcastsActive);
    setIsVideosActive(selectedCountryObject.videosActive);

    localStorage.setItem("country", country);
    localStorage.setItem("country_id", selectedCountryObject.countryID);
    localStorage.setItem("language", language);
    localStorage.setItem("currency_symbol", currencySymbol);
    localStorage.setItem("minAge", selectedCountryObject.minAge.toString());

    navigation.push("RegisterPreview");
  };

  const imageUrl = isDarkMode
    ? `${AMAZON_S3_BUCKET}/logo-vertical-dark`
    : `${AMAZON_S3_BUCKET}/logo-vertical`;

  return (
    <ScrollView contentContainerStyle={styles.flexGrow}>
      <Block style={styles.flexGrow}>
        <View style={styles.headingContainer}>
          <AppText namedStyle="h2">{t("heading")}</AppText>
          <Image
            resizeMode="contain"
            source={{
              uri: imageUrl,
            }}
            style={styles.logo}
          />
        </View>
        <View style={styles.dropdownsContainer}>
          {selectedCountry === "PL" && (
            <AppText>{t("poland_description")}</AppText>
          )}
          <Dropdown
            options={countriesQuery.data?.map((x) => {
              return {
                ...x,
                label: `${x.label} (${x.localName})`,
              };
            })}
            selected={selectedCountry}
            setSelected={handleSelectCountry}
            label={t("country")}
            placeholder={t("placeholder")}
            style={[styles.dropdown, { zIndex: 3 }]}
            dropdownId="country"
          />

          <Dropdown
            isLoading={languagesQuery.isFetching}
            options={languagesQuery.data}
            disabled={!selectedCountry || languagesQuery.data?.length === 0}
            selected={selectedLanguage}
            setSelected={(lang) => {
              setSelectedLanguage(lang);
              i18n.changeLanguage(lang);
            }}
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
