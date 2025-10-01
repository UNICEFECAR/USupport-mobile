import React, { useState } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";

import { Organizations as OrganizationsBlock } from "#blocks";
import { Screen, Heading, ButtonOnlyIcon } from "#components";
import { FilterOrganizations } from "#backdrops";

const INITIAL_FILTERS = {
  search: "",
  district: "",
  paymentMethod: "",
  userInteraction: "",
  specialisations: "",
};

/**
 * Organizations
 *
 * Organizations screen which renders a list of organizations.
 *
 * @returns {JSX.Element}
 */
export const Organizations = ({ route, navigation }) => {
  const { t } = useTranslation("screens", {
    keyPrefix: "organizations-screen",
  });

  const params = route.params || { specialisations: [] };
  const { specialisations } = params;

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleGoBack = () => {
    navigation.goBack();
    setActiveCoupon(null);
  };

  return (
    <Screen hasEmergencyButton={false} hasHeaderNavigation t={t}>
      <FilterOrganizations
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        initialFilters={INITIAL_FILTERS}
      />
      <Heading
        style={{ paddingTop: 80 }}
        heading={t("heading")}
        subheading={t("subheading")}
        hasGoBackArrow={false}
      />
      <View style={{ marginTop: 120 }} />
      <OrganizationsBlock
        navigation={navigation}
        filters={filters}
        setFilters={setFilters}
        specialisations={specialisations}
        setIsFilterOpen={setIsFilterOpen}
      />
    </Screen>
  );
};
