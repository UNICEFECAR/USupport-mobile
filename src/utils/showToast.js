import { showMessage } from "react-native-flash-message";
import { appStyles } from "#styles";

export const showToast = ({ message, type = "success" }) => {
  showMessage({
    message,
    type,
    autoHide: true,
    hideStatusBar: true,
    titleStyle: {
      textAlign: "center",
      alignSelf: "center",
    },
    style: {
      backgroundColor:
        type === "success"
          ? appStyles.colorGreen_7ec680
          : appStyles.colorRed_eb5757,
      borderBottomColor:
        type === "success"
          ? appStyles.colorGreen_54cfd9
          : appStyles.colorRed_cc4c4c,
      borderBottomWidth: 1,
      zIndex: 999,
    },
  });
};
