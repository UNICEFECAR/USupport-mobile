import { useQuery } from "@tanstack/react-query";
import { languageSvc } from "#services";

export default function useGetLanguages() {
  const fetchLanguages = async () => {
    const languages = await languageSvc.getActiveLanguages();
    const languagesSorted = languages.data.sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    return languagesSorted;
  };
  const query = useQuery(["all-languages"], fetchLanguages);

  return query;
}

export { useGetLanguages };
