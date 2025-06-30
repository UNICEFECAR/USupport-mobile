import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { Backdrop, Dropdown, Loading } from "#components";
import { useGetOrganizationMetadata } from "#hooks";

/**
 * FilterOrganizations
 *
 * The FilterOrganizations backdrop
 *
 * @return {jsx}
 */
export const FilterOrganizations = ({
  isOpen,
  onClose,
  filters,
  setFilters,
  initialFilters,
}) => {
  const { t } = useTranslation("organizations");

  const [data, setData] = useState({ ...filters });

  const { data: metadata, isLoading: isMetadataLoading } =
    useGetOrganizationMetadata();

  const handleChange = (field, value) => {
    setData({ ...data, [field]: value });
  };

  const handleSave = () => {
    setFilters(data);
    onClose();
  };

  const handleReset = () => {
    setData({ ...initialFilters });
  };

  const renderFilters = () => {
    if (isMetadataLoading) {
      return <Loading />;
    }

    return (
      <View style={styles.container}>
        {metadata?.workWith && metadata.workWith.length > 0 && (
          <Dropdown
            selected={filters.workWith}
            setSelected={(value) => handleChange("workWith", value)}
            placeholder={t("work_with_placeholder")}
            options={metadata.workWith.map((item) => ({
              label: t(item.topic),
              value: item.organizationWorkWithId,
            }))}
          />
        )}

        {metadata?.districts && metadata.districts.length > 0 && (
          <Dropdown
            selected={filters.district}
            setSelected={(value) => handleChange("district", value)}
            placeholder={t("district_placeholder")}
            options={metadata.districts.map((district) => ({
              label: t(district.name),
              value: district.districtId,
            }))}
          />
        )}

        {metadata?.paymentMethods && metadata.paymentMethods.length > 0 && (
          <Dropdown
            selected={filters.paymentMethod}
            setSelected={(value) => handleChange("paymentMethod", value)}
            placeholder={t("payment_method_placeholder")}
            options={metadata.paymentMethods.map((method) => ({
              label: t(method.name),
              value: method.paymentMethodId,
            }))}
          />
        )}

        {metadata?.userInteractions && metadata.userInteractions.length > 0 && (
          <Dropdown
            selected={filters.userInteraction}
            setSelected={(value) => handleChange("userInteraction", value)}
            placeholder={t("user_interaction_placeholder")}
            options={metadata.userInteractions.map((interaction) => ({
              label: t(interaction.name + "_interaction"),
              value: interaction.userInteractionId,
            }))}
          />
        )}

        {metadata?.specialisations && metadata.specialisations.length > 0 && (
          <Dropdown
            selected={filters.specialisation}
            setSelected={(value) => handleChange("specialisation", value)}
            placeholder={t("specialisation_placeholder")}
            options={metadata.specialisations.map((specialisation) => ({
              label: t(specialisation.name),
              value: specialisation.organizationSpecialisationId,
            }))}
          />
        )}
      </View>
    );
  };

  return (
    <Backdrop
      isOpen={isOpen}
      onClose={onClose}
      heading={t("filter_heading")}
      text={t("filter_subheading")}
      ctaLabel={t("filter_button_label")}
      ctaHandleClick={handleSave}
      secondaryCtaLabel={t("reset_filters")}
      secondaryCtaHandleClick={handleReset}
    >
      {renderFilters()}
    </Backdrop>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
});
