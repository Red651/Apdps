export function dates() {
  const today = new Date();

  // Mendapatkan tahun
  const year = today.getFullYear();

  // Mendapatkan bulan (Tambahkan 1 karena getMonth() mengembalikan 0-11)
  const month = today.getMonth() + 1;

  // Mendapatkan tanggal
  const date = today.getDate();

  // Menggabungkan menjadi format DD-MM-YYYY
  const formattedDate = `${date.toString().padStart(2, "0")}-${month
    .toString()
    .padStart(2, "0")}-${year}`;

    return formattedDate
}
