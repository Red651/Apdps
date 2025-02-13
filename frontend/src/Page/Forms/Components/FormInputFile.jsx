// FormInputFile.js
import React, { useRef, useState } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  Flex,
  Select,
  Icon
} from "@chakra-ui/react";
import { IconFiles } from "@tabler/icons-react";

const SelectOptionRender = ({ options = [], handleChange }) => {
  if (options.length === 0) return null;

  return (
    <Select width="auto" onChange={(e) => handleChange(e.target.value)}>
      {options.map((option, index) => (
        <option key={index} value={option}>
          <Text textTransform={"Uppercase"}>{option}</Text>
        </option>
      ))}
    </Select>
  );
};

const FormInputFile = ({
  label = "Upload File",
  AcceptedFileOption,
  acceptedFormats = ".csv,.xlsx,.xls",
  acceptedOption = [],
  onFileSelect,
  onClearFile,
  valueName = null,
  onChangeTrigger = () => {
    return;
  },
}) => {
  // 
  const HandleOptionValue = React.useCallback(
    (value) => {
      AcceptedFileOption(value);
    },
    [AcceptedFileOption]
  );
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState("");

  React.useEffect(() => {
    if (valueName) {
      setFileName(valueName);
    }
    if (!valueName) {
      setFileName("");
    }
  }, [valueName]);
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onChangeTrigger();
      setFileName(file.name);
      onFileSelect(file); // Pass the selected file back to the parent component
    }
  };

  React.useEffect(() => {
    if (onClearFile) {
      onClearFile(() => {
        setFileName("");
      });
    }
  }, [onClearFile]);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <FormControl>
      <Flex justifyContent={"space-between"} alignItems="center" mb={2}>
        <FormLabel>{label}</FormLabel>
        <Input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={acceptedFormats}
          hidden
        />
        <Flex gap={4}>
          {acceptedOption && (
            <SelectOptionRender
              options={acceptedOption}
              handleChange={HandleOptionValue}
            />
          )}
          <Button
            onClick={handleButtonClick}
            variant="outline"
            colorScheme="blue"
            leftIcon={<Icon as={IconFiles} />}
          >
            Choose File
          </Button>
        </Flex>
      </Flex>
      {fileName && (
        <Text bg="blue.100" p={2} borderRadius="md">
          Selected File: {fileName}
        </Text>
      )}
    </FormControl>
  );
};

export default FormInputFile;
