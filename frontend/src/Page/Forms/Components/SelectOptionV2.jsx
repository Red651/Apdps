import React, { useCallback } from "react";
import {
  FormControl as ChakraFormControl,
  FormLabel,
  Select as ChakraSelect,
  Flex,
  FormErrorMessage,
  Tooltip,
  Icon
} from "@chakra-ui/react";
import { IconInfoCircle } from "@tabler/icons-react";
import LabelForm from "../../Components/Form/LabelForm";
// Rename Option to SelectOption to avoid conflict with DOM API
const SelectOptionV2 = ({ value, label }) => {
  return <option value={value}>{label}</option>;
};

// Select Component
const SelectComponentV2 = ({
  label = "Select Label",
  name,
  value,
  onChange,
  placeholder = "Select an option",
  align = "Vertical", // Determines if the layout is horizontal or vertical
  children,
  isInvalid = false, // New prop to handle validation
  errorMessage = "", // New prop for error message
  desc = "",
  ...props
}) => {
  // Memoize the onChange handler to avoid unnecessary re-renders
  

  return (
    <ChakraFormControl isInvalid={isInvalid}>
      {align === "Horizontal" ? (
        <Flex alignItems="center" gap={4}>
          <LabelForm
            title={label}
            desc={desc}
          />
          <ChakraSelect
            name={name}
            value={value ? value : ""}
            onChange={onChange}
            flex="1"
            {...props}
          >
            <option disabled value="">
              {placeholder}
            </option>
            {children}
          </ChakraSelect>
        </Flex>
      ) : (
        <>
          <LabelForm
            title={label}
            desc={desc}
          />
          <ChakraSelect
            name={name}
            value={value ? value : ""}
            onChange={onChange}
            {...props}
          >
            <option disabled value="">
              {placeholder}
            </option>
            {children}
          </ChakraSelect>
        </>
      )}
      {isInvalid && <FormErrorMessage>{errorMessage}</FormErrorMessage>}
    </ChakraFormControl>
  );
};

export { SelectComponentV2, SelectOptionV2 };
