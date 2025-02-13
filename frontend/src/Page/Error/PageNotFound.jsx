import { Flex, Heading } from "@chakra-ui/react";
import React from "react";
import { Image } from "@chakra-ui/react";
import Image404 from "../../assets/404.svg";

const PageNotFound = () => {
  return (
    <Flex
      bg={"white"}
      w={"100vw"}
      h={"100vh"}
      justifyContent={"center"}
      alignItems={"center"}
    >
      <Image src={Image404} alt={"404 Page Not Found"} />
      {/* <Heading fontFamily={"Mulish"}>404 Page Not Found</Heading> */}
    </Flex>
  );
};

export default PageNotFound;
