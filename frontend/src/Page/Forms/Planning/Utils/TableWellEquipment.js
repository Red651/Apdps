export const TableWellEquipmentConf = [
  {
    key: "purchase_date",
    headerName: "Purchase Date",
    type: "dateOnly",
    required: true,
  },
  {
    key: "commission_date",
    headerName: "Commission Date",
    type: "dateOnly",
    required: true,
  },
  {
    key: "decommission_date",
    headerName: "Decommission Date",
    type: "dateOnly",
    required: false,
  },

  {
    key: "equipment_group",
    headerName: "Equipment Group",
    type: "string",
    required: true,
  },
  {
    key: "equipment_name",
    headerName: "Equipment Name",
    type: "string",
    required: true,
  },
  {
    key: "equipment_type",
    headerName: "Equipment Type",
    type: "string",
    required: true,
  },
  {
    key: "serial_num",
    headerName: "Serial Number",
    type: "string",
    required: true,
  },
  {
    key: "description",
    headerName: "Description",
    type: "string",
    required: false,
  },
  { key: "remark", headerName: "Remark", type: "string", required: false },
];

const selectUOM = [
  {
    name: "ft",
    value: "ft",
  },
  {
    name: "m",
    value: "m",
  },
];
export const wellCompletionConf = [
  {
    key: "completion_obs_no",
    headerName: "Completion OBS No",
    type: "number",
    required: true,
  },
  {
    key: "base_depth",
    headerName: "Base Depth",
    type: "number",
    required: true,
  },
  {
    key: "base_depth_ouom",
    headerName: "Base Depth Unit",
    type: "select",
    select: selectUOM,
    required: true,
  },
  {
    key: "completion_date",
    headerName: "Completion Date",
    type: "dateOnly",
    required: true,
  },
  {
    key: "completion_method",
    headerName: "Completion Method",
    type: "string",
    required: true,
  },
  {
    key: "completion_type",
    headerName: "Completion Type",
    type: "string",
    required: true,
  },
  { key: "remark", headerName: "Remark", type: "string", required: false },
  { key: "top_depth", headerName: "Top Depth", type: "number", required: true },
  {
    key: "top_depth_ouom",
    headerName: "Top Depth Unit",
    type: "select",
    select: selectUOM,
    required: true,
  },
];

const selectUOMPressure = [
  {
    name: "1",
    value: "1",
  },
  {
    name: "0",
    value: "0",
  },
];

