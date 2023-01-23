import React from "react";
import { StyleSheet, ScrollView } from "react-native";

import { Screen } from "#components";

import { ArticlesDashboard } from "#blocks";

export const Dashboard = ({ navigation }) => {
  return (
    <Screen>
      <ScrollView>
        <ArticlesDashboard navigation={navigation} />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({});
