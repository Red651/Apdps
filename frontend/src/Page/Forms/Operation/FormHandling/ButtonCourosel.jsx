import { Box, IconButton, SimpleGrid, Flex } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useState } from "react";
import SimpleButton from "../../Components/SimpleButton";

const ButtonCarousel = ({ dateDataJobPlan, dateNow, setDateNow }) => {
  const itemsPerPage = 24;
  const [visibleRange, setVisibleRange] = useState([0, itemsPerPage]);

  const showNext = () =>
    setVisibleRange(([start, end]) => [
      start + itemsPerPage,
      end + itemsPerPage,
    ]);
  const showPrev = () =>
    setVisibleRange(([start, end]) => [
      Math.max(0, start - itemsPerPage),
      Math.max(itemsPerPage, end - itemsPerPage),
    ]);

  return (
    <Flex width="100%" height={{ base: "auto", md: "250px" }} my={4} justify="center">
      <Flex width="100%" gap={4} alignItems="center" justify="space-between">
        <Box>
          <IconButton
            icon={<ChevronLeftIcon />}
            onClick={showPrev}
            isDisabled={visibleRange[0] === 0}
            aria-label="Previous dates"
            size={{ base: "sm", md: "md" }}
          />
        </Box>
        <Box flex="1" overflow="hidden">
          <SimpleGrid
            columns={{ base: 2, sm: 3, md: 4, lg: 6 }}
            spacing={4}
            justifyItems="center"
          >
            {dateDataJobPlan?.slice(visibleRange[0], visibleRange[1])
              .map((date, index) => (
                <SimpleButton
                  key={index}
                  isActive={date.Date === dateNow}
                  onClick={() => setDateNow(date.Date, date?.Color)}
                  colorScheme={date?.Color}
                  title={date.Date}
                  size="sm"
                  isDisabled={date.Color === "red"}
                />
              ))}
          </SimpleGrid>
        </Box>
        <Box>
          <IconButton
            icon={<ChevronRightIcon />}
            onClick={showNext}
            isDisabled={visibleRange[1] >= dateDataJobPlan?.length}
            aria-label="Next dates"
            size={{ base: "sm", md: "md" }}
          />
        </Box>
      </Flex>
    </Flex>
  );
};

export default ButtonCarousel;
