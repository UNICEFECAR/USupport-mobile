import { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import { useGetTheme, useGetClientData, useDropdownOptions } from "#hooks";
import { Context, localStorage, languageSvc, userSvc } from "#services";

const PROTECTED_SCREENS = [
  "UserDetails",
  "Passcode",
  "NotificationPreferences",
  "PlatformRating",
];

export function useProfileMenu(navigation) {
  const { t, i18n } = useTranslation("blocks", { keyPrefix: "user-profile" });
  const { theme, setTheme, isTmpUser, handleRegistrationModalOpen, country } =
    useContext(Context);
  const { isDarkMode, colors } = useGetTheme();

  const SHOW_PAYMENT_HISTORY =
    country !== "KZ" &&
    country !== "PL" &&
    country !== "RO" &&
    country !== "AM" &&
    country !== "CY";

  const [languagesData, setLanguagesData] = useState({
    language: "",
  });
  const { isOpen: dropdownIsOpen, setDropdownOptions } = useDropdownOptions();

  const clientQuery = useGetClientData(isTmpUser ? false : true)[0];
  const clientData = isTmpUser ? {} : clientQuery?.data;

  const displayName = clientData?.name
    ? `${clientData?.name} ${clientData?.surname}`
    : clientData?.nickname;

  const handleRedirect = (redirectTo) => {
    if (PROTECTED_SCREENS.includes(redirectTo) && isTmpUser) {
      handleRegistrationModalOpen();
    } else {
      if (redirectTo === "MoodTracker") {
        navigation.navigate("TabNavigation", {
          screen: "MoodTrackHistory",
        });
      } else {
        navigation.push(redirectTo);
      }
    }
  };

  const fetchLanguages = async () => {
    const localStorageLanguage = await localStorage.getItem("language");
    if (localStorageLanguage) {
      setLanguagesData({
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
        setLanguagesData({ language: x.alpha2 });
        i18n.changeLanguage(localStorageLanguage);
      }
      return languageObject;
    });
    return languages;
  };
  const languagesQuery = useQuery(["languages"], fetchLanguages);

  const handleChangeLanguage = async (lang) => {
    setLanguagesData({ language: lang });
    i18n.changeLanguage(lang);
    await localStorage.setItem("language", lang);

    try {
      await userSvc.changeLanguage(lang).then(() => {
        setDropdownOptions({
          heading: t("language_button_label"),
          options: languagesQuery.data || [],
          selectedOption: languagesData.language,
          handleOptionSelect: handleChangeLanguage,
          isOpen: false,
        });
      });
    } catch (err) {
      console.log(err, "err");
    }
  };

  const handlOpenLanguageDropdown = () => {
    if (dropdownIsOpen) {
      setDropdownOptions({
        heading: t("language_button_label"),
        options: languagesQuery.data || [],
        selectedOption: languagesData.language,
        handleOptionSelect: handleChangeLanguage,
        isOpen: false,
      });
    } else {
      setDropdownOptions({
        heading: t("language_button_label"),
        options: languagesQuery.data || [],
        selectedOption: languagesData.language,
        dropdownId: "filterLanguage",
        handleOptionSelect: handleChangeLanguage,
        isOpen: true,
      });
    }
  };

  const handleThemeChange = async () => {
    if (theme === "dark") {
      setTheme("light");
      await localStorage.setItem("theme", "light");
    } else {
      setTheme("dark");
      await localStorage.setItem("theme", "dark");
    }
  };

  const handleHighContrast = async () => {
    if (theme === "highContrast") {
      setTheme("light");
      await localStorage.setItem("theme", "light");
    } else {
      setTheme("highContrast");
      await localStorage.setItem("theme", "highContrast");
    }
  };

  return {
    t,
    theme,
    isDarkMode,
    colors,
    isTmpUser,
    clientData,
    displayName,
    SHOW_PAYMENT_HISTORY,
    handleRedirect,
    languagesData,
    languagesQuery,
    handlOpenLanguageDropdown,
    handleThemeChange,
    handleHighContrast,
  };
}
