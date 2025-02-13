import React from "react";
import CardFormK3 from "../../Components/CardFormK3";
import { Grid, GridItem } from "@chakra-ui/react";
import FormControlCard from "../../Components/FormControl";

const WeatherForm = ({ data, messageError,initialData=null }) => {
  const messageErrors = messageError;
  const [formData, setFormData] = React.useState({
    temperature_high: 0,
    temperature_low: 0,
    chill_factor: 0,
    wind_speed: 0,
    wind_direction: 0,
    barometric_pressure: 0,
    wave_height: 0,
    wave_current_speed: 0,
    road_condition: "",
    visibility: "",
    daily_operations_report_id: "",
  });

  React.useEffect(() => {
    data(formData);
  }, [formData]);

  React.useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChangeData = React.useCallback(
    (fieldName) => (e) => {
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
    },
    []
  );

  return (
    <CardFormK3 title="Weather" subtitle="Weather Data">
      <Grid templateColumns={"repeat(6, 1fr)"} gap={4}>
        <GridItem colSpan={2}>
          <FormControlCard
            labelForm="Temperature High"
            placeholder="Enter Temperature High"
            type="number"
            name="temperature_high"
            value={formData?.temperature_high}
            handleChange={handleChangeData("temperature_high")}
            isInvalid={!!messageErrors?.temperature_high}
            errorMessage={messageErrors?.temperature_high}
          />
        </GridItem>
        <GridItem colSpan={2}>
          <FormControlCard
            labelForm="Temperature Low"
            placeholder="Enter Temperature Low"
            type="number"
            name="temperature_low"
            value={formData?.temperature_low}
            handleChange={handleChangeData("temperature_low")}
            isInvalid={!!messageErrors?.temperature_low}
            errorMessage={messageErrors?.temperature_low}
          />
        </GridItem>
        <GridItem colSpan={2}>
          <FormControlCard
            labelForm="Chill Factor"
            placeholder="Enter Chill Factor"
            type="number"
            name="chill_factor"
            value={formData?.chill_factor}
            handleChange={handleChangeData("chill_factor")}
            isInvalid={!!messageErrors?.chill_factor}
            errorMessage={messageErrors?.chill_factor}
          />
        </GridItem>
        <GridItem colSpan={3}>
          <FormControlCard
            labelForm="Wind Speed"
            placeholder="Enter Wind Speed"
            type="number"
            name="wind_speed"
            value={formData?.wind_speed}
            handleChange={handleChangeData("wind_speed")}
            isInvalid={!!messageErrors?.wind_speed}
            errorMessage={messageErrors?.wind_speed}
          />
        </GridItem>
        <GridItem colSpan={3}>
          <FormControlCard
            labelForm="Wind Direction"
            placeholder="Enter Wind Direction"
            type="number"
            name="wind_direction"
            value={formData?.wind_direction}
            handleChange={handleChangeData("wind_direction")}
            isInvalid={!!messageErrors?.wind_direction}
            errorMessage={messageErrors?.wind_direction}
          />
        </GridItem>
        <GridItem colSpan={6}>
          <FormControlCard
            labelForm="Barometric Pressure"
            placeholder="Enter Barometric Pressure"
            type="number"
            name="barometric_pressure"
            value={formData?.barometric_pressure}
            handleChange={handleChangeData("barometric_pressure")}
            isInvalid={!!messageErrors?.barometric_pressure}
            errorMessage={messageErrors?.barometric_pressure}
          />
        </GridItem>
        <GridItem colSpan={3}>
          <FormControlCard
            labelForm="Wave Height"
            placeholder="Enter Wave Height"
            type="number"
            name="wave_height"
            value={formData?.wave_height}
            handleChange={handleChangeData("wave_height")}
            isInvalid={!!messageErrors?.wave_height}
            errorMessage={messageErrors?.wave_height}
          />
        </GridItem>
        <GridItem colSpan={3}>
          <FormControlCard
            labelForm="Wave Current Speed"
            placeholder="Enter Wave Current Speed"
            type="number"
            name="wave_current_speed"
            value={formData?.wave_current_speed}
            handleChange={handleChangeData("wave_current_speed")}
            isInvalid={!!messageErrors?.wave_current_speed}
            errorMessage={messageErrors?.wave_current_speed}
          />
        </GridItem>
        <GridItem colSpan={6}>
          <FormControlCard
            labelForm="Road Condition"
            placeholder="Enter Road Condition"
            type="text"
            name="road_condition"
            value={formData?.road_condition}
            handleChange={handleChangeData("road_condition")}
            isInvalid={!!messageErrors?.road_condition}
            errorMessage={messageErrors?.road_condition}
          />
        </GridItem>
        <GridItem colSpan={6}>
          <FormControlCard
            labelForm="Visibility"
            placeholder="Enter Visibility"
            type="text"
            name="visibility"
            value={formData?.visibility}
            handleChange={handleChangeData("visibility")}
            isInvalid={!!messageErrors?.visibility}
            errorMessage={messageErrors?.visibility}
          />
        </GridItem>
      </Grid>
    </CardFormK3>
  );
};

export default WeatherForm;
