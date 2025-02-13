import React from "react";
import CardFormK3 from "../../Components/CardFormK3";
import { Grid, GridItem } from "@chakra-ui/react";
import FormControlCard from "../../Components/FormControl";

const MudVolumes = ({ handleChangeOfData, messageError,initialData=null }) => {
  const messageErrors = messageError;
  const [formData, setFormData] = React.useState({
    start_mud_volume: null,
    lost_surface_mud_volume: null,
    lost_dh_mud_volume: null,
    dumped_mud_volume: null,
    built_mud_volume: null,
    ending_mud_volume: null,
  });

  React.useEffect(() => {
    handleChangeOfData(formData);
  }, [formData]);

  React.useEffect(() => {
    initialData && setFormData({
      start_mud_volume: initialData?.start_mud_volume,
      lost_surface_mud_volume: initialData?.lost_surface_mud_volume,
      lost_dh_mud_volume: initialData?.lost_dh_mud_volume,
      dumped_mud_volume: initialData?.dumped_mud_volume,
      built_mud_volume: initialData?.built_mud_volume,
      ending_mud_volume: initialData?.ending_mud_volume,
    })
  },[initialData])
  const handleChangeData = (fieldName) => (e) => {
    let { value, type } = e.target;

    if (type === "number") {
      value = value.includes(".") ? parseFloat(value) : parseInt(value, 10);
      if (isNaN(value)) value = "";
    } else {
      value = value.toString();
    }

    setFormData((prevData) => ({
      ...prevData,
      [fieldName]: value,
    }));
  };

  return (
    <CardFormK3 title="Mud Volumes" subtitle="Mud Volumes">
      <Grid templateColumns={"repeat(2, 1fr)"} gap={4}>
        <GridItem>
          <FormControlCard
            labelForm="Start Mud Volume"
            placeholder="Start Mud Volume"
            type="number"
            name="start_mud_volume"
            value={formData.start_mud_volume}
            handleChange={handleChangeData("start_mud_volume")}
            isInvalid={!!messageErrors?.start_mud_volume}
            errorMessage={messageErrors?.start_mud_volume}
          />
        </GridItem>
        <GridItem>
          <FormControlCard
            labelForm="Lost Surface Mud Volume"
            placeholder="Lost Surface Mud Volume"
            type="number"
            name="lost_surface_mud_volume"
            value={formData.lost_surface_mud_volume}
            handleChange={handleChangeData("lost_surface_mud_volume")}
            isInvalid={!!messageErrors?.lost_surface_mud_volume}
            errorMessage={messageErrors?.lost_surface_mud_volume}
          />
        </GridItem>
        <GridItem>
          <FormControlCard
            labelForm="Lost DH Mud Volume"
            placeholder="Lost DH Mud Volume"
            type="number"
            name="lost_dh_mud_volume"
            value={formData.lost_dh_mud_volume}
            handleChange={handleChangeData("lost_dh_mud_volume")}
            isInvalid={!!messageErrors?.lost_dh_mud_volume}
            errorMessage={messageErrors?.lost_dh_mud_volume}
          />
        </GridItem>
        <GridItem>
          <FormControlCard
            labelForm="Dumped Mud Volume"
            placeholder="Dumped Mud Volume"
            type="number"
            name="dumped_mud_volume"
            value={formData.dumped_mud_volume}
            handleChange={handleChangeData("dumped_mud_volume")}
            isInvalid={!!messageErrors?.dumped_mud_volume}
            errorMessage={messageErrors?.dumped_mud_volume}
          />
        </GridItem>
        <GridItem>
          <FormControlCard
            labelForm="Built Mud Volume"
            placeholder="Built Mud Volume"
            type="number"
            name="built_mud_volume"
            value={formData.built_mud_volume}
            handleChange={handleChangeData("built_mud_volume")}
            isInvalid={!!messageErrors?.built_mud_volume}
            errorMessage={messageErrors?.built_mud_volume}
          />
        </GridItem>
        <GridItem>
          <FormControlCard
            labelForm="Ending Mud Volume"
            placeholder="Ending Mud Volume"
            type="number"
            name="ending_mud_volume"
            value={formData.ending_mud_volume}
            handleChange={handleChangeData("ending_mud_volume")}
            isInvalid={!!messageErrors?.ending_mud_volume}
            errorMessage={messageErrors?.ending_mud_volume}
          />
        </GridItem>
      </Grid>
    </CardFormK3>
  );
};

export default MudVolumes;
