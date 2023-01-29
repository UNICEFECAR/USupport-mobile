import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { useStripe } from "@stripe/stripe-react-native";
import { useQuery } from "@tanstack/react-query";
import { API_URL_ENDPOINT } from "@env";

import { paymentsSvc } from "#services";

import { Screen, AppButton, Loading } from "#components";

export function Checkout() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState();
  const [price, setPrice] = useState();
  const [clientSecret, setClientSecret] = useState();

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
      "f6ad2745-ecb1-41b4-8200-950f2154de38"
    );
    console.log(res.data);
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
    const { clientSecret, ephemeralKey, customer, publishableKey } =
      await fetchPaymentIntent();

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
  };

  const openPaymentSheet = async () => {
    const { error } = await presentPaymentSheet();

    if (error) {
      // Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      // Alert.alert("Success", "Your order is confirmed!");
    }
  };

  useEffect(() => {
    initializePaymentSheet();
  }, []);

  return (
    <Screen>
      {loading ? (
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <Loading />
        </View>
      ) : (
        <View />
      )}
      <AppButton
        disabled={!loading}
        label="Checkout"
        onPress={openPaymentSheet}
        size="lg"
      />
    </Screen>
  );
}
