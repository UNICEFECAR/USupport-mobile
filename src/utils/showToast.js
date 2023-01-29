import { showMessage } from "react-native-flash-message";
import { appStyles } from "#styles";

export const showToast = ({ message }) => {
  showMessage({
    message,
    type: "success",
    autoHide: true,
    hideStatusBar: true,
    titleStyle: {
      textAlign: "center",
      alignSelf: "center",
    },
    style: {
      backgroundColor: appStyles.colorGreen_7ec680,
      borderBottomColor: appStyles.colorGreen_54cfd9,
      borderBottomWidth: 1,
      zIndex: 999,
    },
  });
};
