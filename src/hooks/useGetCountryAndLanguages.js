import { useQuery } from "@tanstack/react-query";
import { languageSvc, countrySvc } from "#services";

export default function useGetCountryAndLanguages() {
  const fetchLanguagesAndCountries = async () => {
    const languages = languageSvc.getAllLanguages;
    const countries = countrySvc.getActiveCountries;

    const [languagesData, countriesData] = await Promise.all([
      languages(),
      countries(),
    ]);

    const languagesSorted = languagesData.data.sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    return { languages: languagesSorted, countries: countriesData.data };
  };
  const query = useQuery(
    ["all-languages-and-countries"],
    fetchLanguagesAndCountries
  );

  return query;
}

export { useGetCountryAndLanguages };
