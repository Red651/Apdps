import React from "react";
import CardFormK3 from "../../Components/CardFormK3";
import { Grid, GridItem } from "@chakra-ui/react";
import FormControlCard from "../../Components/FormControl";

const CasingOps = ({ handleChangeOfData, messageError, initialData }) => {
  const messageErrors = messageError;
  const [formData, setFormData] = React.useState({
    start: null,
    set_md: null,
    next_size: null,
    next_set_md: null,
    last_lot_emw: null,
    tol: null,
    last_size: null,
  });

  React.useEffect(() => {
    initialData &&
      setFormData({
        start: initialData?.start,
        set_md: initialData?.set_md,
        next_size: initialData?.next_size,
        next_set_md: initialData?.next_set_md,
        last_lot_emw: initialData?.last_lot_emw,
        tol: initialData?.tol,
        last_size: initialData?.last_size,
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
    <CardFormK3 title="Casing" subtitle="Casing">
      <Grid templateColumns={"repeat(2, 1fr)"} gap={4}>
        <GridItem>
          <FormControlCard
            labelForm="Start"
            placeholder="Start"
            type="number"
            name="start"
            value={formData.start}
            handleChange={handleChangeData("start")}
            isInvalid={!!messageErrors?.start}
            errorMessage={messageErrors?.start}
          />
        </GridItem>
        <GridItem>
          <FormControlCard
            labelForm="Set MD"
            placeholder="Set MD"
            type="number"
            name="set_md"
            value={formData.set_md}
            handleChange={handleChangeData("set_md")}
            isInvalid={!!messageErrors?.set_md}
            errorMessage={messageErrors?.set_md}
          />
        </GridItem>
        <GridItem>
          <FormControlCard
            labelForm="Next Size"
            placeholder="Next Size"
            type="text"
            name="next_size"
            value={formData.next_size}
            handleChange={handleChangeData("next_size")}
            isInvalid={!!messageErrors?.next_size}
            errorMessage={messageErrors?.next_size}
          />
        </GridItem>
        <GridItem>
          <FormControlCard
            labelForm="Set MD 2"
            placeholder="Set MD 2"
            type="number"
            name="next_set_md"
            value={formData.next_set_md}
            handleChange={handleChangeData("next_set_md")}
            isInvalid={!!messageErrors?.next_set_md}
            errorMessage={messageErrors?.next_set_md}
          />
        </GridItem>
        <GridItem>
          <FormControlCard
            labelForm="Last LOT EMW"
            placeholder="Last LOT EMW"
            type="text"
            name="last_lot_emw"
            value={formData.last_lot_emw}
            handleChange={handleChangeData("last_lot_emw")}
            isInvalid={!!messageErrors?.last_lot_emw}
            errorMessage={messageErrors?.last_lot_emw}
          />
        </GridItem>
        <GridItem>
          <FormControlCard
            labelForm="TOL"
            placeholder="TOL"
            type="text"
            name="tol"
            value={formData.tol}
            handleChange={handleChangeData("tol")}
            isInvalid={!!messageErrors?.tol}
            errorMessage={messageErrors?.tol}
          />
        </GridItem>
        <GridItem>
          <FormControlCard
            labelForm="Last Size"
            placeholder="Last Size"
            type="number"
            name="last_size"
            value={formData.last_size}
            handleChange={handleChangeData("last_size")}
            isInvalid={!!messageErrors?.last_size}
            errorMessage={messageErrors?.last_size}
          />
        </GridItem>
      </Grid>
    </CardFormK3>
  );
};

export default CasingOps;
