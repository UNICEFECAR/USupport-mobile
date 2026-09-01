export const PEER_SUPPORT = "peer_support";

export const BASE_PROVIDER_TYPES = [
  "psychologist",
  "psychotherapist",
  "psychiatrist",
];

export const getProviderTypeFilterOptions = (country) => {
  const options = [...BASE_PROVIDER_TYPES];

  if (country?.toUpperCase() === "AM") {
    options.push(PEER_SUPPORT);
  }

  return options;
};
