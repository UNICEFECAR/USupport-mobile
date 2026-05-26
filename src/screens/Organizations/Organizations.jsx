import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { Organizations as OrganizationsBlock } from "#blocks";
import { Screen, Heading, Block } from "#components";
import { FilterOrganizations } from "#backdrops";

const INITIAL_FILTERS = {
  search: "",
  district: "",
  paymentMethod: "",
  userInteraction: "",
  specialisations: [],
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

  const params = route.params || {};
  const {
    specialisations = [],
    triggerPersonalization = false,
    district = "",
    paymentMethod = "",
    userInteraction = "",
  } = params;

  // Initialize filters with params from navigation
  const [filters, setFilters] = useState({
    ...INITIAL_FILTERS,
    district: district || INITIAL_FILTERS.district,
    paymentMethod: paymentMethod || INITIAL_FILTERS.paymentMethod,
    userInteraction: userInteraction || INITIAL_FILTERS.userInteraction,
    // Ensure specialisations is always an array (even if empty)
    specialisations:
      Array.isArray(specialisations) && specialisations.length > 0
        ? specialisations
        : [],
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <Screen hasEmergencyButton={false} hasHeaderNavigation t={t}>
      <FilterOrganizations
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        initialFilters={INITIAL_FILTERS}
      />
      <Block>
        <Heading
          style={{ marginTop: 20 }}
          heading={t("heading")}
          hasGoBackArrow={false}
        />
      </Block>
      <OrganizationsBlock
        navigation={navigation}
        filters={filters}
        setFilters={setFilters}
        specialisations={specialisations}
        setIsFilterOpen={setIsFilterOpen}
        triggerPersonalization={triggerPersonalization}
        initialFilters={INITIAL_FILTERS}
      />
    </Screen>
  );
};
