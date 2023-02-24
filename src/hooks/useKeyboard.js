import { useEffect, useState } from "react";
import { Keyboard } from "react-native";

export const useKeyboard = (enabled, onShow, onHide) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  function onKeyboardDidShow(e) {
    onShow && onShow(e.endCoordinates.height);
    setKeyboardHeight(e.endCoordinates.height);
  }

  function onKeyboardDidHide() {
    onHide && onHide();
    setKeyboardHeight(0);
  }

  useEffect(() => {
    let showKeyboardListener, hideKeyboardListener;
    if (enabled) {
      showKeyboardListener = Keyboard.addListener(
        "keyboardWillShow",
        onKeyboardDidShow
      );
      hideKeyboardListener = Keyboard.addListener(
        "keyboardWillHide",
        onKeyboardDidHide
      );
    }

    return () => {
      if (enabled) {
        try {
          showKeyboardListener?.remove();
          hideKeyboardListener?.remove();
        } catch (err) {
          console.log(err);
        }
      }
    };
  }, []);

  return keyboardHeight;
};