export const wellPressureConf = [
  {
    key: "pressure_obs_no",
    headerName: "Pressure OBS No",
    type: "number",
    required: true,
  },
  {
    key: "active_ind",
    headerName: "Active Indicator",
    type: "string",
    required: true,
  },
  {
    key: "base_depth",
    headerName: "Base Depth",
    type: "number",
    required: true,
  },
  {
    key: "base_depth_ouom",
    headerName: "Base Depth Unit",
    type: "select",
    select: selectUOMPressure,
    required: true,
  },
  {
    key: "flow_casing_pressure",
    headerName: "Flow Casing Pressure",
    type: "number",
    required: true,
  },
  {
    key: "flow_casing_pressure_ouom",
    headerName: "Flow Casing Pressure Unit",
    type: "select",
    select: selectUOMPressure,
    required: true,
  },
  {
    key: "flow_tubing_pressure",
    headerName: "Flow Tubing Pressure",
    type: "number",
    required: true,
  },
  {
    key: "flow_tubing_pressure_ouom",
    headerName: "Flow Tubing Pressure Unit",
    type: "select",
    select: selectUOMPressure,
    required: true,
  },
  {
    key: "init_reservoir_pressure",
    headerName: "Initial Reservoir Pressure",
    type: "number",
    required: true,
  },
  {
    key: "init_reservoir_press_ouom",
    headerName: "Initial Reservoir Pressure Unit",
    type: "select",
    select: selectUOMPressure,
    required: true,
  },
  {
    key: "pool_datum",
    headerName: "Pool Datum",
    type: "string",
    required: true,
  },
  {
    key: "pool_datum_depth",
    headerName: "Pool Datum Depth",
    type: "number",
    required: true,
  },
  {
    key: "pool_datum_depth_ouom",
    headerName: "Pool Datum Depth Unit",
    type: "select",
    select: selectUOMPressure,
    required: true,
  },
  {
    key: "pr_str_form_obs_no",
    headerName: "Pressure Structure Form OBS No",
    type: "number",
    required: true,
  },
  { key: "remark", headerName: "Remark", type: "string", required: false },
  {
    key: "shutin_casing_pressure",
    headerName: "Shut-in Casing Pressure",
    type: "number",
    required: true,
  },
  {
    key: "suhtin_casing_pressure_ouom",
    headerName: "Shut-in Casing Pressure Unit",
    type: "select",
    select: selectUOMPressure,
    required: true,
  },
  {
    key: "shutin_tubing_pressure",
    headerName: "Shut-in Tubing Pressure",
    type: "number",
    required: true,
  },
  {
    key: "shutin_tubing_pressure_ouom",
    headerName: "Shut-in Tubing Pressure Unit",
    type: "select",
    select: selectUOMPressure,
    required: true,
  },
  { key: "top_depth", headerName: "Top Depth", type: "number", required: true },
  {
    key: "top_depth_ouom",
    headerName: "Top Depth Unit",
    type: "select",
    select: selectUOMPressure,
    required: true,
  },
  {
    key: "well_datum_depth",
    headerName: "Well Datum Depth",
    type: "number",
    required: true,
  },
  {
    key: "well_datum_ouom",
    headerName: "Well Datum Unit",
    type: "select",
    select: selectUOMPressure,
    required: true,
  },
];

const selectUOMCasing = [
  {
    name: "ft",
    value: "ft",
  },
  {
    name: "m",
    value: "m",
  },
];

const selectAmountCasing = [
  {
    name: "m3",
    value: "m3",
  },

  {
    name: "kg",
    value: "kg",
  },
];
export const wellCasingConf = [
  { key: "top_depth", headerName: "Top Depth", type: "number", required: true },
  {
    key: "top_depth_ouom",
    headerName: "Top Depth Unit",
    type: "select",
    select: selectUOMCasing,
    required: true,
  },
  {
    key: "base_depth",
    headerName: "Base Depth",
    type: "number",
    required: true,
  },
  {
    key: "base_depth_ouom",
    headerName: "Base Depth Unit",
    type: "select",
    select: selectUOMCasing,
    required: true,
  },
  { key: "hole_size", headerName: "Hole Size", type: "number", required: true },
  {
    key: "hole_size_ouom",
    headerName: "Hole Size Unit",
    type: "select",
    select: selectUOMCasing,
    required: true,
  },
  {
    key: "inside_diameter",
    headerName: "Inside Diameter",
    type: "number",
    required: true,
  },
  {
    key: "inside_diameter_ouom",
    headerName: "Inside Diameter Unit",
    type: "select",
    select: selectUOMCasing,
    required: true,
  },
  {
    key: "outside_diameter",
    headerName: "Outside Diameter",
    type: "number",
    required: true,
  },
  {
    key: "outside_diameter_ouom",
    headerName: "Outside Diameter Unit",
    type: "select",
    select: selectUOMCasing,
    required: true,
  },
  {
    key: "cement_type",
    headerName: "Cement Type",
    type: "string",
    required: true,
  },
  {
    key: "cement_amount",
    headerName: "Cement Amount",
    type: "number",
    required: true,
  },
  {
    key: "cement_amount_uom",
    headerName: "Cement Amount Unit",
    type: "select",
    select: selectAmountCasing,
    required: true,
  },
  { key: "remark", headerName: "Remark", type: "string", required: false },
];

