export const ADD_JOB_EXP_DEV = "ADD_JOB_EXP_DEV";
export const ADD_JOB_EXP_DEV_JOB_PLAN = "ADD_JOB_EXP_DEV_JOB_PLAN";
export const ADD_JOB_EXP_DEV_JOB_PLAN_WELL = "ADD_JOB_EXP_DEV_JOB_PLAN_WELL";
export const ADD_OPERATION_DATA = "ADD_OPERATION_DATA";
export const UPDATE_OPERATION_DATA = "UPDATE_OPERATION_DATA";
export const GET_DATA_JOB_EXP_DEV = "GET_DATA_JOB_EXP_DEV";
export const RESET_STATE = "RESET_STATE";
export const ADD_WRM_VALUES = "ADD_WRM_VALUES";
export const GET_DAILY_OPERATION_REPORT = "GET_DAILY_OPERATION_REPORT";
export const RESET_DAILY_OPERATION_REPORT = "RESET_DAILY_OPERATION_REPORT";
export const ADD_DAILY_OPERATION_REPORT = "ADD_DAILY_OPERATION_REPORT";
export const RESET_JOB_PLAN_EXP_DEV = "RESET_JOB_PLAN_EXP_DEV";
export const ADD_WELL_MASTER = "ADD_WELL_MASTER";

export const reducer = (state, action) => {
  switch (action.type) {
    ///PLANPARENT
    case ADD_JOB_EXP_DEV:
      return {
        jobPlanExpDev: {
          ...state.jobPlanExpDev,
          ...action.payload,
        },
      };
    case ADD_JOB_EXP_DEV_JOB_PLAN:
      return {
        jobPlanExpDev: {
          ...state.jobPlanExpDev,
          job_plan: {
            ...(state.jobPlanExpDev?.job_plan ?? {}), // Important change
            ...action.payload,
          },
        },
      };

    case ADD_JOB_EXP_DEV_JOB_PLAN_WELL:
      return {
        jobPlanExpDev: {
          ...state.jobPlanExpDev,
          job_plan: {
            ...state.jobPlanExpDev?.job_plan,
            well: {
              ...state.jobPlanExpDev?.job_plan.well,
              ...action.payload,
            },
          },
        },
      };
    case UPDATE_OPERATION_DATA: {
      const updatedInitialData = {
        ...state.initialOperationData,
        ...action.payload,
      };

      return {
        ...state,
        initialOperationData: updatedInitialData,
        updatedOperationData: updatedInitialData.actual_job,
      };
    }
    case GET_DATA_JOB_EXP_DEV:
      return {
        jobPlanExpDev: {
          ...state.jobPlanExpDev,
          ...action.payload,
        },
      };

    case ADD_WRM_VALUES:
      return {
        wrmValues: {
          ...state.wrmValues,
          ...action.payload,
        },
      };
    case RESET_STATE:
      return state;

    case ADD_DAILY_OPERATION_REPORT:
      return {
        jobOperationData: {
          ...state.jobOperationData,
          ...action.payload,
        },
      };

    case RESET_DAILY_OPERATION_REPORT:
      return {
        jobOperationData: {
          report_date: null,
          avg_wob: null,
          avg_rop: null,
          avg_rpm: null,
          torque: null,
          stand_pipe_pressure: null,
          flow_rate: null,
          string_weight: null,
          rotating_weight: null,
          total_drilling_time: null,
          circulating_pressure: null,
          daily_cost: null,
          daily_mud_cost: null,
          day_supervisor: null,
          night_supervisor: null,
          engineer: null,
          geologist: null,
          day_summary: null,
          day_forecast: null,
          last_size: null,
          set_md: null,
          next_size: null,
          next_set_md: null,
          last_lot_emw: null,
          tol: null,
          start_mud_volume: null,
          lost_surface_mud_volume: null,
          lost_dh_mud_volume: null,
          dumped_mud_volume: null,
          built_mud_volume: null,
          ending_mud_volume: null,
          max_gas: null,
          conn_gas: null,
          trip_gas: null,
          back_gas: null,
          annular_velocity: null,
          pb: null,
          sys_hhp: null,
          hhpb: null,
          hsi: null,
          percent_psib: null,
          jet_velocity: null,
          impact_force: null,
          if_area: null,
          stop_cards: null,
          lta: null,
          spill: null,
          h2s_test: null,
          hse_mtg: null,
          kicktrip: null,
          kickdrill: null,
          fire: null,
          job_id: null,
          personnel: [
            {
              company: null,
              people: null,
            },
          ],
          Incidents: [
            {
              incidents_time: "",
              incident: null,
              incident_type: null,
              comments: null,
            },
          ],
          time_breakdowns: [
            {
              start_time: null,
              end_time: null,
              start_measured_depth: null,
              end_measured_depth: null,
              category: null,
              p: null,
              npt: null,
              code: null,
              operation: null,
            },
          ],
          bit_records: {
            bit_size: null,
            bit_number: null,
            bit_run: null,
            manufacturer: null,
            iadc_code: null,
            jets: null,
            serial: null,
            depth_out: null,
            depth_in: null,
            meterage: null,
            bit_hours: null,
            nozzels: null,
            dull_grade: null,
          },
          bottom_hole_assemblies: [
            {
              bha_number: null,
              bha_run: null,
              components: [],
            },
          ],
          drilling_fluids: [],
          mud_additives: [],
          bulk_materials: [],
          directional_surveys: [],
          pumps: [],
          weather: {
            temperature_high: null,
            temperature_low: null,
            chill_factor: null,
            wind_speed: null,
            wind_direction: null,
            barometric_pressure: null,
            wave_height: null,
            wave_current_speed: null,
            road_condition: null,
            visibility: null,
          },
        },
      };

    case RESET_JOB_PLAN_EXP_DEV:
      return {
        jobPlanExpDev: {},
      };
    
    case ADD_WELL_MASTER:
      return {
        ...state,
        wellMaster: action.payload,
      };
    default:
      return state;
  }
};
