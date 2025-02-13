import React from "react";
import PerhitunganCard from "./Card/CardPerhitunganBox";
import { Flex } from "@chakra-ui/react";
import { FaFileArchive } from "react-icons/fa";
import { FaCheck, FaCopy } from "react-icons/fa6";
import { MdOutlineVerified } from "react-icons/md";

const ExplorationSKK = () => {
  return (
    <div>
      
      <Flex gap={6}>
        <PerhitunganCard number={5} icon={FaCopy} label="Rencana" subLabel="WP&B Year 2024" />
        <PerhitunganCard number={5} icon={FaCheck} bgIcon="green.100" iconColor="green.500" label="Total SKK" subLabel="Total SKK" />
        <PerhitunganCard number={5} label="Total SKK" bgIcon="red.100" iconColor="red.500"  icon={MdOutlineVerified} subLabel="Total SKK" />
      </Flex>
    </div>
  );
};

export default ExplorationSKK;
