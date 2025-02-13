import ProposedJob from "../FormHandling/ProposedJob";
import JobOpertionsDays from "../FormHandling/JobOperationDays";
import HazardType from "../FormHandling/HazardType";
import JobDocuments from "../FormHandling/JobDocuments";
import WBSRev from "../FormHandling/WBSOperation";
import JobProjectManagementTeam from "../FormHandling/JobProjectManagementTeam";
import JobEquipments from "../FormHandling/JobEquipments";
import JobHSEAspect from "../FormHandling/JobHSEAspect";
import {
  Grid,
  GridItem,
  Button,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { useRef } from "react";
import { useParams } from "react-router-dom";
import { putPlanningUpdate } from "../../../API/PostKkks";
import { useJobContext } from "../../../../Context/JobContext";

const Operational = ({ jobType }) => {
  const { job_id } = useParams();
  const { state } = useJobContext();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  const handleUpdate = async () => {
    const data = state.updatedOperationData;

    try {
      await putPlanningUpdate(job_id, data, jobType);
      toast({
        title: "Update Successful",
        description: "Data has been successfully updated.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "There was an error updating the data.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Grid gap={4}>
      <GridItem>
        <ProposedJob TypeOperasional={"EXPLORATION"} />
      </GridItem>
      <GridItem>
        <WBSRev />
      </GridItem>
      <GridItem>
        <JobOpertionsDays />
      </GridItem>
      <GridItem>
        <HazardType />
      </GridItem>
      <GridItem>
        <JobProjectManagementTeam />
      </GridItem>
      <GridItem>
        <JobEquipments />
      </GridItem>
      <GridItem>
        <JobHSEAspect />
      </GridItem>
      <GridItem>
        <JobDocuments />
      </GridItem>
      <GridItem>
        <Button
          colorScheme="blue"
          size={"lg"}
          onClick={onOpen}
          variant="outline"
          width="full"
        >
          Update Data
        </Button>
      </GridItem>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirm Update
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to update the data? This action cannot be
              undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={() => {
                  handleUpdate().then(() => {
                    setTimeout(() => {
                      window.scrollTo(0, 0);
                      window.location.reload();
                    }, 2000);
                  });
                  onClose();
                }}
                ml={3}
              >
                Confirm
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Grid>
  );
};

export default Operational;
