import React from "react";
import { FormLabel, Tooltip, Icon } from "@chakra-ui/react";
import { IconInfoCircle } from "@tabler/icons-react";

export const HeaderForm = ({ title, desc }) => (
  <FormLabel display={"flex"} gap={2} alignItems={"center"} fontFamily={"Mulish"}>
    {title}
    {desc && (
      <Tooltip label={desc}>
        <Icon as={IconInfoCircle} boxSize={4} />
      </Tooltip>
    )}
  </FormLabel>
);
export default HeaderForm;

