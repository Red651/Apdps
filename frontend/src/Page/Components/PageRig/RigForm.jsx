import React, { useState } from "react";
import {
  // Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  useToast,
  // Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import { CreateRig } from "../../API/PostKkks";

const CreateRigForm = ({ isOpen, onClose }) => {
  const [rigName, setRigName] = useState("");
  const [rigType, setRigType] = useState("");
  const [rigHorsePower, setRigHorsePower] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = {
      rig_name: rigName,
      rig_type: rigType,
      rig_horse_power: rigHorsePower,
    };

    try {
      const response = await CreateRig(data);

      if (response?.status >= 200 && response?.status < 300) {
        toast({
          title: "Rig berhasil ditambahkan!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setRigName("");
        setRigType("Barge"); // Reset to default value
        setRigHorsePower(0);
        onClose(); // Close the modal after success
      } else {
        throw new Error("Gagal menambahkan Rig. Cek respons API.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Gagal menambahkan Rig.",
        description: error.response?.data?.message || "Silakan coba lagi.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Form Rig</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <FormControl id="rigName" mb="4" isRequired>
              <FormLabel>Nama Rig</FormLabel>
              <Input
                type="text"
                value={rigName}
                onChange={(e) => setRigName(e.target.value)}
                placeholder="Masukkan nama rig"
              />
            </FormControl>

            <FormControl id="rigType" mb="4" isRequired>
              <FormLabel>Rig Type</FormLabel>
              <Select
                value={rigType}
                onChange={(e) => setRigType(e.target.value)}
                placeholder="Pilih Jenis Rig"
              >
                <option value="Land">Land</option>
                <option value="Jackup">Jackup</option>
                <option value="Semi-Submersible">Semi-Submersible</option>
                <option value="Drillship">Drillship</option>
                <option value="Platform">Platform</option>
                <option value="Tender">Tender</option>
                <option value="Barge">Barge</option>
                <option value="Inland Barge">Inland Barge</option>
                <option value="Submersible">Submersible</option>
              </Select>
            </FormControl>

            <FormControl id="rigHorsePower" mb="4" isRequired>
              <FormLabel>Rig Horse Power</FormLabel>
              <NumberInput
                min={0}
                value={rigHorsePower}
                onChange={(valueString) =>
                  setRigHorsePower(Number(valueString))
                }
              >
                <NumberInputField placeholder="Masukkan Horse Power" />
              </NumberInput>
            </FormControl>
          </form>
        </ModalBody>
        <ModalFooter gap={3}>
          <Button
            colorScheme="blue"
            type="submit"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Menambahkan..."
          >
            Tambah Rig
          </Button>
          <Button colorScheme="gray" onClick={onClose}>
            Tutup
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateRigForm;
