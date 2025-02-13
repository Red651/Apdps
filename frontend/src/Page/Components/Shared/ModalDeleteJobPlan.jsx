import React from "react";
import ModalAndContent from "../../Forms/Components/ModalAndContent";
import { Box, Button, Flex, Text, useToast } from "@chakra-ui/react";
import { handleDelete } from "../utils/HandleDelete";

const ModalDeleteJobPlan = ({ isOpen, onClose, job_id,  }) => {
  
  const toast = useToast();
  const handleDetele = async () => {
    await handleDelete(job_id).then((res) => {
      if (res.status === 200) {
        toast({
          title: "Success",
          description: "Job Delete Success",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onClose();
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    }).catch((error) => {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to delete job",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    });
  };
  const ActionButtonDelete = ({ onClick, onClose }) => {
    return (
      <Flex gap={2}>
        <Button colorScheme="red" onClick={onClick}>Delete</Button>
        <Button onClick={onClose}>Cancel</Button>
      </Flex>
    );
  };
  return (
    <ModalAndContent
      onClose={onClose}
      isOpen={isOpen}
      title="Confirm Delete"
      actionButton={
        <ActionButtonDelete onClose={onClose} onClick={handleDetele} />
      }
      scrollBehavior="inside"
    >
      <Text>Are you sure you want to delete this file?</Text>
    </ModalAndContent>
  );
};

export default ModalDeleteJobPlan;
