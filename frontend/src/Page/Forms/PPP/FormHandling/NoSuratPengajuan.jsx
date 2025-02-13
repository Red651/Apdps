import React from "react";
import CardFormK3 from "../../Components/CardFormK3";
import FormControlCard from "../../Components/FormControl";
import { Button, SimpleGrid } from "@chakra-ui/react";

const NoSuratPengajuan = ({onChangeData=(e)=> console.log(e),errorMessage={}}) => {
  const [fieldData, setFieldData] = React.useState({
    nomor_surat_pengajuan_ppp: null,
  });
  // 
  // console.error(errorMessage);
  React.useEffect(()=> {
    onChangeData('nomor_surat_pengajuan_ppp',fieldData.nomor_surat_pengajuan_ppp);
  },[fieldData])
  const handleChange = (e)=> {
    let name = e.target.name
    let value = e.target.value
    
    setFieldData({
      ...fieldData,
      [name]: value,
    });
  }
  return (
    <div>
      <CardFormK3 title="Surat Pengajuan P3" subtitle="* Required" colorSubtitle="red" icon={null}>
        <SimpleGrid columns={1} gap={2}>
          <FormControlCard
          isInvalid={errorMessage?.nomor_surat_pengajuan_ppp}
          errorMessage={errorMessage?.nomor_surat_pengajuan_ppp}
            name={"nomor_surat_pengajuan_ppp"}
            labelForm="No Surat Pengajuan"
            type={"text"}
            placeholder="No Surat"
            value={fieldData.nomor_surat_pengajuan_ppp}
            handleChange={handleChange}
           
          />
        </SimpleGrid>
      </CardFormK3>
    </div>
  );
};

export default NoSuratPengajuan;
