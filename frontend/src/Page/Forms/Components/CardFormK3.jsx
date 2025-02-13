import { Box, Flex, Icon, Text, VStack } from "@chakra-ui/react";
import { IconBriefcase } from "@tabler/icons-react";
import React from "react";
import { Select } from "@chakra-ui/react";

const HoriontalStack = ({ children }) => {
  return (
    <VStack spacing={4} align="stretch" mt={5}>
      {children}
    </VStack>
  );
};

const SelectOptionRender = ({ options = [],handleChange, value }) => {
  if (options.length === 0) return null;

  return (
    <Select width="auto" onChange={(e) => handleChange(e.target.value)} value={value}>
      {options.map((option, index) => (
        <option key={index} value={option}>
          {option}
        </option>
      ))}
    </Select>
  );
};

const CardFormK3 = ({
  children,
  title = "Title",
  subtitle = "subtitle",
  titleSize = "xl",
  subtitleSize = "md",
  icon = IconBriefcase,
  padding = "18px",
  actionButton,
  OptionDepth,
  OptionDepthStatus = false,
  OptionValue,
  value,
  ...props
}) => {

  const HandleOptionValue  = React.useCallback((value) => {
    OptionValue(value)
  },[OptionValue])
  
  const { color, colorTitle, bgColor, iconColor, colorSubtitle } = props;
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={padding}
      bgColor={bgColor ? bgColor : "white"}
      {...props}
    >
      <Flex justifyContent={"space-between"}>
        <Flex alignItems="center">
          {icon && (
            <Icon
              as={icon}
              boxSize={12}
              color={iconColor ? iconColor : "gray.600"}
              mr={3}
            />
          )}

          <Flex flexDirection={"column"}>
            <Text
              fontSize={titleSize}
              fontWeight="bold"
              color={colorTitle ? colorTitle : "gray.700"}
              fontFamily={"Mulish"}
            >
              {title}
            </Text>
            <Text
              fontSize={subtitleSize}
              color={colorSubtitle ? colorSubtitle : "gray.600"}
              fontFamily={"Mulish"}
            >
              {subtitle}
            </Text>
          </Flex>
        </Flex>
        {actionButton ? actionButton : null}
        {OptionDepth && <SelectOptionRender options={OptionDepth} handleChange={HandleOptionValue} isDisabled={OptionDepthStatus} value={value} />}
      </Flex>

      <VStack spacing={4} align="stretch" mt={5}>
        {children}
      </VStack>
    </Box>
  );
};

CardFormK3.HoriontalStack = HoriontalStack;

export default CardFormK3;
