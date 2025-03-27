import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { View, StyleSheet } from "react-native";

import {
  AppText,
  AppButton,
  Backdrop,
  Error,
  Header,
  Loading,
  RadioButtonSelectorGroup,
  Input,
} from "#components";
import { appStyles } from "#styles";

import { useGetProviderDataById, useError } from "#hooks";
import { getTimestampFromUTC, parseUTCDate } from "#utils";
import { providerSvc, Context, clientSvc, localStorage } from "#services";

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
  isCtaLoading = false,
  errorMessage,
  isInDashboard,
  campaignId: campaingIdFromProps,
}) => {
  const { t } = useTranslation("select-consultation");
  const { activeCoupon } = useContext(Context);

  const [startDate, setStartDate] = useState(null);
  const [currentDay, setCurrentDay] = useState(new Date().getTime());
  const campaignId = activeCoupon?.campaignId || campaingIdFromProps;

  const [couponError, setCouponError] = useState();

  const [showCoupon, setShowCoupon] = useState(false);
  useEffect(() => {
    localStorage.getItem("country").then((country) => {
      setShowCoupon(country !== "KZ");
    });
  }, []);

  const providerDataQuery = useGetProviderDataById(providerId, campaignId);
  const providerData = providerDataQuery.data;

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
      providerId,
      campaignId
    );
    const slots = data.map((x) => {
      if (x.time) {
        return {
          time: parseUTCDate(x.time),
          organization_id: x.organization_id,
          campaign_id: x.campaign_id,
        };
      }
      return x;
    });
    const organizationSlotTimes = slots.reduce((acc, slot) => {
      if (slot.organization_id) {
        acc.push(new Date(slot.time).getTime());
      }
      return acc;
    }, []);

    // Ensure that there is no overlap between organization slots and regular slots
    // If there are duplicates, remove the regular slot
    if (organizationSlotTimes.length > 0) {
      return slots.filter((slot) => {
        if (slot.time) return slot;
        const slotTime = new Date(slot).getTime();
        return !organizationSlotTimes.includes(slotTime);
      });
    }
    return slots;
  };
  const availableSlotsQuery = useQuery(
    ["available-slots", startDate, currentDay, providerId, campaignId],
    () => getAvailableSlots(startDate, currentDay, providerId),
    { enabled: !!startDate && !!currentDay && !!providerId }
  );
  const availableSlots = availableSlotsQuery.data;

  const handleDayChange = (start, day) => {
    setStartDate(start);
    setCurrentDay(day);
  };

  const handleChooseSlot = (slot) => {
    setSelectedSlot(slot), providerData.consultationPrice;
  };

  const renderFreeSlots = () => {
    const todaySlots = availableSlots?.filter((slot) => {
      if (!slot) return false;
      const slotDate = new Date(slot.time || slot).getDate();
      const currentDayDate = new Date(currentDay).getDate();

      // Check if the slot is for the current campaign
      if (campaignId && campaignId !== slot.campaign_id) {
        return false;
      }
      return slotDate === currentDayDate;
    });
    if (!todaySlots || todaySlots?.length === 0)
      return (
        <AppText style={styles.noSlotsText}>{t("no_slots_available")}</AppText>
      );
    const options = todaySlots?.map(
      (slot) => {
        const slotLocal = new Date(slot.time || slot);
        const value = slot.time
          ? slot.time.getTime()
          : new Date(slot).getTime();
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
      />
    );
  };

  const handleSave = () => {
    let slotObject;
    if (campaignId) {
      slotObject = availableSlots.find((slot) => {
        return slot.time.getTime() === selectedSlot;
      });
    } else {
      const allMatchingSlots = availableSlots.filter((slot) => {
        const isTimeMatching = new Date(slot.time).getTime() === selectedSlot;
        return isTimeMatching;
      });

      if (allMatchingSlots.length >= 1) {
        const hasOrganizationSlot = allMatchingSlots.find(
          (slot) => !!slot.organization_id
        );
        if (hasOrganizationSlot) {
          slotObject = hasOrganizationSlot;
        }
      }
    }
    const time = slotObject || selectedSlot;
    handleBlockSlot(time, providerData.consultationPrice);
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
      isCtaLoading={isCtaLoading}
      errorMessage={errorMessage}
    >
      {showCoupon && activeCoupon && (
        <AppText isBold>
          {t("coupon_code")}: {activeCoupon?.couponValue}
        </AppText>
      )}
      {couponError && <Error style={styles.error} message={couponError} />}
      {providerDataQuery.isLoading ? (
        <View style={{ alignItems: "center" }}>
          <Loading size="lg" />
        </View>
      ) : !providerData.earliestAvailableSlot ? (
        <AppText style={{ textAlign: "center", marginTop: 12 }}>
          {t("provider_not_available")}
        </AppText>
      ) : (
        <View style={{ marginTop: 20 }}>
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
      )}
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
  couponContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    flex: 1,
    marginBottom: 16,
    height: 90,
  },
  couponInput: { width: "50%", marginRight: 12 },
  error: {
    width: "100%",
    alignSelf: "center",
    marginBottom: 12,
    textAlign: "center",
  },
});
