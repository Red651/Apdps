import React from "react";
import { FormControl, FormLabel, Input } from "@chakra-ui/react";

const FormControlDateTime = ({
  label = "Select Date & Time",
  value,
  onChange,
  isDisabled = false,
}) => {
  const handleChange = React.useCallback((e) => {
    onChange(e.target.value);
  }, [onChange]);
  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <Input
        type="datetime-local"
        // value={value}
        onChange={handleChange}
        isDisabled={isDisabled}
      />
    </FormControl>
  );
};

export default FormControlDateTime;
