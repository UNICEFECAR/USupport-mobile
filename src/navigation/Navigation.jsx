import React, { useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { NavigationContainer } from "@react-navigation/native";

import { AppNavigation } from "./AppNavigation";
import { AuthNavigation } from "./AuthNavigation";

import { countrySvc, localStorage, Context } from "#services";

import { getCountryFromTimezone } from "#utils";

const kazakhstanCountry = {
  value: "KZ",
  label: "Kazakhstan",
  iconName: "KZ",
};

export function Navigation() {
  const { token, setCurrencySymbol } = useContext(Context);

  const fetchCountries = async () => {
    const localStorageCountry = await localStorage.getItem("country");

    const res = await countrySvc.getActiveCountries();
    const usersCountry = getCountryFromTimezone();
    const validCountry = res.data.find((x) => x.alpha2 === usersCountry);
    let hasSetDefaultCountry = false;
    const countries = res.data.map((x) => {
      const countryObject = {
        value: x.alpha2,
        label: x.name,
        countryID: x["country_id"],
        iconName: x.alpha2,
        minAge: x["min_client_age"],
        maxAge: x["max_client_age"],
        currencySymbol: x["symbol"],
      };
      const countryID = countryObject.countryID;
      const currencySymbol = countryObject.currencySymbol;
      if (localStorageCountry === x.alpha2) {
        localStorage.setItem("country_id", countryID);
        localStorage.setItem("currency_symbol", currencySymbol);
        setCurrencySymbol(currencySymbol);
      } else if (!localStorageCountry) {
        if (validCountry?.alpha2 === x.alpha2) {
          hasSetDefaultCountry = true;

          localStorage.setItem("country", x.alpha2);
          localStorage.setItem("country_id", countryObject.countryID);
          localStorage.setItem("currency_symbol", countryObject.currencySymbol);

          setCurrencySymbol(countryObject.currencySymbol);
        }
      }

      return countryObject;
    });

    if (!hasSetDefaultCountry && !localStorageCountry) {
      const kazakhstanCountryObject = countries.find(
        (x) => x.value === kazakhstanCountry.value
      );

      localStorage.setItem("country", kazakhstanCountry.value);
      localStorage.setItem("country_id", kazakhstanCountryObject.countryID);
      localStorage.setItem(
        "currency_symbol",
        kazakhstanCountryObject.currencySymbol
      );

      setCurrencySymbol(kazakhstanCountryObject.currencySymbol);
    }

    return await countries;
  };

  useQuery(["countries"], fetchCountries, {
    staleTime: Infinity,
    onError: (err) => console.log(err, "fetch countries error"),
  });

  return (
    <NavigationContainer>
      {token ? <AppNavigation /> : <AuthNavigation />}
    </NavigationContainer>
  );
}
