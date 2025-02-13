export const validationOperate = (data) => {
  if (data) {
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([key]) => key.includes("wrm"))
    );
    if (filteredData.length === 0) {
      return { msg: "Data is Valid" };
    }
  
    let message;
    let booleanValue;
  
    if (Object.values(filteredData).every((value) => value == 100)) {
      (message = "Data Is Valid"), (booleanValue = false);
    } else {
      (message = "Data should be less than 100 %"), (booleanValue = true);
    }
    return { msg: message, permission: booleanValue };
  }
};
