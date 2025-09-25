import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import * as hy from "./src/locales/hy.json";
import * as en from "./src/locales/en.json";
import * as kk from "./src/locales/kk.json";
import * as pl from "./src/locales/pl.json";
import * as ro from "./src/locales/ro.json";
import * as ru from "./src/locales/ru.json";
import * as uk from "./src/locales/uk.json";


const resources = {
  hy,
  en,
  kk,
  pl,
  ro,
  ru,
  uk,
};

i18n.use(initReactI18next).init({
  resources,
  fallbackLng: "en",
  lng: "en",
});

export default i18n;
