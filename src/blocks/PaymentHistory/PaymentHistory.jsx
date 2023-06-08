import React, { useState, useRef, useContext } from "react";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import ReactNativeBlobUtil from "react-native-blob-util";

import { PaymentsHistoryTable, AppButton } from "#components";
import { PaymentInformation } from "#modals";

import { paymentsSvc, Context } from "#services";
import { getDateView, getTimeFromDate, showToast } from "#utils";

export const PaymentHistory = () => {
  const { t } = useTranslation("payment-history");
  const { currencySymbol } = useContext(Context);
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

  const handleExport = () => {
    // Construct the csv file
    let csv = `${rows
      .slice(0, rows.length - 1)
      .map((x) => x)
      .join(",")},${t("more_details")}\n`;
    paymentsData.forEach((p) => {
      csv += `${t(p.service)},${p.price}${currencySymbol},${getDateView(
        p.date
      )} - ${getTimeFromDate(new Date(p.date))},${p.receipt_url}\n`;
    });

    // The path where the file will be saved
    const path = `${
      Platform.OS === "ios"
        ? ReactNativeBlobUtil.fs.dirs.DocumentDir
        : ReactNativeBlobUtil.fs.dirs.DownloadDir
    }/payments.csv`;

    // Save the file
    ReactNativeBlobUtil.fs.writeFile(path, csv, "utf8").then(() => {
      showToast({
        message: t("download_success"),
      });
      // Try to open the file
      if (Platform.OS === "ios") {
        ReactNativeBlobUtil.ios
          .previewDocument(
            ReactNativeBlobUtil.fs.dirs.DocumentDir + "/payments.csv"
          )
          .catch((err) => console.log(err, "err"));
      } else {
        ReactNativeBlobUtil.android
          .actionViewIntent(
            ReactNativeBlobUtil.fs.dirs.DocumentDir + "/payments.csv"
          )
          .catch((err) => console.log(err, "err"));
      }
    });
  };

  return (
    <View style={{ marginTop: 112 }}>
      <AppButton
        label={t("export_label")}
        onPress={handleExport}
        disabled={
          paymentsData.length === 0 ||
          paymentHistoryQuery.data?.hasMore === true
        }
        size="sm"
        style={{ marginLeft: 12 }}
      />
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
