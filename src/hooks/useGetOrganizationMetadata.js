import { useQuery } from "@tanstack/react-query";

import { organizationSvc } from "#services";

export const useGetOrganizationMetadata = () => {
  return useQuery({
    queryKey: ["organization_metadata"],
    queryFn: async () => {
      const data = await organizationSvc.getOrganizationMetadata();
      return {
        districts: data.districts.map((item) => ({
          districtId: item.district_id,
          name: item.name,
        })),
        paymentMethods: data.payment_methods.map((item) => ({
          paymentMethodId: item.payment_method_id,
          name: item.name,
        })),
        userInteractions: data.user_interactions.map((item) => ({
          userInteractionId: item.user_interaction_id,
          name: item.name,
        })),
        specialisations: data.specialisations.map((item) => ({
          organizationSpecialisationId: item.organization_specialisation_id,
          name: item.name,
        })),
      };
    },
  });
};
