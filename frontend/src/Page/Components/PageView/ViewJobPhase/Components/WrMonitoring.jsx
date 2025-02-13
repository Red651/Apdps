import {
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Box,
} from "@chakra-ui/react";
import { IconCircleFilled } from "@tabler/icons-react";

const WrMonitoring = ({ data }) => {
  return (
    <Flex direction={"column"}>
      <Heading textAlign={"left"} as="h3" size={"md"} mb={6}>
        Well Readiness Monitoring
      </Heading>
      <Box
        textAlign={"center"}
        display="flex"
        flexFlow={"row wrap"}
        justifyContent={"center"}
        gap={5}
      >
        {data &&
          Object.entries(data).map(([key, value], index) => (
            <Card
              key={index}
              flex={1}
              minW={"18%"}
              borderRadius="lg"
            >
              <CardHeader
                fontSize={"xl"}
                fontWeight={"bold"}
                textAlign="center"
              >
                {key}
              </CardHeader>

              <CardBody
                display="flex"
                justifyContent="center"
                alignItems="center"
                color={
                  value <= 30 ? "red" :
                  value <= 70 ? "orange" :
                  value <= 99 ? "yellow" :
                  "green"
                }
                fontSize="4xl"
                minH="100px"
              >
                <IconCircleFilled size={50} />
              </CardBody>

              <CardBody 
                textAlign="center"
                color="black"
                fontSize="xl"
              >
                {value}%
              </CardBody>
            </Card>
          ))}
      </Box>
    </Flex>
  );
};

export default WrMonitoring;
