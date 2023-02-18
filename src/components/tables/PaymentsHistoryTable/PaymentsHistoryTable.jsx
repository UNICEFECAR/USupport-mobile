import React, { useContext } from "react";
import { StyleSheet, ScrollView, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Table, TableWrapper, Row } from "react-native-table-component";

import { Loading } from "../../loaders";
import { AppText } from "../../texts";
import { AppButton } from "../../buttons";
import { Block } from "../../blocks";
import { appStyles } from "#styles";

import { getTime, getDateView } from "#utils";

import { Context } from "#services";

export const PaymentsHistoryTable = ({
  isLoading,
  rows,
  data,
  t,
  handleViewMore,
  loadMore,
}) => {
  const { currencySymbol } = useContext(Context);

  const rowsData = rows.map((item) => (
    <AppText style={styles.headingText}>{t(item)}</AppText>
  ));

  const widthArr = [250, 120, 150, 150];

  const renderRow = ({ item, index }) => {
    const itemData = [
      <AppText style={styles.text}>{t(item.service)}</AppText>,
      <AppText
        style={styles.text}
      >{`${item.price} ${currencySymbol}`}</AppText>,
      <AppText style={styles.text}>{`${getDateView(item.date)} - ${getTime(
        item.date
      )}`}</AppText>,
      <AppButton
        label="Show more"
        type="ghost"
        onPress={() => handleViewMore(item.paymentId)}
      />,
    ];
    return (
      <TableWrapper>
        <Row data={itemData} widthArr={widthArr} style={styles.row} />
      </TableWrapper>
    );
  };

  return isLoading ? (
    <View style={styles.loadingContainer}>
      <Loading />
    </View>
  ) : !rowsData.length > 0 ? (
    <Block>
      <View style={styles.loadingContainer}>
        <AppText namedStyle="h3" style={styles.noHistoryText}>
          {t("no_payments_history_found")}
        </AppText>
      </View>
    </Block>
  ) : (
    <ScrollView horizontal showsHorizontalScrollIndicator>
      <Table style={{ margin: 16, height: "100%" }}>
        <FlashList
          ListHeaderComponent={<Row data={rowsData} widthArr={widthArr} />}
          estimatedItemSize={25}
          keyExtractor={(item, index) => index.toString()}
          data={data || []}
          renderItem={renderRow}
          onEndReached={loadMore} //TODO: FIX LOAD ON SCROLL
        />
      </Table>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  flashlistWrapper: {
    height: "100%",
  },
  loadingContainer: {
    width: "100%",
    paddingTop: 40,
    alignItems: "center",
  },
  textStyle: { textAlign: "center" },
  headingText: {
    fontFamily: appStyles.fontBold,
    textAlign: "center",
    marginBottom: 8,
  },
  text: { textAlign: "center", marginBottom: 8, marginTop: 4 },
  row: { borderBottomWidth: 1, borderBottomColor: appStyles.colorGray_a6b4b8 },
  noHistoryText: { textAlign: "center" },
});
