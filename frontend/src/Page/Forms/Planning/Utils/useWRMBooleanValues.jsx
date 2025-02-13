import { useMemo } from 'react';

const useWRMBooleanValues = (data) => {
  const wrmBooleanValues = useMemo(() => {
    const wrmKeys = [
      'wrm_pembebasan_lahan',
      'wrm_ippkh',
      'wrm_ukl_upl',
      'wrm_amdal',
      'wrm_pengadaan_rig',
      'wrm_pengadaan_drilling_services',
      'wrm_pengadaan_lli',
      'wrm_persiapan_lokasi',
      'wrm_internal_kkks',
      'wrm_evaluasi_subsurface'
    ];

    return wrmKeys.reduce((acc, key) => {
      acc[key] = !!data[key]; // Mengonversi nilai ke boolean
      return acc;
    }, {});
  }, [data]);

  return wrmBooleanValues;
};

// Contoh penggunaan dalam komponen React
const WRMComponent = ({ rawData }) => {
  const wrmBooleanValues = useWRMBooleanValues(rawData);

  // Gunakan wrmBooleanValues dalam komponen Anda
  return (
    <div>
      {Object.entries(wrmBooleanValues).map(([key, value]) => (
        <div key={key}>
          {key}: {value.toString()}
        </div>
      ))}
    </div>
  );
};

export { useWRMBooleanValues, WRMComponent };