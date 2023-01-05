import React from "react";
import Svg, {
  Circle,
  Ellipse,
  G,
  Text,
  TSpan,
  TextPath,
  Path,
  Polygon,
  Polyline,
  Line,
  Rect,
  Use,
  Image,
  Symbol,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  ClipPath,
  Pattern,
  Mask,
} from "react-native-svg";

const IconFilter = () => {
  return (
    <Svg
      id="icon-filter"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <G clipPath="url(#clip0_1_564)">
        <Path
          d="M21 4V6H20L15 13.5V22H9V13.5L4 6H3V4H21ZM6.404 6L11 12.894V20H13V12.894L17.596 6H6.404Z"
          fill="#373737"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_1_564">
          <Rect width="24" height="24" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export { IconFilter };
