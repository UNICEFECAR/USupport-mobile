import React, { useState, useEffect } from "react";
import { useStripe } from "@stripe/stripe-react-native";
import { useQuery } from "@tanstack/react-query";
import { API_URL_ENDPOINT } from "@env";

import { paymentsSvc } from "#services";

import { Screen, AppButton } from "#components";

export function CheckoutScreen() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  //   const fetchPaymentSheetParams = async () => {
  //     const response = await fetch(`${API_URL_ENDPOINT}/payment-sheet`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     });
  //     const res = await response.json();
  //     console.log(res);
  //     const { paymentIntent, ephemeralKey, customer } = await response.json();

  //     return {
  //       paymentIntent,
  //       ephemeralKey,
  //       customer,
  //     };
  //   };

  const fetchPaymentIntent = async () => {
    const res = await paymentsSvc.createPaymentIntent(
      "17eca519-ac61-471c-9030-5fce5dfedfea"
    );

    return res?.data;
  };
  const paymentIntent = useQuery(["paymentIntent"], fetchPaymentIntent, {
    onSuccess: (data) => {
      setCurrency(data.currency);
      setPrice(data.price);
      setClientSecret(data.clientSecret);
    },
  });

  const initializePaymentSheet = async () => {
    const { paymentIntent, ephemeralKey, customer, publishableKey } =
      await fetchPaymentIntent();

    const { error } = await initPaymentSheet({
      merchantDisplayName: "Example, Inc.",
      customerId: customer,
      customerEphemeralKeySecret: ephemeralKey,
      paymentIntentClientSecret: paymentIntent,
      // Set `allowsDelayedPaymentMethods` to true if your business can handle payment
      //methods that complete payment after a delay, like SEPA Debit and Sofort.
      allowsDelayedPaymentMethods: true,
      defaultBillingDetails: {
        name: "Jane Doe",
      },
    });
    if (!error) {
      setLoading(true);
    }
  };

  const openPaymentSheet = async () => {
    // see below
  };

  useEffect(() => {
    initializePaymentSheet();
  }, []);

  return (
    <Screen>
      <AppButton
        disabled={!loading}
        label="Checkout"
        onPress={openPaymentSheet}
        size="lg"
      />
    </Screen>
  );
}
