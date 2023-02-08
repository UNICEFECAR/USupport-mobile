import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { View, StyleSheet } from "react-native";

import {
  AppText,
  Backdrop,
  Header,
  Loading,
  RadioButtonSelectorGroup,
} from "#components";
import { appStyles } from "#styles";

import { useGetProviderDataById } from "#hooks";
import { getTimestampFromUTC } from "#utils";
import { providerSvc } from "#services";

/**
 * SelectConsultation
 *
 * The SelectConsultation backdrop
 *
 * @return {jsx}
 */
export const SelectConsultation = ({
  isOpen,
  onClose,
  edit = false,
  handleBlockSlot,
  providerId,
  isCtaDisabled = false,
  errorMessage,
  isInDashboard,
}) => {
  const { t } = useTranslation("select-consultation");
  let providerData = useGetProviderDataById(providerId).data;
  const [startDate, setStartDate] = useState(null);
  const [currentDay, setCurrentDay] = useState(new Date().getTime());

  useEffect(() => {
    if (providerData) {
      const earliestAvailableSlot = providerData?.earliestAvailableSlot;
      setCurrentDay(new Date(earliestAvailableSlot).getTime());
    }
  }, [providerData]);

  const [selectedSlot, setSelectedSlot] = useState("");

  const getAvailableSlots = async (startDate, currentDay, providerId) => {
    const { data } = await providerSvc.getAvailableSlotsForSingleDay(
      getTimestampFromUTC(startDate),
      getTimestampFromUTC(currentDay),
      providerId
    );
    return data;
  };
  const availableSlotsQuery = useQuery(
    ["available-slots", startDate, currentDay, providerId],
    () => getAvailableSlots(startDate, currentDay, providerId),
    { enabled: !!startDate && !!currentDay && !!providerId }
  );
  const availableSlots = availableSlotsQuery.data;

  const handleDayChange = (start, day) => {
    setStartDate(start);
    setCurrentDay(day);
  };

  const handleChooseSlot = (slot) => {
    setSelectedSlot(slot);
  };

  const renderFreeSlots = () => {
    const todaySlots = availableSlots?.filter((slot) => {
      const slotDate = new Date(slot).getDate();
      const currentDayDate = new Date(currentDay).getDate();
      return slotDate === currentDayDate;
    });
    if (!todaySlots || todaySlots?.length === 0)
      return (
        <AppText style={styles.noSlotsText}>{t("no_slots_available")}</AppText>
      );
    const options = todaySlots?.map(
      (slot) => {
        const slotLocal = new Date(slot);
        const value = new Date(slot).getTime();
        const getDoubleDigitHour = (hour) =>
          hour === 24 ? "00" : hour < 10 ? `0${hour}` : hour;

        const displayStartHours = getDoubleDigitHour(slotLocal.getHours());
        const displayStartMinutes = getDoubleDigitHour(slotLocal.getMinutes());
        const displayEndHours = getDoubleDigitHour(slotLocal.getHours() + 1);
        const displayEndMinutes = getDoubleDigitHour(slotLocal.getMinutes());
        const label = `${displayStartHours}:${displayStartMinutes} - ${displayEndHours}:${displayEndMinutes}`;

        return { label: label, value };
      },
      [availableSlots]
    );

    return (
      <RadioButtonSelectorGroup
        options={options}
        name="free-slots"
        selected={selectedSlot}
        setSelected={handleChooseSlot}
        classes="select-consultation__radio-button-selector-group"
      />
    );
  };

  const handleSave = () => {
    handleBlockSlot(selectedSlot, providerData.consultationPrice);
  };

  return (
    <Backdrop
      classes="select-consultation"
      title="SelectConsultation"
      isOpen={isOpen}
      onClose={onClose}
      heading={edit === true ? t("heading_edit") : t("heading_new")}
      text={edit === true ? t("subheading_edit") : t("subheading_new")}
      ctaLabel={t("cta_button_label")}
      ctaHandleClick={handleSave}
      ctaStyle={isInDashboard ? { marginBottom: 85 } : {}}
      isCtaDisabled={isCtaDisabled ? true : !selectedSlot ? true : false}
      errorMessage={errorMessage}
    >
      <View className="select-consultation__content-container">
        <Header
          handleDayChange={handleDayChange}
          setStartDate={setStartDate}
          startDate={providerData?.earliestAvailableSlot}
          style={styles.calendarHeader}
        />
        <View style={styles.slotsContainer}>
          {availableSlotsQuery.isLoading &&
          availableSlotsQuery.fetchStatus !== "idle" ? (
            <Loading size="md" />
          ) : (
            renderFreeSlots()
          )}
        </View>
      </View>
    </Backdrop>
  );
};

const styles = StyleSheet.create({
  calendarHeader: { marginBottom: 16 },
  slotsContainer: {
    paddingTop: 12,
    paddingBottom: 24,
    alignItems: "center",
  },
  noSlotsText: { color: appStyles.colorRed_ed5657 },
});
