import React from "react";
import CardFormK3 from "../../Components/CardFormK3";
import FormControlCard from "../../Components/FormControl";
import GridLayout from "../../Layout/GridLayout";
import { Flex, Grid, GridItem, HStack, VStack } from "@chakra-ui/react";
import { FaOilWell } from "react-icons/fa6";
import { SelectComponent, SelectOption } from "../../Components/SelectOption";
const WellLocation = ({ onData, onChange }) => {
  const [wellLocation, setWellLocation] = React.useState({
    surface_longitude: 0,
    surface_latitude: 0,
    bottom_hole_longitude: 0,
    bottom_hole_latitude: 0,
    maximum_inclination: 0,
  });

  const handleChange = (name, value, type) => {
    if (type === "number") {
      value = parseInt(value) || 0;
    }
    if (type === "text") {
      value = String(value);
    }
    setWellLocation({
      ...wellLocation,
      [name]: value,
    });
  };

  return (
    <CardFormK3
      title="Well Location"
      icon={FaOilWell}
      subtitle="Well Location"
      iconColor="black"
      padding="18px 36px"
    >
      <Flex gap={4}>
        <FormControlCard
          type="number"
          labelForm="Surface Longitude"
          placeholder="Surface Longitude"
          value={wellLocation.surface_longitude}
          handleChange={(e) => handleChange("surface_longitude", e, "number")}
        />
        <FormControlCard
          type="number"
          labelForm="Surface Latitude"
          placeholder="Surface Latitude"
          handleChange={(e) => handleChange("surface_latitude", e, "number")}
          value={wellLocation.surface_latitude}
        />
      </Flex>

      <HStack>
        <FormControlCard
          type="number"
          labelForm="Bottom Hole Longtitude"
          placeholder="Bottom Hole Longtitude"
          handleChange={(e) => handleChange("bottom_hole_longitude", e, "number")}
          value={wellLocation.bottom_hole_longitude}
        />
        <FormControlCard
          type="number"
          labelForm="Bottom Hole Latitude"
          placeholder="Bottom Hole Latitude"
          handleChange={(e) => handleChange("bottom_hole_latitude", e, "number")}
          value={wellLocation.bottom_hole_latitude}
        />
      </HStack>
    </CardFormK3>
  );
};

export default WellLocation;
