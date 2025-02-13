import { Flex } from "@chakra-ui/react";
import React from "react";

const Seismic = () => {
  return (
    <CardFormK3
      title="Seismic"
      icon={FaOilWell}
      subtitle="Seismic"
      iconColor="black"
      padding="18px 36px"
    >
      <Flex gap={2}>
        <FormControlCard
          labelForm="Seismic Line Name"
          placeholder="Seismic Line Name"
        />
      </Flex>
      <VStack>
        <Flex gap={2}>
          <FormControlCard labelForm="Spud Date " placeholder="Spud Date " />
          <FormControlCard
            type="text"
            labelForm="Final Drill Date"
            placeholder="Final Drill Date "
          />
        </Flex>
      </VStack>
      <HStack>
        <FormControlCard
          type="text"
          labelForm="Completion Date"
          placeholder="Completion Date"
        />
      </HStack>
    </CardFormK3>
  );
};

export default Seismic;
