import React, { useEffect, useState } from "react";
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
  const { t } = useTranslation("blocks", {
    keyPrefix: "organizations",
  });

  const [data, setData] = useState({ ...filters });
  const [selectedSpecialisations, setSelectedSpecialisations] = useState(
    filters.specialisations
      ? filters.specialisations
      : filters.specialisation
        ? [filters.specialisation]
        : []
  );

  useEffect(() => {
    if (isOpen) {
      setData({ ...filters });
    }
  }, [isOpen, filters]);

  const { data: metadata, isLoading: isMetadataLoading } =
    useGetOrganizationMetadata();

  const handleChange = (field, value) => {
    setData({ ...data, [field]: value });
  };

  const handleSpecialisationChange = (selectedValues) => {
    setSelectedSpecialisations(selectedValues);
    // Update data with the first selected specialisation for backward compatibility
    // or modify this logic based on your backend requirements
    const primarySpecialisation =
      selectedValues.length > 0 ? selectedValues[0] : null;
    setData((prevData) => ({
      ...prevData,
      specialisation: primarySpecialisation,
      specialisations: selectedValues,
    }));
  };

  const handleSave = () => {
    setFilters(data);
    onClose();
  };

  const handleReset = () => {
    setData({ ...initialFilters });
    setFilters({ ...initialFilters });
    setSelectedSpecialisations([]);
    onClose();
  };

  const renderFilters = () => {
    if (isMetadataLoading) {
      return <Loading />;
    }
    return (
      <View style={styles.container}>
        {metadata?.districts && metadata.districts.length > 0 && (
          <Dropdown
            dropdownId="filterDistrict"
            selected={data.district}
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
            dropdownId="filterPaymentMethod"
            selected={data.paymentMethod}
            setSelected={(value) => handleChange("paymentMethod", value)}
            placeholder={t("payment_methods_placeholder")}
            options={metadata.paymentMethods.map((method) => ({
              label: t(method.name),
              value: method.paymentMethodId,
            }))}
          />
        )}
        {metadata?.userInteractions && metadata.userInteractions.length > 0 && (
          <Dropdown
            dropdownId="filterUserInteraction"
            selected={data.userInteraction}
            setSelected={(value) => handleChange("userInteraction", value)}
            placeholder={t("user_interactions_placeholder")}
            options={metadata.userInteractions.map((interaction) => ({
              label: t(interaction.name + "_interaction"),
              value: interaction.userInteractionId,
            }))}
          />
        )}
        {metadata?.specialisations && metadata.specialisations.length > 0 && (
          <Dropdown
            dropdownId="filterSpecialisations"
            multiSelect={true}
            selectedValues={selectedSpecialisations}
            onMultiSelectChange={handleSpecialisationChange}
            placeholder={t("specialisations_placeholder")}
            // heading={t("specialisations_placeholder")}
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
      secondaryCtaStyle={{ marginBottom: 90 }}
      isOpen={isOpen}
      onClose={onClose}
      heading={t("filter_heading")}
      ctaLabel={t("filter_button_label")}
      ctaHandleClick={handleSave}
      secondaryCtaLabel={t("reset_filters")}
      secondaryCtaHandleClick={handleReset}
      secondaryCtaType="secondary"
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
