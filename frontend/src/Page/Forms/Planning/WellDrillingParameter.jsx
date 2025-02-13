import React from "react";
import CardFormK3 from "../Components/CardFormK3";
import FormInputFile from "../Components/FormInputFile";

const WellDrillingParameter = () => {
  const [formData, setFormData] = React.useState({
    file_id: null,
    filename: null,
  });
  const [file, setFile] = React.useState(null);
 
  return (
    <div>
      <CardFormK3 mt={4} title="Well Drilling Parameter" >
        <FormInputFile onFileSelect={setFile} />
      </CardFormK3>
    </div>
  );
};

export default WellDrillingParameter;
