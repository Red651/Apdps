import React from "react";
import { Button } from "@chakra-ui/react";
const SimpleButton = ({
  title,
  padding = "7px 11px 7px 11px",
  colorScheme = "blue",
  width = "147px",
  height = "53px",
  borderRadius = "12px",
  size = "lg",
  onClick,
  isActive = false,
  props,
  isDisabled = false,
}) => {
  return (
    <Button
      colorScheme={colorScheme}
      p={padding}
      width={width}
      height={height}
      borderRadius={borderRadius}
      fontSize={size}
      onClick={onClick}
      isActive={isActive}
      isDisabled={isDisabled}
      {...props}
    >
      {title}
    </Button>
  );
};

export default SimpleButton;
