import React, { useContext } from "react";
import { StyleSheet, ScrollView, View, FlatList } from "react-native";
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
        <Row
          key={index}
          data={itemData}
          widthArr={widthArr}
          style={styles.row}
        />
      </TableWrapper>
    );
  };

  return !isLoading && !data.length > 0 ? (
    <Block>
      <View style={styles.noPayments}>
        <AppText namedStyle="h3" style={styles.noHistoryText}>
          {t("no_payments_history_found")}
        </AppText>
      </View>
    </Block>
  ) : (
    <Table style={styles.table}>
      <ScrollView horizontal>
        <FlatList
          directionalLockEnabled={false}
          nestedScrollEnabled
          contentContainerStyle={{
            overflow: "visible",
            width: 250 + 120 + 150 + 150 + 40,
            marginBottom: 60,
            paddingBottom: 60,
          }}
          ListHeaderComponent={<Row data={rowsData} widthArr={widthArr} />}
          ListFooterComponent={
            isLoading ? (
              <View style={styles.loadingContainer}>
                <Loading />
              </View>
            ) : null
          }
          estimatedItemSize={50}
          keyExtractor={(item, index) => index.toString()}
          data={data || []}
          renderItem={renderRow}
        />
      </ScrollView>
    </Table>
  );
};

const styles = StyleSheet.create({
  table: {
    margin: 16,
    height: "100%",
    overflow: "visible",
    paddingBottom: 60,
  },
  flashlistWrapper: {
    height: "100%",
  },
  noPayments: {
    width: "100%",
    paddingTop: 40,
    alignItems: "center",
  },
  loadingContainer: {
    width: appStyles.screenWidth,
    alignSelf: "flex-start",
    alignItems: "center",
    paddingTop: 26,
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
