import React from "react";
import {
  DocPengajuanP3,
  DocWPB,
  DocProjSummary,
  DocPernyataan,
  DocLapPekerjaan,
  DocFormulir,
  DocKorepondensi,
  DocNotProduction,
  DocListMaterial,
  DocsOthers,
  AFENumber,
} from "./utils/SharedComponent";
import CardFormK3 from "../Components/CardFormK3";
import { FaPlus } from "react-icons/fa6";
import { Button, useToast, Flex } from "@chakra-ui/react";
import NoSuratPengajuan from "./FormHandling/NoSuratPengajuan";
import { PostPPP } from "../../API/PostKkks";
import { useParams } from "react-router-dom";
import { set } from "lodash";

const SubmitP3 = () => {
  const toast = useToast();
  const {job_id} = useParams();
  const [formErrors, setFormErrors] = React.useState({});
  //  
  const validatioError = (data) => {
    let error = {};
    data.nomor_surat_pengajuan_ppp === null ? (error.nomor_surat_pengajuan_ppp = "Nomor Surat Pengajuan Is Required") : null;

    return Object.keys(error).length > 0 ? error : null;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if(validatioError(handleData)){
       throw {
        response: {
          status: 422,
          data: validatioError(handleData)
        }
       }
      }
      const response = await PostPPP(job_id, handleData);

      if (response.status === 200) {
        toast({
          title: response.message,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      setTimeout(() => {
        window.history.back(); // Navigasi ke halaman sebelumnya
      }, 3000);
      

    } catch(error) {
      // console.error(error);
      if(error.response.status === 422){
        toast({
          title: "Entity Required",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
        setFormErrors(error.response.data);
        
      }

    }
  };

  const [handleData, setHandleData] = React.useState({
    surat_pengajuan_ppp: {
      file_id: null,
      filename: null,
    },
    nomor_surat_pengajuan_ppp: null,
    dokumen_persetujuan_afe: {
      file_id: null,
      filename: null,
    },
    dokumen_project_summary: {
      file_id: null,
      filename: null,
    },
    dokumen_pernyataan: {
      file_id: null,
      filename: null,
    },
    dokumen_laporan_pekerjaan: {
      file_id: null,
      filename: null,
    },
    dokumen_formulir: {
      file_id: null,
      filename: null,
    },
    dokumen_korespondensi: {
      file_id: null,
      filename: null,
    },
    dokumen_sumur_tidak_berproduksi: {
      file_id: null,
      filename: null,
    },
    dokumen_daftar_material: {
      file_id: null,
      filename: null,
    },
    dokumen_lainnya: [],
  });
  

  const handleChangeOfData = React.useCallback(
    (name, data) => {
      setHandleData((prev) => ({ ...prev, [name]: data }));
    },
    [handleData]
  );
  const renderButton = () => {
    return (
      <Button colorScheme="blue" onClick={handleSubmit} size={"md"} px={10}>
        Save
      </Button>
    );
  };
  return (
    <Flex flexDirection={"column"} fontFamily={"Mulish"}>
      <CardFormK3
        title="AJUKAN P3"
        icon={FaPlus}
        subtitle=""
        actionButton={renderButton()}
        fontFamily={"Mulish"}
      >
        <AFENumber />
        <NoSuratPengajuan onChangeData={handleChangeOfData} errorMessage={formErrors}  />
        <DocPengajuanP3 onChangeOnData={handleChangeOfData} />
        <DocWPB onChangeData={handleChangeOfData} />
        <DocProjSummary onChangeOnData={handleChangeOfData} />
        <DocPernyataan onChangeData={handleChangeOfData} />
        <DocLapPekerjaan onChangeData={handleChangeOfData} />
        <DocFormulir onChangeData={handleChangeOfData} />
        <DocKorepondensi onChangeData={handleChangeOfData} />
        <DocNotProduction onChangeData={handleChangeOfData} />
        <DocListMaterial onChangeData={handleChangeOfData} />
        <DocsOthers
          onChange={(path, data) =>
            setHandleData((prev) => ({ ...prev, dokumen_lainnya: data }))
          }
        />
      </CardFormK3>
    </Flex>
  );
};

export default SubmitP3;
