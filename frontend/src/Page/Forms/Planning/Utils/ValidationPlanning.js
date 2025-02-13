
const schemaErrorWell = [
    // { field: "abandonment_date", message: "Abandonment date is required" },
    // { field: "azimuth", message: "Azimuth is required" },
    
    // { field: "base_depth", message: "Base depth is required" },
    { field: "bottom_hole_latitude", message: "Bottom hole latitude is required" },
    { field: "bottom_hole_longitude", message: "Bottom hole longitude is required" },
    // { field: "completion_date", message: "Completion date is required" },
    // { field: "deepest_depth", message: "Deepest depth is required" },
    // { field: "depth_datum", message: "Depth datum is required" },
    // { field: "depth_datum_elev", message: "Depth datum elevation is required" },
    // { field: "derrick_floor_elev", message: "Derrick floor elevation is required" },
    // { field: "difference_lat_msl", message: "Difference latitude from mean sea level is required" },
    // { field: "drill_td", message: "Drill TD is required" },
    // { field: "elev_ref_datum", message: "Elevation reference datum is required" },
    { field: "environment_type", message: "Environment type is required" },
    // { field: "final_drill_date", message: "Final drill date is required" },
    // { field: "final_md", message: "Final MD is required" },
    // { field: "ground_elev", message: "Ground elevation is required" },
    // { field: "ground_elev_type", message: "Ground elevation type is required" },
    // { field: "hydrocarbon_target", message: "Hydrocarbon target is required" },
    // { field: "kb_elev", message: "Kelly Bushing elevation is required" },
    // { field: "kick_off_point", message: "Kick-off point is required" },
    // { field: "maximum_inclination", message: "Maximum inclination is required" },
    // { field: "maximum_tvd", message: "Maximum true vertical depth is required" },
    // { field: "mean_sea_level", message: "Mean sea level is required" },
    // { field: "net_pay", message: "Net pay is required" },
    // { field: "parent_well_id", message: "Parent well ID is required" },
    // { field: "plugback_depth", message: "Plugback depth is required" },
    // { field: "rig_on_site_date", message: "Rig on site date is required" },
    // { field: "rig_release_date", message: "Rig release date is required" },
    // { field: "rotary_table_elev", message: "Rotary table elevation is required" },
    // { field: "seismic_line", message: "Seismic line is required" },
    // { field: "spud_date", message: "Spud date is required" },
    // { field: "subsea_elev_ref_type", message: "Subsea elevation reference type is required" },
    { field: "surface_latitude", message: "Surface latitude is required" },
    { field: "surface_longitude", message: "Surface longitude is required" },
    // { field: "top_depth", message: "Top depth is required" },
    // { field: "unit_type", message: "Unit type is required" },
    // { field: "uwi", message: "UWI is required" },
    // { field: "water_acoustic_vel", message: "Water acoustic velocity is required" },
    // { field: "water_depth", message: "Water depth is required" },
    // { field: "water_depth_datum", message: "Water depth datum is required" },
    { field: "well_level_type", message: "Well Type is required" },
    { field: "well_class", message: "Well class is required" },
    { field: "well_name", message: "Well name is required" },
    { field: "well_num", message: "Well number is required" },
    { field: "well_profile_type", message: "Well profile type is required" },
    // { field: "whipstock_depth", message: "Whipstock depth is required" }

]


// validateField("well_name", !well.well_name, "Well Name is required");
//         validateField("well_num", !well.well_num, "Well Num is required");
//         validateField("well_class", !well.well_class, "Well Class is required");
//         validateField("well_level_type", !well.well_level_type, "Well Level Type is required");
//         validateField("well_profile_type", !well.well_profile_type, "Well Profile Type is required");
//         validateField("well_environment_type", !well.well_environment_type, "Well Environment Type is required");


export const validationPostPutPlanning = (data) => {
    //  
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
    // validateField("afe_number", !data.afe_number, "AFE Number is required");
    // validateField("total_budget", !Number.isInteger(data.job_plan.total_budget), "Total Budget must be a valid integer");
    validateField("rig_id", !data.job_plan.rig_id, "Rig Is Required");


    if (data.job_plan) {
        const { job_plan } = data;

        validateField("start_date", !job_plan.start_date, "Start Date is required");
        validateField("end_date", !job_plan.end_date, "End Date is required");

        // const hseFields = ["near_miss", "fatality", "spill", "unsafe_condition", "unsafe_action", "man_hour"];
        // hseFields.forEach((field) =>
        //     validateField(field, !Number.isInteger(job_plan.job_hse_aspect?.[field]), `${field.replace("_", " ")} must be a valid integer`)
        // );

        // const trajectory = job_plan.well?.well_trajectory || {};
        // validateField("survey_start_date", !trajectory.survey_start_date, "Survey Start Date is required");
        // validateField("survey_end_date", !trajectory.survey_end_date, "Survey End Date is required");
        // validateField("top_depth", typeof trajectory.top_depth !== "number", "Top Depth must be a valid number");
        // validateField("base_depth", typeof trajectory.base_depth !== "number", "Base Depth must be a valid number");
        // validateField("survey_type", !trajectory.survey_type, "Survey Type is required");

        // (job_plan.well?.well_tests || []).forEach((test, index) => {
        //     validateField(`well_tests[${index}].test_type`, !test.test_type, "Test Type is required");
        //     validateField(`well_tests[${index}].run_num`, !test.run_num, "Run Number is required");
        //     validateField(`well_tests[${index}].test_num`, !test.test_num, "Test Number is required");
        // });
    }

    if(data.job_plan.well) {
        const well = data.job_plan.well;
       schemaErrorWell.forEach((error) => {
        validateField(error.field, !well[error.field], error.message);
       })
    }
    //  
    // if(errors.length > 0) {
    //     return {
    //         status: 422,    
    //         message: "Unprocessable Entity",
    //         errormessage:errors
    //     }
    // }

    //  
    
    return Object.keys(errors).length > 0 ? { status: 422, message: "Unprocessable Entity", errormessage:errors } : false;
};


