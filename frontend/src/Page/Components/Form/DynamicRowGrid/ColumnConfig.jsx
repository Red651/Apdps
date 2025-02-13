const columnSettings = {
    string: {
      type: "string",
    transform: (value) => (value === 0 ? 0 : value || null),
    // transform: (value) => {
    //   // Konversi apapun menjadi string, atau null jika tidak valid
    //   return value !== null && value !== undefined ? String(value).trim() : null;
    // }
    },
    number: {
      type: "number",
      transform: (value) => {
        if (value === 0) return 0;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? null : parsed;
      },
    },
    boolean: {
      type: "boolean",
      transform: (value) => {
        if (value === 0) return false;
        if (typeof value === "string") {
          return ["true", "1", "yes"].includes(value.toLowerCase());
        }
        return Boolean(value);
      },
    },
    select: {
      type: "select",
      transform: (value, options) => {
        if (!Array.isArray(options)) {
          throw new Error("Options must be an array");
        }
        return options.find((option) => option.value === value)?.value || null;
      },
    },
    date: {
      type: "date",
      transform: (value) => {
        if (value instanceof Date) return value.toISOString();
        if (typeof value === "string") {
          const date = new Date(value);
          return isNaN(date) ? null : date.toISOString();
        }
        return null;
      },
  },
  dateOnly: {
    type: "dateOnly",
    // transform: (value) => {
    //   if (!value) return null;
  
  
    //   const parseDate = (input) => {
    //     // Jika sudah dalam format YYYY-MM-DD, kembalikan langsung
    //     if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    //       return input;
    //     }
  
  
    //     // Parse dari format DD/MM/YYYY
    //     const ddmmyyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    //     const match = input.match(ddmmyyyyRegex);
        
    //     if (match) {
    //       const [, day, month, year] = match;
    //       // Konversi ke format YYYY-MM-DD
    //       return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    //     }
  
  
    //     // Coba parse dengan Date constructor
    //     const date = new Date(input);
    //     if (!isNaN(date.getTime())) {
    //       const year = date.getFullYear();
    //       const month = String(date.getMonth() + 1).padStart(2, '0');
    //       const day = String(date.getDate()).padStart(2, '0');
    //       return `${year}-${month}-${day}`;
    //     }
  
  
    //     return null;
    //   };
  
  
    //   return parseDate(value);
    // }
    transform: (value) => {
      // Konversi tanggal menjadi string dalam format tertentu
      if (!value) return null;
      
      // Jika sudah dalam format string, kembalikan langsung
      if (typeof value === 'string') return value;
      
      // Jika berupa objek Date
      if (value instanceof Date) {
        return value.toISOString().split('T')[0]; // YYYY-MM-DD
      }
      
      // Coba parsing berbagai format
      const date = new Date(value);
      return !isNaN(date) 
        ? date.toISOString().split('T')[0] 
        : null;
    }
  },
    file: {
      type: "file",
      transform: (value) => value,
    },
  };
  
  export const createColumnConfig = (columns) => {
    return columns.map((col) => {
      const { type, transform } = columnSettings[col.type] || columnSettings.string;
      return {
        ...col,
        type, // Pastikan type tetap sama
        transform: 
          type === "select" 
            ? (value) => transform(value, col.select) 
            : transform,
        // Tambahkan filter untuk dateOnly
        ...(type === 'dateOnly' && {
          valueFormatter: (params) => {
            if (!params.value) return '';
            
            // Jika dalam format DD/MM/YYYY, konversi ke YYYY-MM-DD
            if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(params.value)) {
              const [day, month, year] = params.value.split('/');
              return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
            
            return params.value;
          },
          valueParser: (params) => {
            if (!params.newValue) return null;
            // Konversi input ke format Date atau string yang valid
            const date = new Date(params.newValue);
            return date instanceof Date && !isNaN(date) 
              ? date.toLocaleDateString('en-GB') 
              : params.newValue;
          }
        })
      };
    });
  };
  