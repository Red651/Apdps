

const schemaErrorWellWorkOver = [
    { field: "well_id", message: "Well ID is required" },
    { field: "onstream_gas", message: "Onstream gas is required" },
    { field: "onstream_oil", message: "Onstream oil is required" },
    { field: "onstream_water_cut", message: "Onstream water cut is required" },
    { field: "target_gas", message: "Target gas is required" },
    { field: "target_water_cut", message: "Target water cut is required" },
    { field: "job_category", message: "Job category is required" },
    { field: "target_oil", message: "Target oil is required" },
    // { field: "well_schematic", message: "Well schematic is required" },
    { field: "start_date", message: "Start date is required" },
    { field: "end_date", message: "End date is required" },
    { field: "rig_id", message: "Rig ID is required" },
    { field: "total_budget", message: "Total budget is required" },
    { field: "job_description", message: "Job description is required" },
    // { field: "work_breakdown_structure.events", message: "Events are required" },
    // { field: "job_operation_days", message: "Job operation days are required" },
    // { field: "job_hazards", message: "Job hazards are required" }
  ];

export const validatePlanningWo = (data) => {
    let errors = {};

    const validateField = (field, condition, message) => {
        if (condition) errors[field] = message;
    };

    validateField("area_id", !data.area_id, "Area is required");
    validateField("field_id", !data.field_id, "Field is required");
    validateField("contract_type", 
        !["COST-RECOVERY", "GROSS-SPLIT"].includes(data.contract_type), 
        "Contract Type must be 'COST-RECOVERY' or 'GROSS-SPLIT'"
    );
    validateField("wpb_year", !Number.isInteger(data.wpb_year), "WPB Year must be a valid integer");
    const { job_plan } = data;
    schemaErrorWellWorkOver.forEach((field) => {
        validateField(field.field, !job_plan[field.field], field.message);
    })

    return Object.keys(errors).length > 0 ? { status: 422, message: "Unprocessable Entity", errormessage:errors } : false;
};

