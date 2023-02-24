import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useStripe } from "@stripe/stripe-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { paymentsSvc, providerSvc } from "#services";
import { Screen, AppButton, Loading, Heading, Block } from "#components";
import { ConfirmConsultation } from "#backdrops";
import { getDateView, getTime } from "#utils";

import { mascotCalmBlue, mascotConfusedBlue, mascotHappyOrange } from "#assets";
import { showToast } from "../../utils/showToast";

export function Checkout({ navigation, route }) {
  const { t } = useTranslation("checkout-page");
  const queryClient = useQueryClient();

  const {
    initPaymentSheet,
    presentPaymentSheet,
    retrievePaymentIntent,
    resetPaymentSheetCustomer,
  } = useStripe();
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState();
  const [price, setPrice] = useState();
  const [statusData, setStatusData] = useState();
  const [consultationDate, setConsultationDate] = useState();
  const [consultationTime, setConsultationTime] = useState();

  const [isConfirmBackdropOpen, setIsConfirmBackdropOpen] = useState(false);

  const paymentIntentId = useRef();
  const clientSecretRef = useRef();
  const params = route.params;
  const consultationId = params?.consultationId;
  const selectedSlot = params?.selectedSlot;

  const fetchPaymentIntent = async () => {
    const res = await paymentsSvc.createPaymentIntent(consultationId);
    return res?.data;
  };

  const initializePaymentSheet = async () => {
    const {
      clientSecret,
      ephemeralKey,
      customer,
      currency,
      publishableKey,
      price,
      paymentIntentId: intentId,
    } = await fetchPaymentIntent();

    if (!paymentIntentId.current) {
      paymentIntentId.current = intentId;
    }

    if (!clientSecretRef.current) {
      clientSecretRef.current = clientSecret;
    }

    const { error } = await initPaymentSheet({
      merchantDisplayName: "Example, Inc.",
      customerId: customer,
      // customerEphemeralKeySecret: ephemeralKey,
      paymentIntentClientSecret: clientSecret,
      // Set `allowsDelayedPaymentMethods` to true if your business can handle payment
      //methods that complete payment after a delay, like SEPA Debit and Sofort.
      allowsDelayedPaymentMethods: true,
      defaultBillingDetails: {
        name: "Jane Doe",
      },
    });
    if (!error) {
      setLoading(false);
      openPaymentSheet();
    }
    return { currency, price };
  };

  const openPaymentSheet = async () => {
    const { error } = await presentPaymentSheet();

    if (error) {
      // setIsConfirmBackdropOpen(true);
      // Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      if (clientSecretRef.current) {
        let newStatusData;
        retrievePaymentIntent(clientSecretRef.current).then(
          ({ paymentIntent }) => {
            console.log(paymentIntent, "paymentIntent result");
            switch (paymentIntent.status) {
              case "Succeeded":
                newStatusData = {
                  heading: t("payment_succeded_heading"),
                  subHeading: t("payment_succeded_subheading", {
                    consultationDate: getDateView(new Date(selectedSlot)),
                    consultationTime: getTime(new Date(selectedSlot)),
                  }),
                  mascotToUse: mascotHappyOrange,
                  buttonLabel: t("continue_button_label"),
                };
                setStatusData(newStatusData);
                queryClient.invalidateQueries({
                  queryKey: ["all-consultations"],
                });
                break;
              case "Processing":
                newStatusData = {
                  heading: t("payment_processing_heading"),
                  subHeading: t("payment_processing_subheading"),
                  mascotToUse: mascotCalmBlue,
                  buttonLabel: t("continue_button_label"),
                };
                setStatusData(newStatusData);
                break;
              case "RequiresPaymentMethod":
                newStatusData = {
                  heading: t("payment_requires_payment_method_heading"),
                  subHeading: t("payment_requires_payment_method_subheading"),
                  mascotToUse: mascotConfusedBlue,
                  buttonLabel: t("try_again_button_label"),
                };
                setStatusData(newStatusData);

                break;
              default:
                newStatusData = {
                  heading: t("payment_failed_heading"),
                  subHeading: t("payment_failed_subheading"),
                  mascotToUse: mascotConfusedBlue,
                  buttonLabel: t("try_again_button_label"),
                };
                setStatusData(newStatusData);
                break;
            }
          }
        );
        setIsConfirmBackdropOpen(true);
      }
    }
  };

  useQuery(["payment-intent", consultationId], initializePaymentSheet, {
    enabled: !!consultationId,
    onSuccess: (data) => {
      setCurrency(data.currency);
      setPrice(data.price);
    },
    onError: (error) => {
      console.log(error.response.data, "error");
    },
  });

  const getConsultation = async () => {
    const res = await providerSvc.getConsultationsTime(consultationId);
    return res?.data;
  };

  useQuery(["consultation", consultationId], getConsultation, {
    onSuccess: (data) => {
      const date = getDateView(data.time);
      const time = getTime(data.time);
      // console.log(date, time);
      setConsultationDate(getDateView(data.time));
      setConsultationTime(getTime(data.time));
    },
    staleTime: Infinity,
    enabled: !!consultationId,
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      cancelPaymentIntentMutation.mutate();
      resetPaymentSheetCustomer();
      showToast({
        message: "ERROR",
        type: "error",
        autoHide: false,
      });
    }, 60 * 5 * 1000);

    return () => clearTimeout(timeout);
  }, []);

  const cancelPaymentIntent = async () => {
    const res = await paymentsSvc.cancelPaymentIntent(paymentIntentId.current);
    return res?.data;
  };
  const cancelPaymentIntentMutation = useMutation(cancelPaymentIntent);

  return (
    <Screen hasEmergencyButton={false}>
      <Block>
        <Heading
          heading={t("heading")}
          subheading={t("subheading")}
          handleGoBack={() => navigation.goBack()}
        />
      </Block>
      {loading ? (
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <Loading />
        </View>
      ) : (
        <View />
      )}
      {/* <AppButton
        disabled={loading}
        label="Cancel intent"
        onPress={cancelPaymentIntentMutation.mutate}
        size="lg"
        style={{ alignSelf: "center" }}
      />
      <AppButton
        disabled={loading}
        label="Checkout"
        onPress={openPaymentSheet}
        size="lg"
        style={{ alignSelf: "center" }}
      /> */}
      {selectedSlot && (
        <ConfirmConsultation
          isOpen={isConfirmBackdropOpen}
          onClose={() => setIsConfirmBackdropOpen(false)}
          customHeading={statusData?.heading}
          customDescription={statusData?.subHeading}
          customButtonLabel={statusData?.buttonLabel}
          mascotImage={statusData?.mascotToUse}
          consultation={{
            startDate: new Date(selectedSlot),
            endDate: new Date(
              new Date(selectedSlot).setHours(
                new Date(selectedSlot).getHours() + 1
              )
            ),
          }}
        />
      )}
    </Screen>
  );
}
