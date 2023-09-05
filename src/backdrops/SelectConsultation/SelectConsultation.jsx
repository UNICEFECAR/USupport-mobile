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
import { providerSvc, Context, clientSvc } from "#services";

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
  const [startDate, setStartDate] = useState(null);
  const [currentDay, setCurrentDay] = useState(new Date().getTime());

  const { activeCoupon } = useContext(Context);

  const [couponCode, setCouponCode] = useState(activeCoupon?.couponValue || "");
  const [campaignId, setCampaignId] = useState(
    activeCoupon?.campaignId || campaingIdFromProps
  );
  const [isCouponLoading, setIsCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState();

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
    return data;
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
      const slotDate = campaignId
        ? parseUTCDate(slot.time).getDate()
        : new Date(slot).getDate();
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
        const slotLocal = campaignId ? parseUTCDate(slot.time) : new Date(slot);
        const value = campaignId
          ? parseUTCDate(slot.time).getTime()
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
        classes="select-consultation__radio-button-selector-group"
      />
    );
  };

  const handleSave = () => {
    let slotObject;
    if (campaignId) {
      slotObject = availableSlots.find((slot) => {
        return parseUTCDate(slot.time).getTime() === selectedSlot;
      });
    }
    const time = campaignId ? slotObject : selectedSlot;
    handleBlockSlot(time, providerData.consultationPrice);
  };

  const handleSubmitCoupon = async () => {
    setIsCouponLoading(true);
    try {
      const { data } = await clientSvc.checkIsCouponAvailable(couponCode);

      if (data?.campaign_id) {
        setCampaignId(data.campaign_id);
      }
    } catch (err) {
      const { message: errorMessage } = useError(err);
      setCouponError(errorMessage);
    } finally {
      setIsCouponLoading(false);
    }
  };
  const removeCoupon = () => {
    setCouponCode("");
    setCampaignId("");
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
      <View style={styles.couponContainer}>
        <Input
          value={couponCode}
          onChange={(e) => setCouponCode(e)}
          label={t("coupon_code")}
          style={styles.couponInput}
          inputStyles={{ height: 18 }}
          placeholder="COUPON1"
        />
        <AppButton
          label={
            campaignId && couponCode ? t("remove_coupon") : t("apply_coupon")
          }
          onPress={campaignId && couponCode ? removeCoupon : handleSubmitCoupon}
          size="sm"
          loading={isCouponLoading}
          style={{
            width: appStyles.screenWidth * 0.4,
            minWidth: 'auto',
            borderRadius: 40,
            paddingVertical: 10,
          }}
        />
      </View>
        {couponError && <Error style={styles.error} message={couponError} />}
      {providerDataQuery.isLoading ? (
        <View style={{ alignItems: "center" }}>
          <Loading size="lg" />
        </View>
      ) : (
        <View style={{marginTop: 20}}>
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
