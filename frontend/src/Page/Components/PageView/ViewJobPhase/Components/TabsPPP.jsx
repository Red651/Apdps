import React, { useCallback, useEffect, useState } from "react";
import { GetViewOperation, GetViewPpp } from "../../../../API/APISKK";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Box,
  Heading,
  Flex,
  Link,
  Card,
  CardHeader,
  CardBody,
  Text,
  OrderedList,
  ListItem,
  Button,
  useToast,
  Skeleton,
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { DownloadIcon, CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { IconCheck, IconArrowDown } from "@tabler/icons-react";
import { GetViewProposed, pathExecute } from "../../../../API/APIKKKS";
import { set } from "lodash";

const TabsOperational = () => {
  const [jobOps, setJobOps] = useState({});
  const [propose, setPropose] = useState();
  const { job_id } = useParams();
  const toast = useToast();
  const proposesPengajuan = propose?.data || {};
  useEffect(() => {
    const fetchData = async () => {
      try {
        const jobOpsResponse = await GetViewPpp(job_id);
        setJobOps(jobOpsResponse?.data || {});

        const proposeResponse = await GetViewProposed(job_id);
        setPropose(proposeResponse || {});
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [job_id]);

  const downloadFile = useCallback(
    async (filePath, fileName) => {
      try {
        const response = await pathExecute(filePath, "get");
        if (response) {
          const blob = new Blob([response], {
            type: "application/octet-stream",
          });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = fileName || "downloaded_file";
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
        } else {
          throw new Error("Failed to download the file. Please try again.");
        }
      } catch (error) {
        toast({
          title: "Download Error",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    },
    [toast]
  );

  const renderDownloadButton = (fileData, label) => {
    return (
      <Button
        colorScheme="blue"
        leftIcon={<DownloadIcon />}
        onClick={() =>
          downloadFile(fileData.file_download_path, fileData.filename)
        }
      >
        {label}
      </Button>
    );
  };

  return (
    <Flex direction="column" gap={4}>
      <Box shadow="lg" padding={4}>
        <TableContainer borderRadius={"lg"}>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th backgroundColor={"gray.100"}>Key</Th>
                <Th backgroundColor={"gray.100"}>Plan</Th>
              </Tr>
            </Thead>
            <Tbody>
              {Object.entries(jobOps).map(([key, value]) => (
                <Tr key={key}>
                  <Td backgroundColor={"gray.100"} p={2}>
                    {key.replace(/_/g, " ").replace(/\w\S*/g, function (txt) {
                      return (
                        txt.charAt(0).toUpperCase() +
                        txt.substr(1).toLowerCase()
                      );
                    })}
                  </Td>
                  <Td>{value !== null ? value.toString() : "N/A"}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
      <Box mt={5} width={"100%"}>
        <Card shadow="lg" padding={3}>
          <CardHeader size="md" mb={3}>
            <Heading size="md">Surat Pengajuan P3</Heading>
          </CardHeader>
          <TableContainer>
            <Table variant="striped">
              <Thead></Thead>
              <Tbody>
                <Td>{proposesPengajuan?.nomor_surat_pengajuan_ppp}</Td>
                <Td>{proposesPengajuan?.surat_pengajuan_ppp?.filename}</Td>
                <Td display="flex" justifyContent={"end"}>
                  {renderDownloadButton(
                    proposesPengajuan?.surat_pengajuan_ppp,
                    "Download"
                  )}
                </Td>
              </Tbody>
            </Table>
          </TableContainer>
        </Card>
      </Box>

      <Flex width={"100%"}>
        <Box width={"100%"} display="flex">
          <Card flexDirection="row" width={"100%"} shadow="lg " padding={3}>
            <CardHeader>
              <Heading size="md">Dokumen Persetujuan AFE/WP&B</Heading>
              <Text>
                Salinan dokumen persetujuan AFE atau WP&B dan ringkasan rencana
                pekerjaan sesuai dengan persetujuan AFE yang disetujui.
              </Text>
            </CardHeader>

            <CardBody display="flex" justifyContent={"end"}>
              {renderDownloadButton(
                proposesPengajuan.dokumen_persetujuan_afe,
                "Download"
              )}
            </CardBody>
          </Card>
        </Box>
      </Flex>

      <Flex width={"100%"}>
        <Box width={"100%"} display="flex">
          <Card
            display="flex"
            flexDirection="row"
            width={"100%"}
            padding={3}
            shadow="lg "
          >
            <CardHeader>
              <Heading size="md">Dokumen Project Summary</Heading>
              <Text>Project Summary Later belakang proyek pekerjaan,</Text>
            </CardHeader>

            <CardBody display="flex" justifyContent={"end"}>
              {renderDownloadButton(
                proposesPengajuan.dokumen_project_summary,
                "Download"
              )}
            </CardBody>
          </Card>
        </Box>
      </Flex>

      <Flex>
        <Box display="flex" width={"100%"}>
          <Card
            display="flex"
            flexDirection="row"
            width={"100%"}
            padding={3}
            shadow="lg "
          >
            <CardHeader>
              <Heading size="md">Dokumen Pernyataan</Heading>
              <Text>
                Pernyataan bahwa data yang disampaikan adalah benardan realisasi
                penyelesaian Pekerjaan berdasarkan kontraksudah sesuai dengan
                Lingkup Kerja yang disetujui BPMA dan peraturan/ketentuan
                yang berlaku.
              </Text>
            </CardHeader>

            <CardBody display="flex" justifyContent={"end"}>
              {renderDownloadButton(
                proposesPengajuan.dokumen_pernyataan,
                "Download"
              )}
            </CardBody>
          </Card>
        </Box>
      </Flex>

      <Flex>
        <Box display="flex" width={"100%"}>
          <Card display="flex" flexDirection="row" shadow="lg" padding={3}>
            <CardHeader>
              <Heading size="md">Dokumen Laporan Pekerjaan</Heading>
              <Text>
                Laporan Pekerjaan yang ditandatangani pejabat KKKSdan berisi
                informasi Berikut: Resume/riwayat singkat operasi kegiatan
                pekerjaanpemboran sumur dari awal/MIRU sampai
                dengankompleksinasi produksi/P&A/Rig Down/Moving. Tabel
                perbandingan rincian kegiatan dan S-curve biayaantara program
                dan aktual lengkap dengan penjelasandetail. Penampang sumur
                rencana awal sebelum kegiatanrencana awal dan aktualnya sesudah
                kegiatan pekerjaansumur (penampang akhir sumur). Data hasil
                tes/produksi/injektivitas rata-rata. Peta koordinat sumur.
                Dokumentasi foto sumur.
              </Text>
            </CardHeader>

            <CardBody display="flex" justifyContent={"end"}>
              {renderDownloadButton(
                proposesPengajuan.dokumen_laporan_pekerjaan,
                "Download"
              )}
            </CardBody>
          </Card>
        </Box>
      </Flex>

      <Flex>
        <Box display="flex" width={"100%"}>
          <Card
            display="flex"
            flexDirection="row"
            width={"100%"}
            padding={3}
            shadow="lg "
          >
            <CardHeader>
              <Heading size="md">Dokumen Formulir</Heading>
              <Text>Formulir Ringkasan Kegiatan Pekerjaan Sumur</Text>
            </CardHeader>

            <CardBody display="flex" justifyContent={"end"}>
              {renderDownloadButton(
                proposesPengajuan.dokumen_formulir,
                "Download"
              )}
            </CardBody>
          </Card>
        </Box>
      </Flex>

      <Flex>
        <Box display="flex" width={"100%"}>
          <Card
            display="flex"
            flexDirection="row"
            padding={3}
            width={"100%"}
            shadow="lg "
          >
            <CardHeader>
              <Heading size="md">Dokumen Korespondensi</Heading>
              <Text>
                Korespondensi, surat menyurat dan/atau Risalah Rapatatas
                perubahan program kerja/casing design, problemsumur/problem
                operasi dan lain-lain sesuaibiaya diuar — persetujuan
              </Text>
            </CardHeader>

            <CardBody display="flex" justifyContent={"end"}>
              {renderDownloadButton(
                proposesPengajuan.dokumen_korespondensi,
                "Download"
              )}
            </CardBody>
          </Card>
        </Box>
      </Flex>

      <Flex>
        <Box display="flex" width={"100%"}>
          <Card
            display="flex"
            flexDirection="row"
            padding={3}
            width={"100%"}
            shadow="lg "
          >
            <CardHeader>
              <Heading size="md">Dokumen Sumur Tidak Berproduksi</Heading>
              <Text>
                Untuk sumur yang ditutup dan tidak akan diproduksikan dilengkapi
                dengan: a. Fotokopi formulir Migas bentuk lxi. b. Data hasil uji
                kandungan lapisan atau hasil logging.
              </Text>
            </CardHeader>

            <CardBody display="flex" justifyContent={"end"}>
              {renderDownloadButton(
                proposesPengajuan.dokumen_sumur_tidak_berproduksi,
                "Download"
              )}
            </CardBody>
          </Card>
        </Box>
      </Flex>

      <Flex>
        <Box display="flex" width={"100%"}>
          <Card
            display="flex"
            flexDirection="row"
            padding={3}
            width={"100%"}
            shadow="lg "
          >
            <CardHeader>
              <Heading size="md">Dokumen Daftar Material</Heading>
              <Text>
                Daftar material dan spare part yang ditandatangani oleh KKKS
              </Text>
            </CardHeader>

            <CardBody display="flex" justifyContent={"end"}>
              {renderDownloadButton(
                proposesPengajuan.dokumen_daftar_material,
                "Download"
              )}
            </CardBody>
          </Card>
        </Box>
      </Flex>
    </Flex>
  );
};

export default TabsOperational;
