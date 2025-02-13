import React from "react";
import CardFormK3 from "../../Components/CardFormK3";
import { Grid, GridItem } from "@chakra-ui/react";
import FormControlCard from "../../Components/FormControl";

const HydraulicAnalysisForm = ({
  handleChangeOfData,
  messageError,
  initialData,
}) => {
  const messageErrors = messageError;

  const [formData, setFormData] = React.useState({
    annular_velocity: null,
    pb: null,
    sys_hhp: null,
    hhpb: null,
    hsi: null,
    percent_psib: null,
    jet_velocity: null,
    impact_force: null,
    if_area: null,
  });

  React.useEffect(() => {
    initialData &&
      setFormData({
        annular_velocity: initialData?.annular_velocity,
        pb: initialData?.pb,
        sys_hhp: initialData?.sys_hhp,
        hhpb: initialData?.hhpb,
        hsi: initialData?.hsi,
        percent_psib: initialData?.percent_psib,
        jet_velocity: initialData?.jet_velocity,
        impact_force: initialData?.impact_force,
        if_area: initialData?.if_area,
      });
  }, [initialData]);

  React.useEffect(() => {
    handleChangeOfData(formData);
  }, [formData]);

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
    <CardFormK3 title="Hydraulic Analysis" subtitle="Hydraulic Analysis">
      <Grid templateColumns={"repeat(4, 1fr)"} gap={4}>
        <GridItem>
          <FormControlCard
            labelForm="Annular Velocity"
            placeholder="Annular Velocity"
            type="number"
            name="annular_velocity"
            value={formData.annular_velocity}
            handleChange={handleChangeData("annular_velocity")}
            isInvalid={!!messageErrors?.annular_velocity}
            errorMessage={messageErrors?.annular_velocity}
          />
        </GridItem>
        <GridItem>
          <FormControlCard
            labelForm="Pb"
            placeholder="Pb"
            type="number"
            name="pb"
            value={formData.pb}
            handleChange={handleChangeData("pb")}
            isInvalid={!!messageErrors?.pb}
            errorMessage={messageErrors?.pb}
          />
        </GridItem>
        <GridItem>
          <FormControlCard
            labelForm="Sys HHP"
            placeholder="Sys HHP"
            type="number"
            name="sys_hhp"
            value={formData.sys_hhp}
            handleChange={handleChangeData("sys_hhp")}
            isInvalid={!!messageErrors?.sys_hhp}
            errorMessage={messageErrors?.sys_hhp}
          />
        </GridItem>
        <GridItem>
          <FormControlCard
            labelForm="HHPb"
            placeholder="HHPb"
            type="number"
            name="hhpb"
            value={formData.hhpb}
            handleChange={handleChangeData("hhpb")}
            isInvalid={!!messageErrors?.hhpb}
            errorMessage={messageErrors?.hhpb}
          />
        </GridItem>
        <GridItem>
          <FormControlCard
            labelForm="HSI"
            placeholder="HSI"
            type="number"
            name="hsi"
            value={formData.hsi}
            handleChange={handleChangeData("hsi")}
            isInvalid={!!messageErrors?.hsi}
            errorMessage={messageErrors?.hsi}
          />
        </GridItem>
        <GridItem>
          <FormControlCard
            labelForm="%psib"
            placeholder="%psib"
            type="number"
            name="percent_psib"
            value={formData.percent_psib}
            handleChange={handleChangeData("percent_psib")}
            isInvalid={!!messageErrors?.percent_psib}
            errorMessage={messageErrors?.percent_psib}
          />
        </GridItem>
        <GridItem>
          <FormControlCard
            labelForm="Jet Velocity"
            placeholder="Jet Velocity"
            type="number"
            name="jet_velocity"
            value={formData.jet_velocity}
            handleChange={handleChangeData("jet_velocity")}
            isInvalid={!!messageErrors?.jet_velocity}
            errorMessage={messageErrors?.jet_velocity}
          />
        </GridItem>
        <GridItem>
          <FormControlCard
            labelForm="Impact Force"
            placeholder="Impact Force"
            type="number"
            name="impact_force"
            value={formData.impact_force}
            handleChange={handleChangeData("impact_force")}
            isInvalid={!!messageErrors?.impact_force}
            errorMessage={messageErrors?.impact_force}
          />
        </GridItem>
        <GridItem colSpan={4}>
          <FormControlCard
            labelForm="IF/area"
            placeholder="IF/area"
            type="number"
            name="if_area"
            value={formData.if_area}
            handleChange={handleChangeData("if_area")}
            isInvalid={!!messageErrors?.if_area}
            errorMessage={messageErrors?.if_area}
          />
        </GridItem>
      </Grid>
    </CardFormK3>
  );
};

export default HydraulicAnalysisForm;
