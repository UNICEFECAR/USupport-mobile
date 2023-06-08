import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Screen, Block, Dropdown, Heading, Loading } from "#components";
import { localStorage, languageSvc, userSvc } from "#services";
import { StyleSheet } from "react-native";

export default function ChangeLanguage({ navigation }) {
  const { t, i18n } = useTranslation("change-language");
  const [data, setData] = useState({
    language: "",
  });
  const fetchLanguages = async () => {
    const localStorageLanguage = await localStorage.getItem("language");
    if (localStorageLanguage) {
      setData({
        language: localStorageLanguage,
      });
    }
    const res = await languageSvc.getActiveLanguages();
    const languages = res.data.map((x) => {
      const languageObject = {
        value: x.alpha2,
        label: x.name === "English" ? x.name : `${x.name} (${x.local_name})`,
        id: x["language_id"],
      };
      if (localStorageLanguage === x.alpha2) {
        setData({ language: x.alpha2 });
        i18n.changeLanguage(localStorageLanguage);
      }
      return languageObject;
    });
    return languages;
  };
  const languagesQuery = useQuery(["languages"], fetchLanguages);

  const handleChangeLanguage = async (lang) => {
    setData({ language: lang });
    i18n.changeLanguage(lang);
    await localStorage.setItem("language", lang);

    try {
      await userSvc.changeLanguage(lang);
    } catch (err) {
      console.log(err, "err");
    }
  };

  return (
    <Screen>
      <Heading
        heading={t("heading")}
        handleGoBack={() => navigation.goBack()}
      />
      <Block style={styles.mt84}>
        {languagesQuery.isLoading ? (
          <Loading style={styles.center} />
        ) : (
          <Dropdown
            options={languagesQuery.data || []}
            selected={data.language}
            setSelected={handleChangeLanguage}
            label={t("language")}
            placeholder={t("language_placeholder")}
            style={[styles.dropdown, styles.marginBottom32, styles.center]}
            dropdownId="filterLanguage"
          />
        )}
      </Block>
    </Screen>
  );
}

const styles = StyleSheet.create({
  dropdown: { zIndex: 3 },
  marginBottom32: { marginBottom: 32 },
  mt84: { marginTop: 84 },
  center: { alignSelf: "center" },
});

export { ChangeLanguage };
