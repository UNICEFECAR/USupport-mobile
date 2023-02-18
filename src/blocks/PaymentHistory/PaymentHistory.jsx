import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import { PaymentsHistoryTable } from "#components";
import { PaymentInformation } from "#modals";

import { paymentsSvc } from "#services";

export const PaymentHistory = () => {
  const { t } = useTranslation("payment-history");
  const rows = [t("service"), t("price"), t("date_of_payment"), ""];

  const [paymentsData, setPaymentsData] = useState([]);
  const [isPaymentInformationModalOpen, setIsPaymentInformationModalOpen] =
    useState(false);

  const [selectedPaymentData, setSelectedPaymentData] = useState();
  const [lastPaymentId, setLastPaymentId] = useState(null);

  const getPaymentHistory = async () => {
    try {
      const res = await paymentsSvc.getPaymentHistory({
        limit: 5,
        startingAfterPaymentIntentId: lastPaymentId,
      });

      return res.data;
    } catch (err) {
      console.log(err);
    }
  };

  const paymentHistoryQuery = useQuery(
    ["paymentHistoryData"],
    getPaymentHistory,
    {
      onSuccess: (data) => {
        const lastPayment = data.lastPaymentId;
        const payments = data.payments;

        if (payments) {
          setPaymentsData((prevPayments) => [...prevPayments, ...payments]);
        }
        setLastPaymentId(lastPayment);
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

  return (
    <>
      <PaymentsHistoryTable
        isLoading={paymentHistoryQuery.isLoading}
        rows={rows}
        data={paymentsData}
        handleViewMore={openPaymentModal}
        loadMore={() => paymentHistoryQuery.refetch()}
        t={t}
      />
      {isPaymentInformationModalOpen ? (
        <PaymentInformation
          isOpen={isPaymentInformationModalOpen}
          onClose={() => closePaymentModal()}
          data={selectedPaymentData}
        />
      ) : null}
    </>
  );
};
