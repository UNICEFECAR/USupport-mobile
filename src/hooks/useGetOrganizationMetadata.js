import { useQuery } from "@tanstack/react-query";

import { organizationSvc } from "#services";

export const useGetOrganizationMetadata = () => {
  return useQuery({
    queryKey: ["organization_metadata"],
    queryFn: async () => {
      const data = await organizationSvc.getOrganizationMetadata();
      return {
        workWith: data.work_with.map((item) => ({
          organizationWorkWithId: item.organization_work_with_id,
          topic: item.topic,
        })),
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
