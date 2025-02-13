import React from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  IconButton,
  Input,
} from "@chakra-ui/react";
import CardFormK3 from "../../Components/CardFormK3";
import FormControlCard from "../../Components/FormControl";
import { IconTrash } from "@tabler/icons-react";
import { SelectComponent, SelectOption } from "../../Components/SelectOption";
import { GetBHAEnum } from "../../../API/APIKKKS";

const BottomHoleAssembly = ({ handleFormData,initialData=null }) => {
  const [formData, setFormData] = React.useState({
    bha_number: null,
    bha_run: null,
    components: [
      {
        component: "",
        outer_diameter: 0,
        length: 0,
      },
    ],
  });

  React.useEffect(() => {
    initialData &&   setFormData(initialData);
    
  },[initialData])

  const [BHAEnum, setBHAEnum] = React.useState([]);
  React.useEffect(() => {
    GetBHAEnum().then((res) => {
      // 
      setBHAEnum(res.data);
    });
  }, []);

  React.useEffect(() => {
    handleFormData(formData);
  }, [formData]);

  const handleInputChange = (field, index) => (e) => {
    const value =
      e.target.type === "number" ? parseFloat(e.target.value) : e.target.value;

    setFormData((prevData) => ({
      ...prevData,
      [field]: value, // Update bha_number or bha_run
      components: prevData.components.map(
        (comp, idx) => (idx === index ? { ...comp, [field]: value } : comp) // Update component fields
      ),
    }));
  };

  const handleAddComponent = () => {
    const newComponent = {
      component: "",
      outer_diameter: 0,
      length: 0,
    };
    setFormData((prevData) => ({
      ...prevData,
      components: [...prevData.components, newComponent],
    }));
  };

  const handleRemoveComponent = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      components: prevData.components.filter((_, idx) => idx !== index),
    }));
  };

  return (
    <Grid templateColumns="repeat(1, 1fr)" gap={4} fontFamily={"Mulish"}>
      <GridItem>
        <CardFormK3
          title="Bottom Hole Assembly"
          padding="18px 8px"
          subtitle="BHA"
        >
          <FormControlCard
            labelForm="BHA Number"
            placeholder="Enter BHA Number"
            type="number"
            value={formData?.bha_number || ""}
            handleChange={handleInputChange("bha_number")}
          />
          <FormControlCard
            labelForm="BHA Run"
            placeholder="Enter BHA Run"
            type="number"
            value={formData?.bha_run || ""}
            handleChange={handleInputChange("bha_run")}
          />
          <Box>
            <strong>Components:</strong>
            <Flex gap={2} flexDirection={"column"}>
              {formData.components.map((comp, index) => (
                <Flex key={index} gap={2} align={"center"}>
                  {/* SelectComponent */}
                  <SelectComponent
                  label=""
                    value={comp?.component}
                    onChange={handleInputChange("component", index)}
                  >
                    {BHAEnum.map((item) => (
                      <SelectOption
                        key={item.id}
                        value={item.value}
                        label={item.name}
                      />
                    ))}
                  </SelectComponent>

                  {/* Input for Outer Diameter */}
                  <Input
                    placeholder="Outer Diameter"
                    type="number"
                    value={comp?.outer_diameter || ""}
                    onChange={handleInputChange("outer_diameter", index)}
                  />

                  {/* Input for Length */}
                  <Input
                    placeholder="Length"
                    type="number"
                    value={comp?.length || ""}
                    onChange={handleInputChange("length", index)}
                  />

                  {/* Icon Button to Remove Component */}
                  <IconButton
                    onClick={() => handleRemoveComponent(index)}
                    icon={<IconTrash />}
                    colorScheme="red"
                    aria-label="Remove Component"
                  />
                </Flex>
              ))}
            </Flex>
            <Button mt={4} colorScheme="blue" onClick={handleAddComponent}>
              Add Component
            </Button>
          </Box>
        </CardFormK3>
      </GridItem>
    </Grid>
  );
};

export default BottomHoleAssembly;
