import { showMessage, hideMessage } from "react-native-flash-message";
import { appStyles } from "#styles";

export const showToast = ({ message, type = "success", autoHide = true }) => {
  showMessage({
    message,
    type,
    autoHide,
    hideStatusBar: true,
    titleStyle: {
      textAlign: "center",
      alignSelf: "center",
    },
    icon: type === "info" ? "info" : "none",
    style: {
      backgroundColor:
        type === "success"
          ? appStyles.colorGreen_7ec680
          : type === "info"
          ? appStyles.colorBlue_3d527b
          : appStyles.colorRed_eb5757,
      borderBottomColor:
        type === "success"
          ? appStyles.colorGreen_54cfd9
          : type === "info"
          ? appStyles.colorBlue_3d527b
          : appStyles.colorRed_cc4c4c,
      borderBottomWidth: 1,
      zIndex: 999,
    },
  });
};

export const hideToast = () => hideMessage();
