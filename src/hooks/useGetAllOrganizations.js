import { useQuery } from "@tanstack/react-query";

import { clientSvc } from "#services";

export const useGetAllOrganizations = (filters) => {
  const {
    search,
    workWith,
    district,
    paymentMethod,
    userInteraction,
    specialisation,
  } = filters;

  const fetchOrganizations = async () => {
    const { data } = await clientSvc.getOrganizations(filters);

    return data.map((organization) => ({
      organizationId: organization.organization_id,
      name: organization.name,
      websiteUrl: organization?.website_url,
      address: organization?.address,
      phone: organization?.phone,
      email: organization?.email,
      description: organization?.description,
      location: {
        longitude: organization?.longitude,
        latitude: organization?.latitude,
      },
      district: {
        id: organization?.district_id,
        name: organization?.district,
      },
      paymentMethod: {
        id: organization?.payment_method_id,
        name: organization?.payment_method,
      },
      userInteraction: {
        id: organization?.user_interaction_id,
        name: organization?.user_interaction,
      },
      workWith: organization?.work_with || [],
      providers: organization?.providers || [],
      createdBy: organization?.created_by,
      createdAt: organization?.created_at,
      specialisations: organization?.specialisations || [],
      paymentMethods: organization?.payment_methods || [],
      userInteractions: organization?.user_interactions || [],
      propertyTypes: organization?.property_types || [],
      distanceKm: organization?.distance_km,
    }));
  };

  return useQuery({
    queryKey: [
      "organizations",
      search,
      workWith,
      district,
      paymentMethod,
      userInteraction,
      specialisation,
    ],
    queryFn: fetchOrganizations,
  });
};