const schemaErrorWellDev = [
    // { field: "abandonment_date", message: "Abandonment date is required" },
    // { field: "azimuth", message: "Azimuth is required" },
    
    // { field: "base_depth", message: "Base depth is required" },
    { field: "bottom_hole_latitude", message: "Bottom hole latitude is required" },
    { field: "bottom_hole_longitude", message: "Bottom hole longitude is required" },
    // { field: "completion_date", message: "Completion date is required" },
    // { field: "deepest_depth", message: "Deepest depth is required" },
    // { field: "depth_datum", message: "Depth datum is required" },
    // { field: "depth_datum_elev", message: "Depth datum elevation is required" },
    // { field: "derrick_floor_elev", message: "Derrick floor elevation is required" },
    // { field: "difference_lat_msl", message: "Difference latitude from mean sea level is required" },
    // { field: "drill_td", message: "Drill TD is required" },
    // { field: "elev_ref_datum", message: "Elevation reference datum is required" },
    { field: "environment_type", message: "Environment type is required" },
    // { field: "final_drill_date", message: "Final drill date is required" },
    // { field: "final_md", message: "Final MD is required" },
    // { field: "ground_elev", message: "Ground elevation is required" },
    // { field: "ground_elev_type", message: "Ground elevation type is required" },
    // { field: "hydrocarbon_target", message: "Hydrocarbon target is required" },
    // { field: "kb_elev", message: "Kelly Bushing elevation is required" },
    // { field: "kick_off_point", message: "Kick-off point is required" },
    // { field: "maximum_inclination", message: "Maximum inclination is required" },
    // { field: "maximum_tvd", message: "Maximum true vertical depth is required" },
    // { field: "mean_sea_level", message: "Mean sea level is required" },
    // { field: "net_pay", message: "Net pay is required" },
    // { field: "parent_well_id", message: "Parent well ID is required" },
    // { field: "plugback_depth", message: "Plugback depth is required" },
    // { field: "rig_on_site_date", message: "Rig on site date is required" },
    // { field: "rig_release_date", message: "Rig release date is required" },
    // { field: "rotary_table_elev", message: "Rotary table elevation is required" },
    // { field: "seismic_line", message: "Seismic line is required" },
    // { field: "spud_date", message: "Spud date is required" },
    // { field: "subsea_elev_ref_type", message: "Subsea elevation reference type is required" },
    { field: "surface_latitude", message: "Surface latitude is required" },
    { field: "surface_longitude", message: "Surface longitude is required" },
    // { field: "top_depth", message: "Top depth is required" },
    // { field: "unit_type", message: "Unit type is required" },
    // { field: "uwi", message: "UWI is required" },
    // { field: "water_acoustic_vel", message: "Water acoustic velocity is required" },
    // { field: "water_depth", message: "Water depth is required" },
    // { field: "water_depth_datum", message: "Water depth datum is required" },
    { field: "well_level_type", message: "Well Type is required" },
    { field: "well_class", message: "Well class is required" },
    { field: "well_name", message: "Well name is required" },
    { field: "well_num", message: "Well number is required" },
    { field: "well_profile_type", message: "Well profile type is required" },
    // { field: "whipstock_depth", message: "Whipstock depth is required" }

]
export const validationPostPutDevPlanning = (data) => {
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
    // validateField("afe_number", !data.afe_number, "AFE Number is required");
    validateField("total_budget", !Number.isInteger(data.job_plan.total_budget), "Total Budget must be a valid integer");
    validateField("rig_id", !data.job_plan.rig_id, "Rig Is Required");


    if (data.job_plan) {
        const { job_plan } = data;

        validateField("start_date", !job_plan.start_date, "Start Date is required");
        validateField("end_date", !job_plan.end_date, "End Date is required");

        // const hseFields = ["near_miss", "fatality", "spill", "unsafe_condition", "unsafe_action", "man_hour"];
        // hseFields.forEach((field) =>
        //     validateField(field, !Number.isInteger(job_plan.job_hse_aspect?.[field]), `${field.replace("_", " ")} must be a valid integer`)
        // );

        // const trajectory = job_plan.well?.well_trajectory || {};
        // validateField("survey_start_date", !trajectory.survey_start_date, "Survey Start Date is required");
        // validateField("survey_end_date", !trajectory.survey_end_date, "Survey End Date is required");
        // validateField("top_depth", typeof trajectory.top_depth !== "number", "Top Depth must be a valid number");
        // validateField("base_depth", typeof trajectory.base_depth !== "number", "Base Depth must be a valid number");
        // validateField("survey_type", !trajectory.survey_type, "Survey Type is required");

        // (job_plan.well?.well_tests || []).forEach((test, index) => {
        //     validateField(`well_tests[${index}].test_type`, !test.test_type, "Test Type is required");
        //     validateField(`well_tests[${index}].run_num`, !test.run_num, "Run Number is required");
        //     validateField(`well_tests[${index}].test_num`, !test.test_num, "Test Number is required");
        // });
    }

    if(data.job_plan.well) {
        const well = data.job_plan.well;
       schemaErrorWellDev.forEach((error) => {
        validateField(error.field, !well[error.field], error.message);
       })
    }
    //  
    // if(errors.length > 0) {
    //     return {
    //         status: 422,    
    //         message: "Unprocessable Entity",
    //         errormessage:errors
    //     }
    // }

    //  
    
    return Object.keys(errors).length > 0 ? { status: 422, message: "Unprocessable Entity", errormessage:errors } : false;

}