import React from "react";
import RenderHtml from "react-native-render-html";
import Constants from "expo-constants";

import { useGetTheme } from "#hooks";
import { appStyles } from "#styles";

// Inter loaded via @expo-google-fonts/inter in App.js; fallback to platform fonts
const systemFonts = [
  "Inter_400Regular",
  "Inter_600SemiBold",
  "Inter_700Bold",
  ...(Constants.systemFonts ?? []),
];

export const CKRenderer = ({ data }) => {
  const { colors, isDarkMode } = useGetTheme();
  return (
    <RenderHtml
      systemFonts={systemFonts}
      contentWidth={appStyles.screenWidth * 0.9}
      source={{
        html: `<html><body>${data}</body></html>`,
      }}
      baseStyle={{
        color: isDarkMode ? "#ffffff" : colors.text || "#000000",
        fontFamily: "Inter_400Regular",
      }}
      renderers={{
        tr: (props) => {
          const { TDefaultRenderer, ...rest } = props;
          // Check parent's DOM node tagName to determine if it's tbody
          const parentDomNode = rest.tnode?.parent?.init?.domNode;
          const parentTagName = parentDomNode?.tagName?.toLowerCase();
          const isInTbody = parentTagName === "tbody";
          const isInThead = parentTagName === "thead";

          // Use __nodeIndex to determine row index (0-based)
          // For tbody rows, we want to start counting from 0 for alternating colors
          const rowIndex = rest.tnode?.__nodeIndex ?? 0;

          // Store row index and parent info in tnode for td to access
          if (rest.tnode) {
            rest.tnode.rowIndex = rowIndex;
            rest.tnode.isInTbody = isInTbody;
            rest.tnode.isInThead = isInThead;
          }

          return (
            <TDefaultRenderer
              {...rest}
              style={[
                {
                  borderBottomWidth: 0.5,
                  borderBottomColor: colors.border || "#ccc",
                },
                rest.style,
              ]}
            />
          );
        },
        td: (props) => {
          const { TDefaultRenderer, ...rest } = props;
          const parentRow = rest.tnode?.parent;
          const rowIndex = parentRow?.rowIndex ?? 0;

          // Check if this is a header cell (th) - if so, don't apply alternating colors
          const cellTagName = rest.tnode?.init?.domNode?.tagName?.toLowerCase();
          const isHeaderCell = cellTagName === "th";

          // Check if the row contains th cells (header row)
          const rowChildren = parentRow?.children || [];
          const hasHeaderCells = rowChildren.some(
            (child) => child?.init?.domNode?.tagName?.toLowerCase() === "th"
          );

          // Apply alternating colors to data rows only (skip header row at index 0)
          // For data rows: row 1 (index 1) = even, row 2 (index 2) = odd, row 3 (index 3) = even, etc.
          const isDataRow = !hasHeaderCells && rowIndex > 0;
          const isEvenDataRow = isDataRow && rowIndex % 2 === 1; // Index 1, 3, 5... are "even" data rows

          const cellBackgroundColor =
            isDataRow && !isHeaderCell && isEvenDataRow
              ? isDarkMode
                ? "rgba(255, 255, 255, 0.05)"
                : "#eaeaea"
              : "transparent";

          return (
            <TDefaultRenderer
              {...rest}
              style={[
                {
                  borderWidth: 0.5,
                  borderColor: colors.border || "#ccc",
                  padding: 8,
                  backgroundColor: cellBackgroundColor,
                  fontFamily: "Inter_400Regular",
                },
                rest.style,
              ]}
            />
          );
        },
      }}
      tagsStyles={{
        p: {
          marginTop: 0,
          marginBottom: 8,
          fontFamily: "Inter_400Regular",
        },
        img: {
          margin: 0,
        },
        ol: {
          marginTop: 0,
          marginBottom: 8,
          paddingLeft: 20,
          paddingRight: 8,
          paddingTop: 4,
          paddingBottom: 4,
          fontFamily: "Inter_400Regular",
        },
        ul: {
          marginTop: 0,
          marginBottom: 8,
          paddingLeft: 20,
          paddingRight: 8,
          paddingTop: 4,
          paddingBottom: 4,
          fontFamily: "Inter_400Regular",
        },
        li: {
          marginTop: 4,
          marginBottom: 4,
          paddingLeft: 4,
          fontFamily: "Inter_400Regular",
        },
        span: {
          fontFamily: "Inter_400Regular",
        },
        div: {
          fontFamily: "Inter_400Regular",
        },
        strong: {
          fontFamily: "Inter_700Bold",
        },
        em: {
          fontFamily: "Inter_400Regular",
        },
        b: {
          fontFamily: "Inter_700Bold",
        },
        i: {
          fontFamily: "Inter_400Regular",
        },
        h1: {
          fontFamily: "Inter_700Bold",
        },
        h2: {
          fontFamily: "Inter_700Bold",
        },
        h3: {
          fontFamily: "Inter_700Bold",
        },
        h4: {
          fontFamily: "Inter_600SemiBold",
        },
        h5: {
          fontFamily: "Inter_600SemiBold",
        },
        h6: {
          fontFamily: "Inter_600SemiBold",
        },
        a: {
          fontFamily: "Inter_400Regular",
        },
        table: {
          borderWidth: 0.5,
          borderColor: colors.border || "#ccc",
          borderCollapse: "collapse",
          marginTop: 8,
          marginBottom: 8,
          width: "100%",
        },
        thead: {
          backgroundColor: isDarkMode ? "#333" : "#66768d",
        },
        tbody: {
          backgroundColor: "transparent",
        },
        th: {
          borderWidth: 0.5,
          borderColor: colors.border || "#ccc",
          padding: 8,
          fontWeight: "bold",
          backgroundColor: isDarkMode ? "#333" : "#66768d",
          color: "#ffffff",
          fontFamily: "Inter_700Bold",
        },
        td: {
          padding: 8,
          fontFamily: "Inter_400Regular",
        },
      }}
    />
  );
};
