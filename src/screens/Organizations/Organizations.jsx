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
  specialisation: "",
};

/**
 * Organizations
 *
 * Organizations screen which renders a list of organizations.
 *
 * @returns {JSX.Element}
 */
export const Organizations = ({ navigation }) => {
  const { t } = useTranslation("screens", {
    keyPrefix: "organizations-screen",
  });

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleGoBack = () => {
    navigation.goBack();
    setActiveCoupon(null);
  };

  return (
    <Screen hasEmergencyButton={false}>
      <FilterOrganizations
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        initialFilters={INITIAL_FILTERS}
      />
      <Heading
        heading={t("heading")}
        subheading={t("subheading")}
        hasGoBackArrow={false}
        buttonComponent={
          <ButtonOnlyIcon
            iconName="filter"
            iconSize="md"
            onPress={() => setIsFilterOpen(true)}
          />
        }
      />
      <View style={{ marginTop: 75 }} />
      <OrganizationsBlock
        navigation={navigation}
        filters={filters}
        setFilters={setFilters}
      />
    </Screen>
  );
};
