import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useStripe } from "@stripe/stripe-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { paymentsSvc, providerSvc, clientSvc } from "#services";
import { Screen, AppButton, Loading, Heading, Block } from "#components";
import { ConfirmConsultation } from "#backdrops";
import { getDateView, getTime, FIVE_MINUTES } from "#utils";

import { mascotCalmBlue, mascotConfusedBlue, mascotHappyOrange } from "#assets";
import { showToast, hideToast } from "../../utils/showToast";

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
  const [isCheckoutButtonDisabled, setIsCheckoutButtonDisabled] =
    useState(false);

  const consultationCreationTime = useRef();

  const paymentIntentId = useRef();
  const clientSecretRef = useRef();
  const params = route.params;
  const consultationId = params?.consultationId;
  const selectedSlot = params?.selectedSlot;
  const entryTime = params?.entryTime;
  const campaignId = params?.campaignId;

  const fetchPaymentIntent = async () => {
    const res = await paymentsSvc.createPaymentIntent(
      consultationId,
      campaignId
    );
    return res?.data;
  };

  const initializePaymentSheet = async () => {
    const {
      clientSecret,
      customer,
      currency,
      publishableKey,
      price,
      paymentIntentId: intentId,
      consultationCreationTime: creationTime,
    } = await fetchPaymentIntent();

    if (entryTime) {
      consultationCreationTime.current = entryTime;
    } else {
      consultationCreationTime.current = creationTime;
    }

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
    const timeOfTimeout =
      new Date(consultationCreationTime.current).getTime() + FIVE_MINUTES;
    const now = new Date().getTime();

    const difference = timeOfTimeout - now;

    const { error } = await presentPaymentSheet({
      timeout: difference,
    });

    if (!error) {
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
      setConsultationDate(getDateView(data.time));
      setConsultationTime(getTime(data.time));
    },
    staleTime: Infinity,
    enabled: !!consultationId,
  });

  const [hasPadding, setHasPadding] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(
      () => {
        setIsCheckoutButtonDisabled(true);
        resetPaymentSheetCustomer();
        cancelPaymentIntentMutation.mutate();
        showToast({
          message: t("session_timeout"),
          type: "error",
          autoHide: false,
        });
        setHasPadding(true);
      },
      60 * 5 * 1000
    );

    return () => clearTimeout(timeout);
  }, []);

  const cancelPaymentIntent = async () => {
    const res = await paymentsSvc.cancelPaymentIntent(paymentIntentId.current);
    return res?.data;
  };
  const cancelPaymentIntentMutation = useMutation(cancelPaymentIntent);

  const handleGoBack = () => {
    console.log("goback");
    clientSvc.unblockSlot(consultationId);
    navigation.goBack();
    hideToast();
  };

  return (
    <Screen>
      <Block style={{ flex: 1, paddingTop: hasPadding ? 65 : 0 }}>
        <Heading
          heading={t("heading")}
          subheading={t("subheading")}
          handleGoBack={handleGoBack}
          style={{ zIndex: 20 }}
        />
        {loading ? (
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Loading />
          </View>
        ) : (
          <View />
        )}
        <View style={{ flexGrow: 1, justifyContent: "flex-end" }}>
          <AppButton
            disabled={loading || isCheckoutButtonDisabled}
            label="Checkout"
            onPress={openPaymentSheet}
            size="lg"
            style={{ marginBottom: 75 }}
          />
        </View>
      </Block>
      {selectedSlot && (
        <ConfirmConsultation
          isOpen={isConfirmBackdropOpen}
          onClose={() => {
            setIsConfirmBackdropOpen(false);
          }}
          handleCustomClose={() => {
            navigation.navigate("Consultations");
          }}
          customHeading={statusData?.heading}
          customDescription={statusData?.subHeading}
          customButtonLabel={statusData?.buttonLabel}
          customMascotImage={statusData?.mascotToUse}
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
