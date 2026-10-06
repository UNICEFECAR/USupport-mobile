import React from "react";
import PropTypes from "prop-types";
import { StyleSheet, View } from "react-native";

import { useGetTheme } from "#hooks";
import { appStyles } from "#styles";

/**
 * Box
 *
 * A base box component that will be used as a wrapper
 *
 * @return {jsx}
 */
export const Box = ({
  borderRadius = "sm",
  boxShadow = 1,
  children,
  style,
  ...props
}) => {
  const { colors } = useGetTheme();

  return (
    <View
      style={[
        appStyles[`shadow${boxShadow}`],
        styles.box,
        { backgroundColor: colors.card },
        styles[borderRadius + "Border"],
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    backgroundColor: appStyles.colorWhite_ff,
    borderWidth: 1,
    borderColor: "transparent",
  },

  xsBorder: {
    borderRadius: 16,
  },
  smBorder: {
    borderRadius: 24,
  },
  mdBorder: {
    borderRadius: 32,
  },
  lgBorder: {
    borderRadius: 48,
  },
});

Box.propTypes = {
  /**
   * Border radius of the box
   */
  borderRadius: PropTypes.oneOf(["xs", "sm", "md", "lg"]),

  /**
   * Box shadow of the box
   * */
  boxShadow: PropTypes.oneOf([1, 2, 3, 4]),

  /**
   * Children to pass to the component
   * */
  children: PropTypes.node,

  /**
   * Additional styles to pass to the component
   * */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),

  /**
   * Additional props to pass to the component
   * */
  props: PropTypes.object,
};

const a = {
  meta: {
    page: {
      "current-page": 1,
      "per-page": 20,
      from: 1,
      to: 11,
      total: 11,
      "last-page": 1,
    },
  },
  links: {
    first:
      "https:\/\/tekst.bg\/api\/v2\/redirects?page%5Bnumber%5D=1&page%5Bsize%5D=20",
    last: "https:\/\/tekst.bg\/api\/v2\/redirects?page%5Bnumber%5D=1&page%5Bsize%5D=20",
  },
  data: [
    {
      type: "redirects",
      id: "1",
      attributes: {
        old_url: "\/chasovnici-pyzeli\/pyzeli",
        new_url: null,
        item_type: "category",
        item_id: 3,
        created_at: "2025-11-03T07:47:04+00:00",
        updated_at: "2025-11-03T07:47:04+00:00",
        full_new_url: "https:\/\/tekst.bg\/category\/pazeli",
        redirect_type: "category",
      },
    },
    {
      type: "redirects",
      id: "2",
      attributes: {
        old_url: "\/възглавници\/magicheski-vyzglavnici",
        new_url: null,
        item_type: "category",
        item_id: 15,
        created_at: "2025-11-03T07:47:04+00:00",
        updated_at: "2025-11-03T07:47:04+00:00",
        full_new_url: "https:\/\/tekst.bg\/category\/magicheski-vazglavnici",
        redirect_type: "category",
      },
    },
    {
      type: "redirects",
      id: "3",
      attributes: {
        old_url: "\/преспапие-двойно-сърце-с-ваши-снимки",
        new_url: null,
        item_type: "product",
        item_id: 63,
        created_at: "2025-11-03T07:47:04+00:00",
        updated_at: "2025-11-03T07:47:04+00:00",
        full_new_url:
          "https:\/\/tekst.bg\/product\/prespapie-dvoyno-sarce-s-vashi-snimki",
        redirect_type: "product",
      },
    },
    {
      type: "redirects",
      id: "4",
      attributes: {
        old_url: "\/vyzglavnica-emotikona",
        new_url: null,
        item_type: "product",
        item_id: 28,
        created_at: "2025-11-03T07:47:04+00:00",
        updated_at: "2025-11-03T07:47:04+00:00",
        full_new_url:
          "https:\/\/tekst.bg\/product\/vazglavnica-emotikona-s-vasha-snimka-1",
        redirect_type: "product",
      },
    },
    {
      type: "redirects",
      id: "5",
      attributes: {
        old_url: "\/vyzglavnica-syrca",
        new_url: null,
        item_type: "product",
        item_id: 21,
        created_at: "2025-11-03T07:47:04+00:00",
        updated_at: "2025-11-03T07:47:04+00:00",
        full_new_url:
          "https:\/\/tekst.bg\/product\/vazglavnica-sarca-s-vasha-snimka",
        redirect_type: "product",
      },
    },
    {
      type: "redirects",
      id: "6",
      attributes: {
        old_url: "\/vyzglavnica-syrce-s-ryce",
        new_url: null,
        item_type: "product",
        item_id: 24,
        created_at: "2025-11-03T07:47:04+00:00",
        updated_at: "2025-11-03T07:47:04+00:00",
        full_new_url:
          "https:\/\/tekst.bg\/product\/vazglavnica-sarce-s-race-s-vasha-snimka",
        redirect_type: "product",
      },
    },
    {
      type: "redirects",
      id: "7",
      attributes: {
        old_url: "\/gotovi-dizaini",
        new_url: null,
        item_type: "category",
        item_id: 16,
        created_at: "2025-11-03T07:47:04+00:00",
        updated_at: "2025-11-03T07:47:04+00:00",
        full_new_url: "https:\/\/tekst.bg\/category\/gotovi-dizayni",
        redirect_type: "category",
      },
    },
    {
      type: "redirects",
      id: "8",
      attributes: {
        old_url: "\/възглавници\/vyzglavnici-syrce",
        new_url: null,
        item_type: "category",
        item_id: 13,
        created_at: "2025-11-03T07:47:04+00:00",
        updated_at: "2025-11-03T07:47:04+00:00",
        full_new_url: "https:\/\/tekst.bg\/category\/vazglavnici-sarce",
        redirect_type: "category",
      },
    },
    {
      type: "redirects",
      id: "9",
      attributes: {
        old_url: "\/chashi-podarak\/cvetni-chashi",
        new_url: null,
        item_type: "category",
        item_id: 9,
        created_at: "2025-11-03T07:47:04+00:00",
        updated_at: "2025-11-03T07:47:04+00:00",
        full_new_url: "https:\/\/tekst.bg\/category\/cvetni-chashi",
        redirect_type: "category",
      },
    },
    {
      type: "redirects",
      id: "10",
      attributes: {
        old_url: "\/puzel-syrce-a3-format",
        new_url: null,
        item_type: "product",
        item_id: 57,
        created_at: "2025-11-03T07:47:04+00:00",
        updated_at: "2025-11-03T07:47:04+00:00",
        full_new_url:
          "https:\/\/tekst.bg\/product\/pazel-sarce-s-vasha-snimka-97-chasti",
        redirect_type: "product",
      },
    },
    {
      type: "redirects",
      id: "11",
      attributes: {
        old_url: "\/category\/bodita",
        new_url: null,
        item_type: "category",
        item_id: 56,
        created_at: "2025-11-03T07:47:04+00:00",
        updated_at: "2025-11-03T07:47:04+00:00",
        full_new_url: "https:\/\/tekst.bg\/category\/bebeshki-bodita-s-nadpisi",
        redirect_type: "category",
      },
    },
  ],
};
