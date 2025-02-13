// IncidentTable.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Flex,
  SimpleGrid,
} from "@chakra-ui/react";
import FormControlCard from "../../Components/FormControl";

const IncidentTable = ({ handleOnChangeData,initialData=null }) => {
  const [incidentData, setIncidentData] = useState([]);
  const [errorMsg, setErrorMsg] = useState({});
  const [incidentForm, setIncidentForm] = useState({
    incidents_time: "",
    incident: "",
    incident_type: "",
    comments: "",
  });

  React.useEffect(() => {
    initialData  && setIncidentData(initialData)
  },[initialData])

  const handleInputChange = (name) => (e) => {
    setIncidentForm((prevData) => ({
      ...prevData,
      [name]: e.target.value,
    }));
  };

  const errorValidation = () => {
    let errorMessage = {};
    if (!incidentForm.incidents_time)
      errorMessage.incidents_time = "Input Incident Time Is Required";
    if (!incidentForm.incident)
      errorMessage.incident = "Input Incident Is Required";
    if (!incidentForm.incident_type) errorMessage.incident_time = "Input Type Is Required";
    if (!incidentForm.comments)
      errorMessage.comments = "Input Type Is Required";

    setErrorMsg(errorMessage);
    
    return Object.keys(errorMessage).length === 0;
  };

  const handleAddIncident = () => {
    if (errorValidation()) {
      setIncidentData((prevData) => [...prevData, incidentForm]);
      setIncidentForm({
        incidents_time: "",
        incident: "",
        incident_type: "",
        comments: "",
      });
    }
  };

  React.useEffect(() => {
    handleOnChangeData(incidentData);
  }, [incidentData]);

  const handleDeleteIncident = (index) => {
    setIncidentData((prevData) => prevData.filter((_, i) => i !== index));
  };

  return (
    <SimpleGrid columns={2} gap={4} mt={4}>
      {/* Form Input Section */}
      <Box>
        <SimpleGrid columns={1} gap={4} mb={4}>
          <FormControlCard
            labelForm="Incident Time"
            placeholder="Incident Time"
            type="time"
            step={99}
            value={incidentForm.incidents_time}
            handleChange={handleInputChange("incidents_time")}
            errorMessage={errorMsg.incidents_time}
            isInvalid={!!errorMsg.incidents_time}
          />
          <FormControlCard
            labelForm="Incident"
            placeholder="Incident"
            type="text"
            value={incidentForm.incident}
            errorMessage={errorMsg.incident}
            isInvalid={!!errorMsg.incident}
            handleChange={handleInputChange("incident")}
          />
          <FormControlCard
            labelForm="Type"
            placeholder="Type"
            type="text"
            errorMessage={errorMsg.incident_type}
            isInvalid={!!errorMsg.incident_type}
            value={incidentForm.incident_type}
            handleChange={handleInputChange("incident_type")}
          />
          <FormControlCard
            labelForm="Comments"
            placeholder="Comments"
            type="text"
            errorMessage={errorMsg.comments}
            isInvalid={!!errorMsg.comments}
            value={incidentForm.comments}
            handleChange={handleInputChange("comments")}
          />

          <Button colorScheme="blue" onClick={handleAddIncident}>
            Add Incident
          </Button>
        </SimpleGrid>
      </Box>

      {/* Table Section */}
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Incident Time</Th>
              <Th>Incident</Th>
              <Th>Type</Th>
              <Th>Comments</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {incidentData.map((incident, index) => (
              <Tr key={index}>
                <Td>{incident.incidents_time}</Td>
                <Td>{incident.incident}</Td>
                <Td>{incident.incident_type}</Td>
                <Td>{incident.comments}</Td>
                <Td>
                  <Button
                    colorScheme="red"
                    onClick={() => handleDeleteIncident(index)}
                  >
                    Delete
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </SimpleGrid>
  );
};

export default IncidentTable;
