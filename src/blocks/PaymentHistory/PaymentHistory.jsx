import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import { PaymentsHistoryTable } from "#components";
import { PaymentInformation } from "#modals";

import { paymentsSvc } from "#services";
import { View } from "react-native";

export const PaymentHistory = () => {
  const { t } = useTranslation("payment-history");
  const rows = [t("service"), t("price"), t("date_of_payment"), ""];

  const [paymentsData, setPaymentsData] = useState([]);
  const [isPaymentInformationModalOpen, setIsPaymentInformationModalOpen] =
    useState(false);

  const [selectedPaymentData, setSelectedPaymentData] = useState();
  const lastPaymentId = useRef(null);

  const getPaymentHistory = async () => {
    try {
      const res = await paymentsSvc.getPaymentHistory({
        limit: 5,
        startingAfterPaymentIntentId: lastPaymentId.current,
      });
      return res.data;
    } catch (err) {
      return [];
    }
  };

  const shouldCallLoadMore = useRef(true);

  const paymentHistoryQuery = useQuery(
    ["paymentHistoryData"],
    getPaymentHistory,
    {
      onSuccess: (data) => {
        const lastPayment = data.lastPaymentId;
        const payments = data.payments;

        if (data?.payments?.length > 0 || data?.length > 0) {
          shouldCallLoadMore.current = true;
        }

        if (payments) {
          setPaymentsData((prevPayments) => [...prevPayments, ...payments]);
        }
        lastPaymentId.current = lastPayment;

        if (data.hasMore) {
          loadMore();
        }
      },
      onError: (err) => {
        console.log(err);
      },
    }
  );

  const openPaymentModal = (paymentId) => {
    if (paymentId && paymentsData.length > 0) {
      const newSelectedPaymentData = paymentsData.find(
        (item) => item.paymentId === paymentId
      );
      setSelectedPaymentData(newSelectedPaymentData);
      setIsPaymentInformationModalOpen(true);
    }
  };
  const closePaymentModal = () => setIsPaymentInformationModalOpen(false);

  const loadMore = () => {
    shouldCallLoadMore.current = false;
    paymentHistoryQuery.refetch();
  };

  return (
    <View style={{ marginTop: 112 }}>
      <PaymentsHistoryTable
        isLoading={
          paymentHistoryQuery.isLoading || paymentHistoryQuery.isFetching
        }
        rows={rows}
        data={paymentsData}
        handleViewMore={openPaymentModal}
        t={t}
      />
      {isPaymentInformationModalOpen ? (
        <PaymentInformation
          isOpen={isPaymentInformationModalOpen}
          onClose={() => closePaymentModal()}
          data={selectedPaymentData}
        />
      ) : null}
    </View>
  );
};
