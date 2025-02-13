import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure, // Untuk mengontrol alert dialog
  Flex,
  Grid,
  GridItem,
  VStack,
  Text,
  Icon,
  Box,
} from "@chakra-ui/react";
import { useRef, useState, useEffect } from "react";
import CardFormK3 from "../../Components/CardFormK3";
import GridLayout from "../../Layout/GridLayout";
import FormControlCard from "../../Components/FormControl";
import { SelectComponent, SelectOption } from "../../Components/SelectOption";
import TableComponent from "../../Components/TableComponent";
import { Button, Badge } from "@chakra-ui/react"; // Import Badge dari Chakra UI
import { createJobIssue, updateJobIssue } from "../../../../Page/API/PostKkks";
import { getWRMIssues } from "../../../../Page/API/APIKKKS";
import { useToast } from "@chakra-ui/react";
import { IconTable } from "@tabler/icons-react";

const WRMUissues = ({ job_id }) => {
  const toast = useToast(); // Inisialisasi toast Chakra UI
  const cancelRef = useRef(); // Referensi untuk cancel button
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure(); // State kontrol alert dialog untuk Resolve
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure(); // State kontrol untuk Create Issue

  const [selectedIssue, setSelectedIssue] = useState(null); // Issue yang dipilih untuk resolve
  const [issues, setIssues] = useState([]); // Menyimpan data issues yang diambil dari API
  const [loading, setLoading] = useState(false); // Menyimpan status loading
  const [formValues, setFormValues] = useState({
    date_time: new Date().toISOString(), // Tanggal dan waktu saat ini
    severity: "",
    description: "",
    resolved: false, // Default: belum diselesaikan
    resolved_date_time: null, // Default: kosong/null
  });

  const LOW_SEVERITY = "LOW";
  const MEDIUM_SEVERITY = "MEDIUM";
  const HIGH_SEVERITY = "HIGH";
  const CRITICAL_SEVERITY = "CRITICAL";

  const jobIdValue = job_id?.job_id || "";

  // Ambil nilai job_id dari props

  // Kolom tabel
  const columns = [
    { Head: "No", accessor: "no" }, // Menambahkan nomor urut
    { Head: "Date", accessor: "date_time" },
    { Head: "Severity", accessor: "severity" },
    { Head: "Description", accessor: "description" },
    {
      Head: "Status",
      render: (row) => (
        <Badge
          colorScheme={row.resolved ? "green" : "red"}
          px={5}
          py={2}
          rounded={"md"}
          fontSize="md"
        >
          {row.resolved ? "RESOLVED" : "ISSUE"}
        </Badge>
      ),
    },
    {
      Head: "Aksi",
      render: (row, index) =>
        !row.resolved && (
          // Jika status "resolved" adalah false, maka tampilkan tombol "Resolve"
          <Button
            colorScheme="blue"
            onClick={() => handleOpenResolveDialog(row)}
          >
            Resolve
          </Button>
        ),
    },
  ];

  // Fungsi untuk membuka dialog konfirmasi resolve
  const handleOpenResolveDialog = (issue) => {
    setSelectedIssue(issue); // Simpan issue yang dipilih
    onOpen(); // Buka AlertDialog
  };

  // Fungsi untuk menangani aksi resolve (PATCH)
  const handleConfirmResolve = async () => {
    setIsLoading(true);
    try {
      if (selectedIssue) {
        const updatedIssue = {
          resolved: true, // Set resolved menjadi true
          resolved_date_time: new Date().toISOString(), // Set waktu resolved ke waktu saat ini
        };
        await updateJobIssue(selectedIssue.id, updatedIssue); // Memanggil endpoint PATCH dengan id issue
        toast({
          title: "Issue Resolved",
          description: `Issue with Description ${selectedIssue.description} has been resolved.`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        fetchIssues(); // Ambil ulang data setelah issue diupdate
      }
      setIsLoading(false);
      onClose(); // Tutup dialog
    } catch (error) {
      setIsLoading(false);
      console.error("Error resolving issue", error);
      toast({
        title: "Error",
        description: "Failed to resolve issue.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk mengambil data issues dari API
  const fetchIssues = async () => {
    setLoading(true);
    try {
      const response = await getWRMIssues(job_id);

      setIssues(Array.isArray(response.data) ? response.data : []); // Mengisi state issues dengan data dari API
    } catch (error) {
      console.error("Error fetching WRM Issues", error);
      setIssues([]); // Set data ke array kosong jika ada error
    } finally {
      setLoading(false);
    }
  };

  // Jalankan fetchIssues saat komponen pertama kali dimuat atau jika job_id berubah
  useEffect(() => {
    // if (jobIdValue) {

    // }
    fetchIssues();
  }, [job_id]);

  // Fungsi untuk menangani perubahan pada input form
  const handleInputChange = (name) => (e) => {
    const newValue = e.target.value;
    setFormValues({
      ...formValues,
      [name]: newValue,
    });
    //
  };

  // Fungsi untuk membuka dialog konfirmasi sebelum membuat issue baru
  const handleOpenCreateDialog = () => {
    onCreateOpen(); // Buka AlertDialog
  };

  // Fungsi untuk mengirim data baru (POST)
  const handleConfirmCreateIssue = async () => {
    try {
      // if (!jobIdValue) {
      //   console.error("Job ID is missing.");
      //   return;
      // }

      const newIssue = {
        ...formValues,
        job_id: jobIdValue,
        date_time: new Date().toISOString(),
        resolved: false,
        resolved_date_time: null,
      };

      //

      const response = await createJobIssue(job_id, newIssue); // Memanggil fungsi createJobIssue dengan data baru dan toast
      //
      fetchIssues(); // Ambil ulang data setelah issue dibuat
      onCreateClose(); // Tutup dialog
      setFormValues({
        severity: "",
        description: "",
      });
    } catch (error) {
      console.error("Error creating job issue", error);
    }
  };

  // Menambahkan nomor pada kolom "No"
  const issuesWithNumbers = issues.map((issue, index) => ({
    ...issue,
    no: index + 1, // Menambahkan nomor urut pada setiap issue
  }));

  const isFormValid = () => {
    return (
      formValues.severity.trim() !== "" && formValues.description.trim() !== ""
    );
  };

  // Render form dan tabel
  return (
    <Box>
      <Grid templateColumns="1fr 1fr" gap={6} borderRadius="lg">
        {/* Left Side - Form */}
        <GridItem>
          <CardFormK3 title="WRM Issues" subtitle="" overflowY="auto">
            <VStack spacing={4} align="stretch">
              <SelectComponent
                label="Severity"
                name="severity"
                value={formValues.severity}
                onChange={handleInputChange("severity")}
                placeholder="Select Severity"
              >
                <SelectOption value={LOW_SEVERITY} label={LOW_SEVERITY} />
                <SelectOption value={MEDIUM_SEVERITY} label={MEDIUM_SEVERITY} />
                <SelectOption value={HIGH_SEVERITY} label={HIGH_SEVERITY} />
                <SelectOption
                  value={CRITICAL_SEVERITY}
                  label={CRITICAL_SEVERITY}
                />
              </SelectComponent>
              <FormControlCard
                labelForm="Issue Description"
                isTextArea
                value={formValues.description}
                onChange={handleInputChange("description")}
              />
              <Button
                colorScheme="green"
                mt={2}
                onClick={handleOpenCreateDialog}
                isDisabled={!isFormValid()} // Tambahkan prop isDisabled
              >
                Create Issue
              </Button>
            </VStack>
          </CardFormK3>
        </GridItem>

        {/* Right Side - Table */}
        <GridItem>
          <VStack spacing={4} align="stretch">
            <CardFormK3
              title="WRM Issues Table"
              subtitle=""
              icon={IconTable}
              overflowY="auto"
            >
              {/* <Box borderWidth={1} borderRadius="lg" p={4}> */}
              {loading ? (
                <div>Loading...</div>
              ) : (
                <TableComponent
                  headers={columns}
                  data={issuesWithNumbers}
                  headerKey="Head"
                />
              )}
              {/* </Box> */}
            </CardFormK3>
          </VStack>
        </GridItem>
      </Grid>

      {/* AlertDialog untuk Resolve */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Resolve Issue
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to resolve this issue? This action cannot be
              undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleConfirmResolve}
                isLoading={isLoading}
                ml={3}
                // isDisabled={!isFormValid()}
              >
                Resolve
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* AlertDialog untuk Create Issue */}
      <AlertDialog
        isOpen={isCreateOpen}
        leastDestructiveRef={cancelRef}
        onClose={onCreateClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Create New Issue
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to create this issue? This action cannot be
              undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onCreateClose}>
                Cancel
              </Button>
              <Button
                colorScheme="green"
                onClick={handleConfirmCreateIssue}
                ml={3}
              >
                Create
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default WRMUissues;
