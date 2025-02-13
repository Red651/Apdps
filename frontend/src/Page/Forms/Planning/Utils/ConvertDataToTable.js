export const ConvertDataToTable = (data) => {
  //  
  if (data === null || data === undefined || data.length === 0) return;
  //   const headers = data.reduce((keys, obj) => {});
  const headerData = data.reduce((keys, obj) => {
    Object.keys(obj).forEach((key) => {
      if (!keys.includes(key)) {
        keys.push(key);
      }
    });
    return keys;
  }, []);
  //   

  const headers = headerData.map((header) => {
    return {
      Header: header,
      accessor: header, // Sesuaikan jika perlu
    };
  });
  return {
    headers: headers,
    item: data,
  };
};
