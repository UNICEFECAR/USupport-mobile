import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import * as am from "./src/locales/am.json";
import * as en from "./src/locales/en.json";
import * as kk from "./src/locales/kk.json";
import * as pl from "./src/locales/pl.json";
import * as ru from "./src/locales/ru.json";
import * as uk from "./src/locales/uk.json";

const resources = {
  am,
  en,
  kk,
  pl,
  ru,
  uk,
};

i18n.use(initReactI18next).init({
  resources,
  fallbackLng: "en",
  lng: "en",
});

export default i18n;
