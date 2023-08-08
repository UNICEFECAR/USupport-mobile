import { useInfiniteQuery } from "@tanstack/react-query";
import { providerSvc } from "#services";

const constructFiltersQueryString = (filters) => {
  const providerTypes = filters.providerTypes?.join(",");
  const sex = filters.providerSex?.join(",");
  const maxPrice = filters.maxPrice;
  const onlyFreeConsultation = filters.onlyFreeConsultation;
  const language = filters.language;
  const availableAfter = new Date(filters.availableAfter).getTime() / 1000;
  const availableBefore = new Date(filters.availableBefore).getTime() / 1000;

  let queryString = "";
  if (providerTypes) {
    queryString += `&providerTypes=${providerTypes}`;
  }

  if (sex) {
    queryString += `&sex=${sex}`;
  }

  if (maxPrice) {
    queryString += `&maxPrice=${maxPrice}`;
  }

  if (availableAfter) {
    queryString += `&availableAfter=${availableAfter}`;
  }

  if (availableBefore) {
    queryString += `&availableBefore=${availableBefore}`;
  }

  if (onlyFreeConsultation) {
    queryString += `&onlyFreeConsultation=${true}`;
  }

  if (language) {
    queryString += `&language=${language}`;
  }

  return queryString || "";
};

/**
 * Reuseable hook to get and transform the client data in a desired format
 */
export default function useGetProvidersData(
  activeCoupon = null,
  filters,
  onSuccess = () => {}
) {
  const fetchProvidersData = async ({ pageParam = 1 }) => {
    const providersLimit = 10;
    const filtersQueryString = constructFiltersQueryString(filters);

    const { data } = await providerSvc.getAllProviders(
      activeCoupon?.campaignId,
      providersLimit,
      pageParam,
      filtersQueryString
    );
    const formattedData = [];
    for (let i = 0; i < data.length; i++) {
      const providerData = data[i];
      const formattedProvider = {
        providerDetailId: providerData.provider_detail_id || "",
        name: providerData.name || "",
        patronym: providerData.patronym || "",
        surname: providerData.surname || "",
        nickname: providerData.nickname || "",
        image: providerData.image || "default",
        specializations: providerData.specializations || [],
        education: providerData.education || [],
        sex: providerData.sex || "",
        consultationPrice: providerData.consultation_price || 0,
        description: providerData.description || "",
        languages: providerData.languages || [],
        workWith: providerData.work_with || [],
        totalConsultations: providerData.total_consultations || 0,
        earliestAvailableSlot: providerData.earliest_available_slot || "",
        latestAvailableSlot: providerData.latest_available_slot || "",
        couponPrice: providerData.price_per_coupon || 0,
      };
      formattedData.push(formattedProvider);
    }
    // Return only the providers that have available slot
    return formattedData.filter((x) => x.earliestAvailableSlot);
  };
  const providersDataQuery = useInfiniteQuery(
    ["all-providers-data", activeCoupon, filters],
    fetchProvidersData,
    {
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.length === 0) {
          return undefined;
        }
        return pages.length + 1;
      },
      onSuccess: () => {
        onSuccess();
      },
      enabled: activeCoupon === null ? true : !!activeCoupon,
    }
  );
  return providersDataQuery;
}

export { useGetProvidersData };