export const wellTrajectoryConf = [
  { key: "unit_type", headerName: "Unit Type", type: "string", required: true },
  {
    key: "physical_item_id",
    headerName: "Physical Item ID",
    type: "string",
    required: true,
  },
  {
    key: "survey_start_date",
    headerName: "Survey Start Date",
    type: "date",
    required: true,
  },
  {
    key: "survey_end_date",
    headerName: "Survey End Date",
    type: "date",
    required: true,
  },
  { key: "top_depth", headerName: "Top Depth", type: "number", required: true },
  {
    key: "base_depth",
    headerName: "Base Depth",
    type: "number",
    required: true,
  },
  {
    key: "survey_type",
    headerName: "Survey Type",
    type: "string",
    required: true,
  },
];

export const wellTestConf = [
  // Basic Test Information
  { key: "test_type", headerName: "Test Type", type: "string", required: true },
  {
    key: "test_subtype",
    headerName: "Test Subtype",
    type: "string",
    required: false,
  },
  { key: "run_num", headerName: "Run Number", type: "string", required: true },
  {
    key: "test_num",
    headerName: "Test Number",
    type: "string",
    required: true,
  },
  {
    key: "report_test_num",
    headerName: "Report Test Number",
    type: "string",
    required: false,
  },
  {
    key: "test_result_code",
    headerName: "Test Result Code",
    type: "string",
    required: false,
  },
  {
    key: "active_ind",
    headerName: "Active Indicator",
    type: "string",
    required: false,
  },

  // Dates and Times
  {
    key: "start_time",
    headerName: "Start Time",
    type: "date",
    required: false,
  },
  {
    key: "start_timezone",
    headerName: "Start Timezone",
    type: "string",
    required: false,
  },
  { key: "test_date", headerName: "Test Date", type: "date", required: false },
  {
    key: "tool_open_time",
    headerName: "Tool Open Time",
    type: "date",
    required: false,
  },
  {
    key: "tool_open_timezone",
    headerName: "Tool Open Timezone",
    type: "string",
    required: false,
  },

  // Depths and Measurements
  {
    key: "top_depth",
    headerName: "Top Depth",
    type: "string",
    required: false,
  },
  {
    key: "top_depth_ouom",
    headerName: "Top Depth Unit",
    type: "select",
    select: selectUOM,
    required: false,
  },
  {
    key: "base_depth",
    headerName: "Base Depth",
    type: "string",
    required: false,
  },
  {
    key: "base_depth_ouom",
    headerName: "Base Depth Unit",
    type: "select",
    select: selectUOM,
    required: false,
  },
  { key: "td", headerName: "TD", type: "string", required: false },
  {
    key: "td_ouom",
    headerName: "TD Unit",
    type: "select",
    select: selectUOM,
    required: false,
  },

  // Pressures
  {
    key: "casing_pressure",
    headerName: "Casing Pressure",
    type: "string",
    required: false,
  },
  {
    key: "casing_pressure_ouom",
    headerName: "Casing Pressure Unit",
    type: "select",
    select: selectUOM,
    required: false,
  },
  {
    key: "flow_pressure",
    headerName: "Flow Pressure",
    type: "string",
    required: false,
  },
  {
    key: "flow_pressure_ouom",
    headerName: "Flow Pressure Unit",
    type: "select",
    select: selectUOM,
    required: false,
  },
  {
    key: "static_pressure",
    headerName: "Static Pressure",
    type: "string",
    required: false,
  },
  {
    key: "static_pressure_ouom",
    headerName: "Static Pressure Unit",
    type: "select",
    select: selectUOM,
    required: false,
  },
  {
    key: "max_hydrostatic_pressure",
    headerName: "Max Hydrostatic Pressure",
    type: "number",
    required: false,
  },
  {
    key: "max_hydrostatic_press_ouom",
    headerName: "Max Hydrostatic Pressure Unit",
    type: "select",
    select: selectUOM,
    required: false,
  },

  // Temperatures
  {
    key: "flow_temperature",
    headerName: "Flow Temperature",
    type: "number",
    required: false,
  },
  {
    key: "flow_temperature_ouom",
    headerName: "Flow Temperature Unit",
    type: "select",
    select: selectUOM,
    required: false,
  },
  {
    key: "report_temperature",
    headerName: "Report Temperature",
    type: "number",
    required: false,
  },
  {
    key: "report_temperature_ouom",
    headerName: "Report Temperature Unit",
    type: "select",
    select: selectUOM,
    required: false,
  },
  {
    key: "temperature_correction",
    headerName: "Temperature Correction",
    type: "number",
    required: false,
  },
  {
    key: "temperature_correction_ouom",
    headerName: "Temperature Correction Unit",
    type: "select",
    select: selectUOM,
    required: false,
  },
  {
    key: "temperature_correction_ind",
    headerName: "Temperature Correction Indicator",
    type: "string",
    required: false,
  },

  // Flow Rates and Amounts
  {
    key: "gas_flow_amount",
    headerName: "Gas Flow Amount",
    type: "string",
    required: false,
  },
  {
    key: "gas_flow_amount_ouom",
    headerName: "Gas Flow Amount Unit",
    type: "select",
    select: selectUOM,
    required: false,
  },
  {
    key: "oil_flow_amount",
    headerName: "Oil Flow Amount",
    type: "number",
    required: false,
  },
  {
    key: "oil_flow_amount_ouom",
    headerName: "Oil Flow Amount Unit",
    type: "select",
    select: selectUOM,
    required: false,
  },
  {
    key: "water_flow_amount",
    headerName: "Water Flow Amount",
    type: "string",
    required: false,
  },
  {
    key: "water_flow_amount_ouom",
    headerName: "Water Flow Amount Unit",
    type: "select",
    select: selectUOM,
    required: false,
  },
  {
    key: "condensate_flow_amount",
    headerName: "Condensate Flow Amount",
    type: "string",
    required: false,
  },
  {
    key: "condensate_flow_amount_ouom",
    headerName: "Condensate Flow Amount Unit",
    type: "select",
    select: selectUOM,
    required: false,
  },

  // Maximum Flow Rates
  {
    key: "max_gas_flow_rate",
    headerName: "Max Gas Flow Rate",
    type: "string",
    required: false,
  },
  {
    key: "max_gas_flow_rate_ouom",
    headerName: "Max Gas Flow Rate Unit",
    type: "select",
    select: selectUOM,
    required: false,
  },
  {
    key: "max_oil_flow_rate",
    headerName: "Max Oil Flow Rate",
    type: "string",
    required: false,
  },
  {
    key: "max_oil_flow_rate_ouom",
    headerName: "Max Oil Flow Rate Unit",
    type: "select",
    select: selectUOM,
    required: false,
  },
  {
    key: "max_water_flow_rate",
    headerName: "Max Water Flow Rate",
    type: "string",
    required: false,
  },
  {
    key: "max_water_flow_rate_ouom",
    headerName: "Max Water Flow Rate Unit",
    type: "select",
    select: selectUOM,
    required: false,
  },
  {
    key: "max_condens_flow_rate",
    headerName: "Max Condensate Flow Rate",
    type: "number",
    required: false,
  },
  {
    key: "max_condens_flow_rate_ouom",
    headerName: "Max Condensate Flow Rate Unit",
    type: "select",
    select: selectUOM,
    required: false,
  },

  // Percentages and Ratios
  {
    key: "oil_amount_percent",
    headerName: "Oil Amount Percent",
    type: "number",
    required: false,
  },
  {
    key: "water_amount_percent",
    headerName: "Water Amount Percent",
    type: "string",
    required: false,
  },
  {
    key: "water_cut_percent",
    headerName: "Water Cut Percent",
    type: "number",
    required: false,
  },
  {
    key: "bsw_percent",
    headerName: "BSW Percent",
    type: "string",
    required: false,
  },
  {
    key: "h2s_percent",
    headerName: "H2S Percent",
    type: "number",
    required: false,
  },
  {
    key: "condensate_amount_percent",
    headerName: "Condensate Amount Percent",
    type: "number",
    required: false,
  },
  { key: "gor", headerName: "GOR", type: "number", required: false },
  {
    key: "gor_ouom",
    headerName: "GOR Unit",
    type: "select",
    select: selectUOM,
    required: false,
  },
  {
    key: "si_flow_ratio",
    headerName: "SI Flow Ratio",
    type: "number",
    required: false,
  },

  // Physical Properties
  {
    key: "gas_gravity",
    headerName: "Gas Gravity",
    type: "number",
    required: false,
  },
  {
    key: "oil_gravity",
    headerName: "Oil Gravity",
    type: "string",
    required: false,
  },
  {
    key: "condensate_gravity",
    headerName: "Condensate Gravity",
    type: "number",
    required: false,
  },
  {
    key: "condensate_ratio",
    headerName: "Condensate Ratio",
    type: "string",
    required: false,
  },
  {
    key: "condensate_ratio_ouom",
    headerName: "Condensate Ratio Unit",
    type: "select",
    select: selectUOM,
    required: false,
  },
  { key: "z_factor", headerName: "Z Factor", type: "string", required: false },

  // Well Characteristics
  {
    key: "hole_condition",
    headerName: "Hole Condition",
    type: "string",
    required: false,
  },
  {
    key: "wellbore_completion_type",
    headerName: "Wellbore Completion Type",
    type: "string",
    required: false,
  },
  {
    key: "cased_hole_ind",
    headerName: "Cased Hole Indicator",
    type: "string",
    required: false,
  },
  {
    key: "permeability_quality",
    headerName: "Permeability Quality",
    type: "string",
    required: false,
  },
  {
    key: "damage_quality",
    headerName: "Damage Quality",
    type: "string",
    required: false,
  },

  // Test Duration and Properties
  {
    key: "test_duration",
    headerName: "Test Duration",
    type: "number",
    required: false,
  },
  {
    key: "test_duration_ouom",
    headerName: "Test Duration Unit",
    type: "select",
    select: selectUOM,
    required: false,
  },
  {
    key: "test_hole_diameter",
    headerName: "Test Hole Diameter",
    type: "string",
    required: false,
  },
  {
    key: "test_hole_diameter_ouom",
    headerName: "Test Hole Diameter Unit",
    type: "select",
    select: selectUOM,
    required: false,
  },

  // Additional Properties
  {
    key: "strat_age",
    headerName: "Strat Age",
    type: "string",
    required: false,
  },
  {
    key: "show_type",
    headerName: "Show Type",
    type: "string",
    required: false,
  },
  {
    key: "string_source",
    headerName: "String Source",
    type: "string",
    required: false,
  },
  {
    key: "sulphur_ind",
    headerName: "Sulphur Indicator",
    type: "string",
    required: false,
  },

  // Rat Hole Properties
  {
    key: "rat_hole_diameter",
    headerName: "Rat Hole Diameter",
    type: "string",
    required: false,
  },
  {
    key: "rat_hole_diameter_ouom",
    headerName: "Rat Hole Diameter Unit",
    type: "select",
    select: selectUOM,
    required: false,
  },
  {
    key: "rat_hole_length",
    headerName: "Rat Hole Length",
    type: "number",
    required: false,
  },
  {
    key: "rat_hole_length_ouom",
    headerName: "Rat Hole Length Unit",
    type: "select",
    select: selectUOM,
    required: false,
  },

  // Choke Descriptions
  {
    key: "bottom_choke_desc",
    headerName: "Bottom Choke Description",
    type: "string",
    required: false,
  },
  {
    key: "top_choke_desc",
    headerName: "Top Choke Description",
    type: "string",
    required: false,
  },
  {
    key: "choke_size_desc",
    headerName: "Choke Size Description",
    type: "string",
    required: false,
  },

  // Other Fields
  {
    key: "production_method",
    headerName: "Production Method",
    type: "string",
    required: false,
  },
  {
    key: "primary_fluid_recovered",
    headerName: "Primary Fluid Recovered",
    type: "string",
    required: false,
  },
  { key: "bhp_z", headerName: "BHP Z", type: "string", required: false },
  { key: "remark", headerName: "Remark", type: "string", required: false },
];
