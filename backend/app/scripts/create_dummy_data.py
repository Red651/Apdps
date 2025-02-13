from email import utils
from app.api.auth.models import KKKS, Admin, KKKSUser
from app.api.auth.crud import pwd_context 
from app.api.job.schemas.dor import DailyOperationsReportCreate
from datetime import datetime, timedelta
from app.api.job import crud as job_crud
from app.api.job.schemas.job import *
from app.api.job.models import *
from app.api.job.utils import daterange
from app.api.visualize.lib.well_profile import well
from app.api.well.schemas import *
from app.api.utils import models as utils_models
from app.api.spatial.models import *
import pandas as pd
import uuid
import random
import json
import geopandas as gpd
from app.core.schema_operations import parse_schema
from app.api.well.models import *
from tqdm import tqdm
from app.core.config import settings

def default(o):
    if isinstance(o, (datetime)):
        return o.isoformat()

def random_enum_value(enum_class):
    enum_values = list(enum_class)
    return random.choice(enum_values)

def random_datetime_within_year(year: int) -> date:

    start_datetime = datetime(year, 1, 1, 0, 0, 0)
    end_datetime = datetime(year, 12, 31, 23, 59, 59)
    seconds_between_dates = int((end_datetime - start_datetime).total_seconds())
    random_seconds = random.randint(0, seconds_between_dates)
    return start_datetime + timedelta(seconds=random_seconds)

def generate_dummy_dor(date: date):
    
    dor_dict = {
        "contractor": "PT APS",
        "current_md": 0,
        "avg_wob": 0,
        "avg_rop": 0,
        "avg_rpm": 0,
        "torque": 0,
        "stand_pipe_pressure": 0,
        "flow_rate": 0,
        "string_weight": 0,
        "rotating_weight": 0,
        "total_drilling_time": 0,
        "circulating_pressure": 0,
        "daily_cost": 0,
        "daily_mud_cost": 0,
        "day_supervisor": 'string',
        "night_supervisor": 'string',
        "engineer": 'string',
        "geologist": 'string',
        "day_summary": "string",
        "day_forecast": "string",
        "last_size": 0,
        "set_md": 0,
        "next_size": 0,
        "next_set_md": 0,
        "last_lot_emw": 0,
        "tol": 0,
        "start_mud_volume": 0,
        "lost_surface_mud_volume": 0,
        "lost_dh_mud_volume": 0,
        "dumped_mud_volume": 0,
        "built_mud_volume": 0,
        "ending_mud_volume": 0,
        "max_gas": 0,
        "conn_gas": 0,
        "trip_gas": 0,
        "back_gas": 0,
        "annular_velocity": 0,
        "pb": 0,
        "sys_hhp": 0,
        "hhpb": 0,
        "hsi": 0,
        "percent_psib": 0,
        "jet_velocity": 0,
        "impact_force": 0,
        "if_area": 0,
        "stop_cards": 0,
        "lta": "Y",
        "spill": "Y",
        "h2s_test": "Y",
        "hse_mtg": "Y",
        "kicktrip": "Y",
        "kickdrill": "Y",
        "fire": "Y",
        "personnel": [
            {
            "company": "string",
            "people": 0
            }
        ],
        "incidents": [
            {
            "incidents_time": "04:51:19.403Z",
            "incident": "string",
            "incident_type": "string",
            "comments": "string"
            }
        ],
        "time_breakdowns": [
            {
            "start_time": "04:51:18.403Z",
            "end_time": "04:51:19.403Z",
            "start_measured_depth": 0,
            "end_measured_depth": 0,
            "category": "DRILLING",
            "p": "Y",
            "npt": "NP",
            "code": "(1) Rig Up and Tear Down",
            "operation": "string"
            }
        ],
        "bit_records": [
            {
            "bit_size": 0,
            "bit_number": 0,
            "bit_run": 0,
            "manufacturer": "string",
            "iadc_code": "string",
            "jets": "string",
            "serial": "string",
            "depth_out": 0,
            "depth_in": 0,
            "meterage": 0,
            "bit_hours": 0,
            "nozzels": 0,
            "dull_grade": "string"
            }
        ],
        "bottom_hole_assemblies": [
            {
            "bha_number": 0,
            "bha_run": 0,
            "components": [
                {
                "component": "Bumper Sub",
                "outer_diameter": 0,
                "length": 0
                }
            ]
            }
        ],
        "drilling_fluids": [
            {
            "mud_type": "LIQUID",
            "time": "04:51:19.404Z",
            "mw_in": 0,
            "mw_out": 0,
            "temp_in": 0,
            "temp_out": 0,
            "pres_grad": 0,
            "visc": 0,
            "pv": 0,
            "yp": 0,
            "gels_10_sec": 0,
            "gels_10_min": 0,
            "fluid_loss": 0,
            "ph": 0,
            "solids": 0,
            "sand": 0,
            "water": 0,
            "oil": 0,
            "hgs": 0,
            "lgs": 0,
            "ltlp": 0,
            "hthp": 0,
            "cake": 0,
            "e_stb": 0,
            "pf": 0,
            "mf": 0,
            "pm": 0,
            "ecd": 0
            }
        ],
        "mud_additives": [
            {
            "mud_additive_type": "string",
            "amount": 0
            }
        ],
        "bulk_materials": [
            {
            "material_type": "string",
            "material_name": "string",
            "material_uom": "string",
            "received": 0,
            "consumed": 0,
            "returned": 0,
            "adjust": 0,
            "ending": 0
            }
        ],
        "directional_surveys": [
            {
            "measured_depth": 0,
            "inclination": 0,
            "azimuth": 0
            }
        ],
        "pumps": [
            {
            "slow_speed": "Y",
            "circulate": 0,
            "strokes": 0,
            "pressure": 0,
            "liner_size": 0,
            "efficiency": 0
            }
        ],
        "weather": {
            "temperature_high": 0,
            "temperature_low": 0,
            "chill_factor": 0,
            "wind_speed": 0,
            "wind_direction": 0,
            "barometric_pressure": 0,
            "wave_height": 0,
            "wave_current_speed": 0,
            "road_condition": "string",
            "visibility": "string"
        },
        "report_date": date
    }
    
    db_report = DailyOperationsReport(
            **parse_schema(DailyOperationsReportCreate.model_validate(dor_dict))
        )
    
    return db_report

def random_wrm_from_requirements(wrm_requirements: dict , wrm_data: dict):
    return {wrm_requirement:wrm_data.get(wrm_requirement) for wrm_requirement in list(wrm_requirements.keys())}

def random_kkks(kkkss: list):
    while True:
        kkks = random.choice(kkkss)
        if not kkks.area.fields == []:  # Redo the random if it's 5-10
            return kkks

def random_data_from_dict(data: dict):
    if settings.RANDOMIZE_DATA_CREATION:
        return dict(random.sample(list(data.items()), random.randint(1, len(data.keys()))))
    else:
        return data

def generate_dummy_data(db, n: int):

    df_plan = pd.read_excel('app/scripts/dummy_data/Operation Days.xlsx', sheet_name='Plan')
    df_actual = pd.read_excel('app/scripts/dummy_data/Operation Days.xlsx', sheet_name='Actual')
    
    plan_job_operation_days = []
    
    for i, row in df_plan.iterrows():
        plan_job_operation_days.append(
            {
                "unit_type": "METRICS",
                "phase": row['Event'],
                "depth_datum": "KB",
                "depth_in": row['Start Depth'],
                "depth_out": row['End Depth'],
                "operation_days": row['Days']
            }
        )
    
    actual_job_operation_days = []
    
    for i, row in df_actual.iterrows():
        actual_job_operation_days.append(
            {
                "unit_type": "METRICS",
                "phase": row['Event'],
                "depth_datum": "KB",
                "depth_in": row['Start Depth'],
                "depth_out": row['End Depth'],
                "depth_uom": "FEET",
                "operation_days": row['Days']
            }
        )
    
    wbs_wrm_date = random_datetime_within_year(2024)
    
    drilling_plan_wbs = {
      "wrm_pembebasan_lahan": {
        "start_date": wbs_wrm_date.date(),
        "end_date": (wbs_wrm_date + timedelta(days=random.randint(0,30))).date(),
        "remarks": "string"
      },
      "wrm_ippkh": {
        "start_date": wbs_wrm_date.date(),
        "end_date": (wbs_wrm_date + timedelta(days=random.randint(0,30))).date(),
        "remarks": "string"
      },
      "wrm_ukl_upl": {
        "start_date": wbs_wrm_date.date(),
        "end_date": (wbs_wrm_date + timedelta(days=random.randint(0,30))).date(),
        "remarks": "string"
      },
      "wrm_amdal": {
        "start_date": wbs_wrm_date.date(),
        "end_date": (wbs_wrm_date + timedelta(days=random.randint(0,30))).date(),
        "remarks": "string"
      },
      "wrm_pengadaan_rig": {
        "start_date": wbs_wrm_date.date(),
        "end_date": (wbs_wrm_date + timedelta(days=random.randint(0,30))).date(),
        "remarks": "string"
      },
      "wrm_pengadaan_drilling_services": {
        "start_date": wbs_wrm_date.date(),
        "end_date": (wbs_wrm_date + timedelta(days=random.randint(0,30))).date(),
        "remarks": "string"
      },
      "wrm_pengadaan_lli": {
        "start_date": wbs_wrm_date.date(),
        "end_date": (wbs_wrm_date + timedelta(days=random.randint(0,30))).date(),
        "remarks": "string"
      },
      "wrm_persiapan_lokasi": {
        "start_date": wbs_wrm_date.date(),
        "end_date": (wbs_wrm_date + timedelta(days=random.randint(0,30))).date(),
        "remarks": "string"
      },
      "wrm_internal_kkks": {
        "start_date": wbs_wrm_date.date(),
        "end_date": (wbs_wrm_date + timedelta(days=random.randint(0,30))).date(),
        "remarks": "string"
      },
      "wrm_evaluasi_subsurface": {
        "start_date": wbs_wrm_date.date(),
        "end_date": (wbs_wrm_date + timedelta(days=random.randint(0,30))).date(),
        "remarks": "string"
      },
      "wrm_cutting_dumping": {
        "start_date": wbs_wrm_date.date(),
        "end_date": (wbs_wrm_date + timedelta(days=random.randint(0,30))).date(),
        "remarks": "string"
      },
      "events": [
        {
          "event": "Drilling",
          "start_date": (wbs_wrm_date + timedelta(days=random.randint(30,60))).date(),
          "end_date": (wbs_wrm_date + timedelta(days=random.randint(60,80))).date(),
          "remarks": "string"
        },{
          "event": "P3",
          "start_date": (wbs_wrm_date + timedelta(days=random.randint(80,100))).date(),
          "end_date": (wbs_wrm_date + timedelta(days=random.randint(100,110))).date(),
          "remarks": "string"
        },{
          "event": "Close Out",
          "start_date": (wbs_wrm_date + timedelta(days=random.randint(110,120))).date(),
          "end_date": (wbs_wrm_date + timedelta(days=random.randint(120,130))).date(),
          "remarks": "string"
        }
      ]
    }
    
    wows_plan_wbs = {
        "wrm_internal_kkks": {
            "start_date": wbs_wrm_date.date(),
            "end_date": (wbs_wrm_date + timedelta(days=random.randint(0,30))).date(),
            "remarks": "string"
        },
        "wrm_pengadaan_equipment": {
            "start_date": wbs_wrm_date.date(),
            "end_date": (wbs_wrm_date + timedelta(days=random.randint(0,30))).date(),
            "remarks": "string"
        },
        "wrm_pengadaan_services": {
            "start_date": wbs_wrm_date.date(),
            "end_date": (wbs_wrm_date + timedelta(days=random.randint(0,30))).date(),
            "remarks": "string"
        },
        "wrm_pengadaan_handak": {
            "start_date": wbs_wrm_date.date(),
            "end_date": (wbs_wrm_date + timedelta(days=random.randint(0,30))).date(),
            "remarks": "string"
        },
        "wrm_pengadaan_octg": {
            "start_date": wbs_wrm_date.date(),
            "end_date": (wbs_wrm_date + timedelta(days=random.randint(0,30))).date(),
            "remarks": "string"
        },
        "wrm_pengadaan_artificial_lift": {
            "start_date": wbs_wrm_date.date(), 
            "end_date": (wbs_wrm_date + timedelta(days=random.randint(0,30))).date(),
            "remarks": "string"
        },
        "wrm_pengadaan_lli": {
            "start_date": wbs_wrm_date.date(),
            "end_date": (wbs_wrm_date + timedelta(days=random.randint(0,30))).date(),
            "remarks": "string"
        },
        "wrm_persiapan_lokasi": {
            "start_date": wbs_wrm_date.date(),
             "end_date": (wbs_wrm_date + timedelta(days=random.randint(0,30))).date(),
             "remarks": "string"
         },
        "wrm_sumur_berproduksi": {
            "start_date": wbs_wrm_date.date(),
            "end_date": (wbs_wrm_date + timedelta(days=random.randint(0,30))).date(),
            "remarks": "string"
        },
        "wrm_fasilitas_produksi": {
            "start_date": wbs_wrm_date.date(),
            "end_date": (wbs_wrm_date + timedelta(days=random.randint(0,30))).date(),
            "remarks": "string"
        },
        "wrm_well_integrity": {
            "start_date": wbs_wrm_date.date(),
            "end_date": (wbs_wrm_date + timedelta(days=random.randint(0,30))).date(),
            "remarks": "string"
        },
        "events": [
            {
                "event": "Drilling",
                "start_date": (wbs_wrm_date + timedelta(days=random.randint(30,60))).date(),
                "end_date": (wbs_wrm_date + timedelta(days=random.randint(60,80))).date(),
                "remarks": "string"
            },{
                "event": "P3",
                "start_date": (wbs_wrm_date + timedelta(days=random.randint(80,100))).date(),
                "end_date": (wbs_wrm_date + timedelta(days=random.randint(100,110))).date(),
                "remarks": "string"
            },{
                "event": "Close Out",
                "start_date": (wbs_wrm_date + timedelta(days=random.randint(110,120))).date(),
                "end_date": (wbs_wrm_date + timedelta(days=random.randint(120,130))).date(),
                "remarks": "string"
            }
        ]
    }
    
    casing = pd.read_excel('app/scripts/dummy_data/casing.xlsx')
        
    plan_casing = []
    
    for i, row in casing.iterrows():
        plan_casing.append(
            {
                "top_depth": row["Start Depth"],
                "top_depth_ouom": "m",
                "base_depth": row["End Depth"],
                "base_depth_ouom": "m",
                "hole_size": 0,
                "hole_size_ouom": "m",
                "inside_diameter": row["Inner Diameter"],
                "inside_diameter_ouom": "inch",
                "outside_diameter": row["Outer Diameter"],
                "outside_diameter_ouom": "inch",
                "cement_type": "string",
                "cement_amount": 0,
                "cement_amount_uom": "kg",
                "remark": row['Casing Type']
            }
        )

    skk_user_id = str(uuid.uuid4())
    kkks_user_id = str(uuid.uuid4())
    
    db.add_all(
            [
                Admin(
                    id = skk_user_id,
                    username = f'bpma',
                    email = f'bpma@bpma.com',
                    hashed_password = pwd_context.hash(f'bpma'),
                    # verified_status = True
                ),
                KKKSUser(
                    id = kkks_user_id,
                    username = f'kkks',
                    email = f'kkks@kkks.com',
                    hashed_password = pwd_context.hash(f'kkks'),
                    # verified_status = True
                ),
            ]
        )

    i = n
    
    kkkss = db.query(KKKS).all()

    for i in tqdm(range(n), desc=f"Generating Job for {n} KKKS"):
        
        kkks = random_kkks(kkkss)
        kkks_id = kkks.id
        user_id = str(uuid.uuid4())
        
        user = KKKSUser(
                id = user_id,
                username = f'USER{i:03d}',
                email = f'email{i:03d}@email{i:03d}.com',
                hashed_password = pwd_context.hash(f'USER{i:03d}'),
                kkks_id = kkks_id,
            )

        db.add(
            user
        )
        
        db.commit()
        
        drilling_trajectory_file_id = str(uuid.uuid4())
        log1_file_id = str(uuid.uuid4())
        log2_file_id = str(uuid.uuid4())
        drilling_parameter_file_id = str(uuid.uuid4())
        ppfg_file_id = str(uuid.uuid4())
        core_image_file_id = str(uuid.uuid4())
        drilling_parameter_plan_file_id = str(uuid.uuid4())
        well_core_plan_file_id = str(uuid.uuid4())
        well_log_plan_file_id = str(uuid.uuid4())
        well_materials_file_id = str(uuid.uuid4())
        well_test_actual_file_id = str(uuid.uuid4())
        well_test_plan_file_id = str(uuid.uuid4())
        seismic_file_id = str(uuid.uuid4())
        schematic_file_id = str(uuid.uuid4())

        db.add_all(
            [
                utils_models.PhysicalItem(
                    id = drilling_trajectory_file_id,
                    filename = 'drilling_trajectory.xlsx',
                    file_extension = '.xlsx',
                    file_location = f'app/scripts/dummy_data/drilling_trajectory.xlsx',
                    uploaded_by_id = user_id,
                ),
                utils_models.PhysicalItem(
                    id = log1_file_id,
                    filename = '4704105432.las',
                    file_extension = '.las',
                    file_location = f'app/scripts/dummy_data/4704105432.las',
                    uploaded_by_id = user_id,
                ),
                utils_models.PhysicalItem(
                    id = log2_file_id,
                    filename = 'drilling parameter.xlsx',
                    file_extension = '.xlsx',
                    file_location = f'app/scripts/dummy_data/drilling parameter.xlsx',
                    uploaded_by_id = user_id,
                ),
                utils_models.FileRecord(
                    id = drilling_parameter_file_id,
                    filename = 'drilling parameter.xlsx',
                    file_extension = '.xlsx',
                    file_location = f'app/scripts/dummy_data/drilling parameter.xlsx',
                    uploaded_by_id = user_id,
                ),
                utils_models.FileRecord(
                    id = ppfg_file_id,
                    filename = 'test_pp.xlsx',
                    file_extension = '.xlsx',
                    file_location = f'app/scripts/dummy_data/test_pp.xlsx',
                    uploaded_by_id = user_id,
                ),
                utils_models.PhysicalItem(
                    id = core_image_file_id,
                    filename = 'core.jpg',
                    file_extension = '.jpg',
                    file_location = f'app/scripts/dummy_data/core.jpg',
                    uploaded_by_id = user_id,
                ),
                utils_models.FileRecord(
                    id = drilling_parameter_plan_file_id,
                    filename = 'drilling_parameter_plan.xlsx',
                    file_extension = '.xlsx',
                    file_location = f'app/scripts/dummy_data/drilling_parameter_plan.xlsx',
                    uploaded_by_id = user_id,
                ),
                utils_models.PhysicalItem(
                    id = well_core_plan_file_id,
                    filename = 'well_core_plan.xlsx',
                    file_extension = '.xlsx',
                    file_location = f'app/scripts/dummy_data/well_core_plan.xlsx',
                    uploaded_by_id = user_id,
                ),
                utils_models.FileRecord(
                    id = well_log_plan_file_id,
                    filename = 'well_log_plan.xlsx',
                    file_extension = '.xlsx',
                    file_location = f'app/scripts/dummy_data/well_log_plan.xlsx',
                    uploaded_by_id = user_id,
                ),
                utils_models.FileRecord(
                    id = well_materials_file_id,
                    filename = 'well_materials.xlsx',
                    file_extension = '.xlsx',
                    file_location = f'app/scripts/dummy_data/well_materials.xlsx',
                    uploaded_by_id = user_id,
                ),
                utils_models.FileRecord(
                    id = well_test_actual_file_id,
                    filename = 'well_test_actual.xlsx',
                    file_extension = '.xlsx',
                    file_location = f'app/scripts/dummy_data/well_test_actual.xlsx',
                    uploaded_by_id = user_id,
                ),
                utils_models.FileRecord(
                    id = well_test_plan_file_id,
                    filename = 'well_test_plan.xlsx',
                    file_extension = '.xlsx',
                    file_location = f'app/scripts/dummy_data/well_test_plan.xlsx',
                    uploaded_by_id = user_id,
                ),
                utils_models.PhysicalItem(
                    id = seismic_file_id,
                    filename = 'seismic_file.sgy',
                    file_extension = '.sgy',
                    file_location = f'app/scripts/dummy_data/seismic_file.sgy',
                    uploaded_by_id = user_id,
                ),
                utils_models.FileRecord(
                    id = schematic_file_id,
                    filename = 'well_schematic.jpg',
                    file_extension = '.jpg',
                    file_location = f'app/scripts/dummy_data/well_schematic.jpg',
                    uploaded_by_id = user_id,
                )
            ]
        )
        
        db.commit()
        
        for job_type in [JobType.EXPLORATION, JobType.DEVELOPMENT, JobType.WORKOVER, JobType.WELLSERVICE]:
            
            area = kkks.area
            area_id = area.id
            field = random.choice(area.fields)
            field_id = field.id
            
            rig_type = random_enum_value(RigType)
            rig_hp = random.randint(100, 5000)
            
            rig = Rig(rig_name=f'RIG0{i}', rig_type=rig_type, rig_horse_power=rig_hp)
            db.add(
                rig
            )
            db.commit()
            db.refresh(rig)
            
            for operation_status in [0,1,2,3,4,5,6,7,8,9,10]:
                
                j = random.randint(0,10)

                plan_start = random_datetime_within_year(2024)

                contract_type = random_enum_value(ContractType).value
                
                gdf = gpd.GeoDataFrame.from_features(json.loads(field.geojson)['features'])
                minx, miny, maxx, maxy = gdf.total_bounds
                
                random_lat = random.uniform(miny, maxy)
                random_lon = random.uniform(minx, maxx)
                
                well_dict = {
                    "unit_type": "METRICS",
                    "field_id": field_id,
                    "area_id": area_id,
                    "area_type": "WILAYAH KERJA",
                    "kkks_id": kkks_id,
                    
                    "well_name": f'WELL0{i+j}{j}',
                    "well_num": f'WELL0{i+j}{j}',
                    
                    "well_level_type": "WELL",
                    "well_class": "DELINEATION",
                    "well_profile_type": "HORIZONTAL",
                    "environment_type": random.choice(const.environment_type),
                    "surface_longitude": random_lon,
                    "surface_latitude": random_lat,
                    "bottom_hole_longitude": random_lon,
                    "bottom_hole_latitude": random_lat,
                    "spud_date": "2024-11-16",
                    "final_drill_date": "2024-12-15",
                    "completion_date": "2025-01-15",
                    "abandonment_date": "2030-01-01",
                    "rig_on_site_date": "2024-11-01",
                    "rig_release_date": "2024-12-31",
                    "difference_lat_msl": 120,  # In meters
                    "subsea_elev_ref_type": "KELLY BUSHING",
                    "elev_ref_datum": "MSL",
                    "maximum_inclination": 90,  # Degrees
                    "azimuth": 45,  # Degrees
                    "hydrocarbon_target": random.choice(const.hydrocarbon_target),
                    "kick_off_point": 1500,  # Depth in meters
                    "rotary_table_elev": 25,  # In meters
                    "kb_elev": 30,  # Kelly Bushing elevation
                    "derrick_floor_elev": 35,  # Derrick floor elevation
                    "ground_elev": 5,  # Ground elevation
                    "ground_elev_type": "KELLY BUSHING",
                    "base_depth": 3000,  # Total depth in meters
                    "water_depth": 120,  # Water depth in meters
                    "water_depth_datum": "MEAN SEA LEVEL",
                    "deepest_depth": 3500,  # Total depth
                    "depth_datum": "RT",
                    "depth_datum_elev": 25,  # In meters
                    "drill_td": 3200,  # Drilling Target Depth in meters
                    "top_depth": 100,  # Starting depth in meters
                    "maximum_tvd": 3100,  # True Vertical Depth in meters
                    "final_md": 3300,  # Measured depth in meters
                    "plugback_depth": 3000,  # Depth at which the well was plugged
                    "whipstock_depth": 1500,  # Whipstock kick-off depth in meters
                    "water_acoustic_vel": 1500,  # Acoustic velocity in water in m/s
                    "net_pay": 50,  # Net pay zone in meters
                    "well_status": random.choice(const.well_status),
                    **random_data_from_dict(
                        {
                            "well_drilling_parameter": {
                                "file_id": drilling_parameter_file_id,
                                "filename": "drilling_parameters.csv"
                            },
                            "well_documents": [
                            {
                                "file_id": drilling_parameter_file_id,
                                "filename": "completion_report.pdf",
                                "document_type": "Completion Report",
                                "remark": "Well completed successfully."
                            },
                            {
                                "file_id": seismic_file_id,
                                "filename": "seismic_data_analysis.pdf",
                                "document_type": "Well Report",
                                "remark": "Analysis of seismic lines and target depths."
                            },
                            {
                                "file_id": log1_file_id,
                                "filename": "gamma_ray_log.las",
                                "document_type": "Logging Report",
                                "remark": "Gamma ray log recorded during drilling."
                            },
                            {
                                "file_id": log2_file_id,
                                "filename": "resistivity_log.las",
                                "document_type": "Logging Report",
                                "remark": "Resistivity log for formation evaluation."
                            },
                            {
                                "file_id": core_image_file_id,
                                "filename": "core_sample_photos.zip",
                                "document_type": "Core Analysis Report",
                                "remark": "Photographs of core samples from 2000m to 2100m."
                            },
                            {
                                "file_id": ppfg_file_id,
                                "filename": "ppfg_analysis_report.pdf",
                                "document_type": "Pore Pressure Prediction",
                                "remark": "Analysis of PPFG data for safe drilling."
                            },
                            {
                                "file_id": schematic_file_id,
                                "filename": "well_schematic_diagram.png",
                                "document_type": "Wellbore Diagram",
                                "remark": "Schematic diagram of well equipment and casings."
                            },
                            {
                                "file_id": drilling_parameter_plan_file_id,
                                "filename": "drilling_plan_parameters.xlsx",
                                "document_type": "Drilling Fluid Report",
                                "remark": "Drilling parameters and planned trajectory."
                            }
                        ],
                            "well_trajectory": {
                                "unit_type": "METRICS",
                                "physical_item_id": drilling_trajectory_file_id,
                                "survey_start_date": "2024-11-19",
                                "survey_end_date": "2024-11-25",
                                "top_depth": 100,
                                "base_depth": 3300,
                                "survey_type": "Directional Survey"
                            },
                            "well_logs": [
                                {
                                    "unit_type": "METRICS",
                                    "top_depth": 100,
                                    "base_depth": 3300,
                                    "logs": "Gamma Ray",
                                    "physical_item_id": log1_file_id
                                },
                                {
                                    "unit_type": "METRICS",
                                    "top_depth": 100,
                                    "base_depth": 3300,
                                    "logs": "Resistivity",
                                    "physical_item_id": log2_file_id
                                }
                            ],
                            "well_cores": [
                                {
                                    "unit_type": "METRICS",
                                    "top_depth": 2000,
                                    "base_depth": 2100,
                                    "core_diameter": 4,  # Inches
                                    "core_type": "Sidewall",
                                    "core_show_type": "Oil",
                                    "remark": "Oil show in sandstone",
                                    "physical_item_id": core_image_file_id
                                },
                                {
                                    "unit_type": "METRICS",
                                    "top_depth": 1500,
                                    "base_depth": 1600,
                                    "core_diameter": 4.5,  # Inches
                                    "core_type": "Conventional",
                                    "core_show_type": "Gas",
                                    "remark": "Gas traces in limestone formation.",
                                    "physical_item_id": core_image_file_id
                                },
                                {
                                    "unit_type": "METRICS",
                                    "top_depth": 2500,
                                    "base_depth": 2600,
                                    "core_diameter": 3.75,  # Inches
                                    "core_type": "Sidewall",
                                    "core_show_type": "Oil",
                                    "remark": "Oil saturation evident in dolomite layers.",
                                    "physical_item_id": core_image_file_id
                                },
                                {
                                    "unit_type": "METRICS",
                                    "top_depth": 2800,
                                    "base_depth": 2900,
                                    "core_diameter": 5,  # Inches
                                    "core_type": "Conventional",
                                    "core_show_type": "Water",
                                    "remark": "Water zone identified in shale layer.",
                                    "physical_item_id": core_image_file_id
                                },
                                {
                                    "unit_type": "METRICS",
                                    "top_depth": 3200,
                                    "base_depth": 3300,
                                    "core_diameter": 3.5,  # Inches
                                    "core_type": "Sidewall",
                                    "core_show_type": "Oil",
                                    "remark": "High porosity sandstone with oil traces.",
                                    "physical_item_id": core_image_file_id
                                }
                            ],
                            "well_tests": [
                                {
                                    "test_type": "Production",
                                    "run_num": "1",
                                    "test_num": "1",
                                    "active_ind": "y",
                                    "base_depth": 3300,
                                    "base_depth_ouom": "m",
                                    "bhp_z": 350,  # Bottom hole pressure in bar
                                    "bottom_choke_desc": "1 inch",
                                    "bsw_percent": 20,  # Basic Sediment and Water
                                    "caliper_hole_diameter": 8.5,  # Inches
                                    "casing_pressure": 500,  # PSI
                                    "choke_size_desc": "1.5 inch",
                                    "condensate_flow_amount": 300,  # Bbl/day
                                    "gas_flow_amount": 1000,  # Mcf/day
                                    "oil_flow_amount": 800,  # Bbl/day
                                    "water_flow_amount": 200,  # Bbl/day
                                    "z_factor": 0.9
                                },
                                {
                                    "test_type": "Drill Stem",
                                    "run_num": "2",
                                    "test_num": "1",
                                    "active_ind": "n",
                                    "base_depth": 3000,
                                    "base_depth_ouom": "m",
                                    "bhp_z": 320,  # Bottom hole pressure in bar
                                    "bottom_choke_desc": "1.25 inch",
                                    "bsw_percent": 25,  # Basic Sediment and Water
                                    "caliper_hole_diameter": 9.0,  # Inches
                                    "casing_pressure": 450,  # PSI
                                    "choke_size_desc": "2 inch",
                                    "condensate_flow_amount": 200,  # Bbl/day
                                    "gas_flow_amount": 1200,  # Mcf/day
                                    "oil_flow_amount": 700,  # Bbl/day
                                    "water_flow_amount": 300,  # Bbl/day
                                    "z_factor": 0.87
                                },
                                {
                                    "test_type": "Injection",
                                    "run_num": "3",
                                    "test_num": "2",
                                    "active_ind": "y",
                                    "base_depth": 2800,
                                    "base_depth_ouom": "m",
                                    "bhp_z": 400,  # Bottom hole pressure in bar
                                    "bottom_choke_desc": "1.5 inch",
                                    "bsw_percent": 15,  # Basic Sediment and Water
                                    "caliper_hole_diameter": 7.5,  # Inches
                                    "casing_pressure": 600,  # PSI
                                    "choke_size_desc": "1.75 inch",
                                    "condensate_flow_amount": 250,  # Bbl/day
                                    "gas_flow_amount": 950,  # Mcf/day
                                    "oil_flow_amount": 850,  # Bbl/day
                                    "water_flow_amount": 150,  # Bbl/day
                                    "z_factor": 0.93
                                },
                                {
                                    "test_type": "Build-Up",
                                    "run_num": "4",
                                    "test_num": "1",
                                    "active_ind": "n",
                                    "base_depth": 2900,
                                    "base_depth_ouom": "m",
                                    "bhp_z": 370,  # Bottom hole pressure in bar
                                    "bottom_choke_desc": "2 inch",
                                    "bsw_percent": 18,  # Basic Sediment and Water
                                    "caliper_hole_diameter": 8.25,  # Inches
                                    "casing_pressure": 520,  # PSI
                                    "choke_size_desc": "2.25 inch",
                                    "condensate_flow_amount": 280,  # Bbl/day
                                    "gas_flow_amount": 1100,  # Mcf/day
                                    "oil_flow_amount": 780,  # Bbl/day
                                    "water_flow_amount": 250,  # Bbl/day
                                    "z_factor": 0.88
                                },
                                {
                                    "test_type": "Extended Well Test",
                                    "run_num": "5",
                                    "test_num": "3",
                                    "active_ind": "y",
                                    "base_depth": 3100,
                                    "base_depth_ouom": "m",
                                    "bhp_z": 390,  # Bottom hole pressure in bar
                                    "bottom_choke_desc": "1.25 inch",
                                    "bsw_percent": 22,  # Basic Sediment and Water
                                    "caliper_hole_diameter": 8.75,  # Inches
                                    "casing_pressure": 550,  # PSI
                                    "choke_size_desc": "2 inch",
                                    "condensate_flow_amount": 350,  # Bbl/day
                                    "gas_flow_amount": 1050,  # Mcf/day
                                    "oil_flow_amount": 820,  # Bbl/day
                                    "water_flow_amount": 220,  # Bbl/day
                                    "z_factor": 0.91
                                }
                            ],
                            "seismic_line": {
                                "physical_item_id": seismic_file_id,
                                "seismic_line_name": "Line_123",
                                "average_velocity": 1500,  # m/s
                                "shot_point_number": 1000,
                                "max_latitude": 5.5,
                                "max_longitude": 100.5,
                                "min_latitude": -5.5,
                                "min_longitude": 95.0,
                                "remark": "Seismic acquisition data"
                            },
                            "well_casings": plan_casing,
                            "well_equipments": [
                                {
                                    "purchase_date": "2024-10-01",
                                    "commission_date": "2024-11-01",
                                    "decommission_date": "2034-10-01",
                                    "equipment_group": "Pump",
                                    "equipment_name": "Centrifugal Pump",
                                    "equipment_type": "ESP",
                                    "serial_num": "PUMP12345",
                                    "description": "Electric submersible pump",
                                    "remark": "High performance"
                                },
                                {
                                    "purchase_date": "2023-05-15",
                                    "commission_date": "2023-06-01",
                                    "decommission_date": "2033-05-15",
                                    "equipment_group": "Valve",
                                    "equipment_name": "Control Valve",
                                    "equipment_type": "Hydraulic",
                                    "serial_num": "VALVE67890",
                                    "description": "Hydraulic control valve for pressure regulation",
                                    "remark": "Regular maintenance required"
                                },
                                {
                                    "purchase_date": "2025-01-10",
                                    "commission_date": "2025-02-15",
                                    "decommission_date": "2040-01-10",
                                    "equipment_group": "Compressor",
                                    "equipment_name": "Gas Compressor",
                                    "equipment_type": "Rotary",
                                    "serial_num": "COMP54321",
                                    "description": "Rotary screw gas compressor",
                                    "remark": "Suitable for high-pressure applications"
                                },
                                {
                                    "purchase_date": "2022-09-20",
                                    "commission_date": "2022-10-05",
                                    "decommission_date": "2032-09-20",
                                    "equipment_group": "Separator",
                                    "equipment_name": "Oil-Water Separator",
                                    "equipment_type": "Horizontal",
                                    "serial_num": "SEP09876",
                                    "description": "Horizontal separator for oil and water",
                                    "remark": "Operational under high efficiency"
                                },
                                {
                                    "purchase_date": "2021-03-12",
                                    "commission_date": "2021-04-01",
                                    "decommission_date": "2031-03-12",
                                    "equipment_group": "Tank",
                                    "equipment_name": "Storage Tank",
                                    "equipment_type": "Vertical",
                                    "serial_num": "TANK23456",
                                    "description": "Vertical storage tank for crude oil",
                                    "remark": "Corrosion-resistant"
                                },
                                {
                                    "purchase_date": "2026-07-18",
                                    "commission_date": "2026-08-01",
                                    "decommission_date": "2041-07-18",
                                    "equipment_group": "Pump",
                                    "equipment_name": "Diaphragm Pump",
                                    "equipment_type": "Positive Displacement",
                                    "serial_num": "PUMP76543",
                                    "description": "Diaphragm pump for chemical injection",
                                    "remark": "Precise metering capabilities"
                                },
                                {
                                    "purchase_date": "2020-12-05",
                                    "commission_date": "2021-01-10",
                                    "decommission_date": "2030-12-05",
                                    "equipment_group": "Safety",
                                    "equipment_name": "Blowout Preventer",
                                    "equipment_type": "Annular",
                                    "serial_num": "BOP11122",
                                    "description": "Annular blowout preventer for well control",
                                    "remark": "Certified for extreme conditions"
                                },
                                {
                                    "purchase_date": "2027-03-22",
                                    "commission_date": "2027-04-15",
                                    "decommission_date": "2042-03-22",
                                    "equipment_group": "Sensor",
                                    "equipment_name": "Pressure Sensor",
                                    "equipment_type": "Digital",
                                    "serial_num": "SENS33221",
                                    "description": "Digital pressure sensor for real-time monitoring",
                                    "remark": "Integrated with SCADA systems"
                                },
                                {
                                    "purchase_date": "2023-11-30",
                                    "commission_date": "2024-01-01",
                                    "decommission_date": "2033-11-30",
                                    "equipment_group": "Pipeline",
                                    "equipment_name": "Flowline",
                                    "equipment_type": "Flexible",
                                    "serial_num": "PIPE55432",
                                    "description": "Flexible flowline for oil and gas transfer",
                                    "remark": "Resistant to temperature fluctuations"
                                },
                                {
                                    "purchase_date": "2028-06-15",
                                    "commission_date": "2028-07-01",
                                    "decommission_date": "2043-06-15",
                                    "equipment_group": "Pump",
                                    "equipment_name": "Jet Pump",
                                    "equipment_type": "Centrifugal",
                                    "serial_num": "PUMP87654",
                                    "description": "Jet pump for enhanced oil recovery",
                                    "remark": "High durability"
                                }
                            ],
                            "well_completion": [
                                {
                                    "completion_obs_no": 1,
                                    "base_depth": 3300,
                                    "base_depth_ouom": "m",
                                    "completion_date": "2025-01-15",
                                    "completion_method": "Hydraulic Fracturing",
                                    "completion_type": "Open Hole",
                                    "remark": "Fractured for better production",
                                    "top_depth": 3200,
                                    "top_depth_ouom": "m"
                                },
                                {
                                    "completion_obs_no": 2,
                                    "base_depth": 2500,
                                    "base_depth_ouom": "m",
                                    "completion_date": "2024-10-10",
                                    "completion_method": "Cemented Liner",
                                    "completion_type": "Cased Hole",
                                    "remark": "Cased for better stability",
                                    "top_depth": 2400,
                                    "top_depth_ouom": "m"
                                },
                                {
                                    "completion_obs_no": 3,
                                    "base_depth": 3800,
                                    "base_depth_ouom": "m",
                                    "completion_date": "2026-05-20",
                                    "completion_method": "Perforated Liner",
                                    "completion_type": "Cased Hole",
                                    "remark": "Perforated to enhance production",
                                    "top_depth": 3700,
                                    "top_depth_ouom": "m"
                                },
                                {
                                    "completion_obs_no": 4,
                                    "base_depth": 2900,
                                    "base_depth_ouom": "m",
                                    "completion_date": "2024-12-30",
                                    "completion_method": "Multistage Fracturing",
                                    "completion_type": "Open Hole",
                                    "remark": "Enhanced oil recovery with multistage fractures",
                                    "top_depth": 2800,
                                    "top_depth_ouom": "m"
                                },
                                {
                                    "completion_obs_no": 5,
                                    "base_depth": 4100,
                                    "base_depth_ouom": "m",
                                    "completion_date": "2027-08-05",
                                    "completion_method": "Cemented Liner",
                                    "completion_type": "Open Hole",
                                    "remark": "Cemented for long-term well integrity",
                                    "top_depth": 4000,
                                    "top_depth_ouom": "m"
                                },
                                {
                                    "completion_obs_no": 6,
                                    "base_depth": 2900,
                                    "base_depth_ouom": "m",
                                    "completion_date": "2026-02-14",
                                    "completion_method": "Hydraulic Fracturing",
                                    "completion_type": "Cased Hole",
                                    "remark": "Fractured to enhance permeability",
                                    "top_depth": 2800,
                                    "top_depth_ouom": "m"
                                },
                                {
                                    "completion_obs_no": 7,
                                    "base_depth": 3300,
                                    "base_depth_ouom": "m",
                                    "completion_date": "2028-03-25",
                                    "completion_method": "Sliding Sleeve",
                                    "completion_type": "Cased Hole",
                                    "remark": "Sliding sleeve for selective zone isolation",
                                    "top_depth": 3200,
                                    "top_depth_ouom": "m"
                                },
                                {
                                    "completion_obs_no": 8,
                                    "base_depth": 3600,
                                    "base_depth_ouom": "m",
                                    "completion_date": "2026-09-17",
                                    "completion_method": "Plug and Perf",
                                    "completion_type": "Cased Hole",
                                    "remark": "Plug and perf for precise stimulation",
                                    "top_depth": 3500,
                                    "top_depth_ouom": "m"
                                },
                                {
                                    "completion_obs_no": 9,
                                    "base_depth": 3100,
                                    "base_depth_ouom": "m",
                                    "completion_date": "2024-11-25",
                                    "completion_method": "Fracture Stimulation",
                                    "completion_type": "Open Hole",
                                    "remark": "Fracture stimulation for increased flow",
                                    "top_depth": 3000,
                                    "top_depth_ouom": "m"
                                },
                                {
                                    "completion_obs_no": 10,
                                    "base_depth": 4400,
                                    "base_depth_ouom": "m",
                                    "completion_date": "2027-06-10",
                                    "completion_method": "Hydraulic Fracturing",
                                    "completion_type": "Cased Hole",
                                    "remark": "Fractured to enhance reservoir contact",
                                    "top_depth": 4300,
                                    "top_depth_ouom": "m"
                                }
                            ],
                            "well_ppfg": {
                                "file_id": ppfg_file_id,
                                "filename": "ppfg_analysis.pdf"
                            },
                            "well_schematic": {
                                "file_id": schematic_file_id,
                                "filename": "well_schematic.png"
                            },
                            "well_stratigraphy": [
                                {
                                    "unit_type": "METRICS",
                                    "depth_datum": "RT",
                                    "top_depth": 100,
                                    "bottom_depth": 3300,
                                    "formation_name": "Sandstone Formation",
                                    "lithology": "Sandstone"
                                },
                                {
                                    "unit_type": "METRICS",
                                    "depth_datum": "RT",
                                    "top_depth": 3300,
                                    "bottom_depth": 3400,
                                    "formation_name": "Limestone Formation",
                                    "lithology": "Limestone"
                                },
                                {
                                    "unit_type": "METRICS",
                                    "depth_datum": "RT",
                                    "top_depth": 3400,
                                    "bottom_depth": 3600,
                                    "formation_name": "Shale Formation",
                                    "lithology": "Shale"
                                },
                                {
                                    "unit_type": "METRICS",
                                    "depth_datum": "RT",
                                    "top_depth": 3600,
                                    "bottom_depth": 3900,
                                    "formation_name": "Dolomite Formation",
                                    "lithology": "Dolomite"
                                },
                                {
                                    "unit_type": "METRICS",
                                    "depth_datum": "RT",
                                    "top_depth": 3900,
                                    "bottom_depth": 4200,
                                    "formation_name": "Claystone Formation",
                                    "lithology": "Claystone"
                                },
                                {
                                    "unit_type": "METRICS",
                                    "depth_datum": "RT",
                                    "top_depth": 4200,
                                    "bottom_depth": 4400,
                                    "formation_name": "Anhydrite Formation",
                                    "lithology": "Anhydrite"
                                },
                                {
                                    "unit_type": "METRICS",
                                    "depth_datum": "RT",
                                    "top_depth": 4400,
                                    "bottom_depth": 4700,
                                    "formation_name": "Salt Formation",
                                    "lithology": "Salt"
                                },
                                {
                                    "unit_type": "METRICS",
                                    "depth_datum": "RT",
                                    "top_depth": 4700,
                                    "bottom_depth": 5000,
                                    "formation_name": "Coal Formation",
                                    "lithology": "Coal"
                                },
                                {
                                    "unit_type": "METRICS",
                                    "depth_datum": "RT",
                                    "top_depth": 5000,
                                    "bottom_depth": 5300,
                                    "formation_name": "Granite Formation",
                                    "lithology": "Granite"
                                },
                                {
                                    "unit_type": "METRICS",
                                    "depth_datum": "RT",
                                    "top_depth": 5300,
                                    "bottom_depth": 5500,
                                    "formation_name": "Basalt Formation",
                                    "lithology": "Basalt"
                                }
                            ],
                            "well_pressure": [
                                {
                                    "pressure_obs_no": 1,
                                    "active_ind": "y",
                                    "base_depth": 3300,
                                    "base_depth_ouom": "m",
                                    "flow_casing_pressure": 450,  # PSI
                                    "flow_tubing_pressure": 500,  # PSI
                                    "init_reservoir_pressure": 520,  # PSI
                                    "pool_datum": "Reservoir",
                                    "pool_datum_depth": 3200,  # m
                                    "remark": "Initial pressure measurement",
                                    "shutin_casing_pressure": 420,  # PSI
                                    "shutin_tubing_pressure": 470,  # PSI
                                    "top_depth": 100,
                                    "top_depth_ouom": "m"
                                },
                                {
                                    "pressure_obs_no": 2,
                                    "active_ind": "y",
                                    "base_depth": 3500,
                                    "base_depth_ouom": "m",
                                    "flow_casing_pressure": 460,  # PSI
                                    "flow_tubing_pressure": 510,  # PSI
                                    "init_reservoir_pressure": 530,  # PSI
                                    "pool_datum": "Reservoir",
                                    "pool_datum_depth": 3400,  # m
                                    "remark": "Mid-life pressure measurement",
                                    "shutin_casing_pressure": 430,  # PSI
                                    "shutin_tubing_pressure": 480,  # PSI
                                    "top_depth": 200,
                                    "top_depth_ouom": "m"
                                },
                                {
                                    "pressure_obs_no": 3,
                                    "active_ind": "n",
                                    "base_depth": 3600,
                                    "base_depth_ouom": "m",
                                    "flow_casing_pressure": 470,  # PSI
                                    "flow_tubing_pressure": 520,  # PSI
                                    "init_reservoir_pressure": 540,  # PSI
                                    "pool_datum": "Reservoir",
                                    "pool_datum_depth": 3500,  # m
                                    "remark": "Pressure measurement after well intervention",
                                    "shutin_casing_pressure": 440,  # PSI
                                    "shutin_tubing_pressure": 490,  # PSI
                                    "top_depth": 300,
                                    "top_depth_ouom": "m"
                                },
                                {
                                    "pressure_obs_no": 4,
                                    "active_ind": "y",
                                    "base_depth": 3700,
                                    "base_depth_ouom": "m",
                                    "flow_casing_pressure": 480,  # PSI
                                    "flow_tubing_pressure": 530,  # PSI
                                    "init_reservoir_pressure": 550,  # PSI
                                    "pool_datum": "Reservoir",
                                    "pool_datum_depth": 3600,  # m
                                    "remark": "Pressure measurement after well re-perforation",
                                    "shutin_casing_pressure": 450,  # PSI
                                    "shutin_tubing_pressure": 500,  # PSI
                                    "top_depth": 400,
                                    "top_depth_ouom": "m"
                                },
                                {
                                    "pressure_obs_no": 5,
                                    "active_ind": "n",
                                    "base_depth": 3800,
                                    "base_depth_ouom": "m",
                                    "flow_casing_pressure": 490,  # PSI
                                    "flow_tubing_pressure": 540,  # PSI
                                    "init_reservoir_pressure": 560,  # PSI
                                    "pool_datum": "Reservoir",
                                    "pool_datum_depth": 3700,  # m
                                    "remark": "Pressure measurement before well suspension",
                                    "shutin_casing_pressure": 460,  # PSI
                                    "shutin_tubing_pressure": 510,  # PSI
                                    "top_depth": 500,
                                    "top_depth_ouom": "m"
                                }
                            ],
                            "well_drilling_parameter_plan": {
                                "file_id": drilling_parameter_plan_file_id
                            }
                        }
                    )
                }

                plan_start_date = plan_start.date()
                plan_end_date = (plan_start+timedelta(days=20)).date()
                
                actual_start_date = (plan_start+timedelta(days=random.randint(0,5))).date()
                actual_end_date = (plan_start+timedelta(days=20+random.randint(0,5))).date()
                
                plan_total_budget = round(random.uniform(9999999, 999999),2)
                actual_total_budget = round(plan_total_budget*(1+random.uniform(-0.1, 0.1)),2)
                
                if job_type in [JobType.EXPLORATION, JobType.DEVELOPMENT]:
                    wrm = random_data_from_dict(
                        {
                            "wrm_pembebasan_lahan": True,
                            "wrm_ippkh": True,
                            "wrm_ukl_upl": True,
                            "wrm_amdal": True,
                            "wrm_cutting_dumping": True,
                            "wrm_pengadaan_rig": True,
                            "wrm_pengadaan_drilling_services": True,
                            "wrm_pengadaan_lli": True,
                            "wrm_persiapan_lokasi": True,
                            "wrm_internal_kkks": True,
                            "wrm_evaluasi_subsurface": True
                        }
                    )
                    
                    wrm_percents = {
                        "wrm_pembebasan_lahan": random.choice(range(10, 101, 10)),
                        "wrm_ippkh": random.choice(range(10, 101, 10)),
                        "wrm_ukl_upl": random.choice(range(10, 101, 10)),
                        "wrm_amdal": random.choice(range(10, 101, 10)),
                        "wrm_cutting_dumping": random.choice(range(10, 101, 10)),
                        "wrm_pengadaan_rig": random.choice(range(10, 101, 10)),
                        "wrm_pengadaan_drilling_services": random.choice(range(10, 101, 10)),
                        "wrm_pengadaan_lli": random.choice(range(10, 101, 10)),
                        "wrm_persiapan_lokasi": random.choice(range(10, 101, 10)),
                        "wrm_internal_kkks": random.choice(range(10, 101, 10)),
                        "wrm_evaluasi_subsurface": random.choice(range(10, 101, 10))
                    }
                    
                    wrm_wbs = random_wrm_from_requirements(wrm, drilling_plan_wbs)
                    wrm_percentages = random_wrm_from_requirements(wrm, wrm_percents)
                                        
                    plan_job_dict = {
                        "start_date": plan_start_date,
                        "end_date": plan_end_date,
                        "total_budget": plan_total_budget,
                        "rig_id": rig.id,
                        "job_operation_days": plan_job_operation_days,
                        "work_breakdown_structure": wrm_wbs,
                        **random_data_from_dict(
                            {
                                "job_hazards": [
                                {
                                    "hazard_type": "GAS KICK",
                                    "hazard_description": "string",
                                    "severity": "LOW",
                                    "mitigation": "string",
                                    "remark": "string"
                                }
                                ],
                                "job_documents": [
                                {
                                    "file_id": drilling_trajectory_file_id,
                                    "document_type": "Drilling Plan",
                                    "remark": "string"
                                }
                                ],
                                "job_project_management_team": [
                                {
                                    "company": "string",
                                    "position": "string",
                                    "name": "string"
                                }
                                ],
                                "job_equipments": [
                                {
                                    "equipment": "string",
                                    "vendor": "string"
                                }
                                ],
                                "job_hse_aspect": {
                                    "near_miss": 0,
                                    "fatality": 0,
                                    "spill": 0,
                                    "unsafe_condition": 0,
                                    "unsafe_action": 0,
                                    "man_hour": 0
                                },
                            }
                        ),
                        "well": CreateDummyPlanWell(**well_dict).model_dump(),
                        **wrm
                    }

                    actual_job_dict = {
                        "total_budget": actual_total_budget,
                        "rig_id": rig.id,
                        "job_operation_days": actual_job_operation_days,
                        "work_breakdown_structure": wrm_wbs,
                        **random_data_from_dict(
                            {
                                "job_hazards": [
                                {
                                    "hazard_type": "GAS KICK",
                                    "hazard_description": "string",
                                    "severity": "LOW",
                                    "mitigation": "string",
                                    "remark": "string"
                                }
                                ],
                                "job_project_management_team": [
                                {
                                    "company": "string",
                                    "position": "string",
                                    "name": "string"
                                }
                                ],
                                "job_equipments": [
                                {
                                    "equipment": "string",
                                    "vendor": "string"
                                }
                                ],
                                "job_hse_aspect": {
                                    "near_miss": 0,
                                    "fatality": 0,
                                    "spill": 0,
                                    "unsafe_condition": 0,
                                    "unsafe_action": 0,
                                    "man_hour": 0
                                },
                            }
                        ),
                        "well": CreateActualWellDummy(**well_dict).model_dump(),
                        **wrm_percentages
                    }
                    
                    drilling_job_dict = {
                        "area_id": area_id,
                        "area_type": "WILAYAH KERJA",
                        "field_id": field_id,
                        "contract_type": contract_type,
                        "afe_number": f'AFE0{j}' if contract_type == 'COST-RECOVERY' else '-',
                        "wpb_year": 2024,
                        "job_plan": plan_job_dict,
                    }
                    
                    if job_type == JobType.EXPLORATION:
                        work_schema = CreateDummyExplorationJob
                        job_actual_schema = CreateDummyActualExploration
                        actual_work_schema = ActualExploration
                    else:
                        work_schema = CreateDummyDevelopmentJob
                        job_actual_schema = CreateDummyActualDevelopment
                        actual_work_schema = ActualDevelopment
                        
                    well_id = str(uuid.uuid4())
                        
                    db_job = Job(
                        **job_crud.parse_schema(work_schema(**drilling_job_dict), variables={'uwi':well_id, 'unit_type':UnitType.METRICS})
                    )
                    
                    well_id = str(uuid.uuid4())
                    
                    actual_job = actual_work_schema(
                        **job_crud.parse_schema(job_actual_schema(**actual_job_dict), variables={'uwi':well_id, 'unit_type':UnitType.METRICS})
                    )

                else:
                    
                    well_id = str(uuid.uuid4())
                    
                    job_category = random_enum_value(WellServiceJobCategory).value if job_type == JobType.WELLSERVICE else random_enum_value(WorkoverJobCategory).value

                    wrm = random_data_from_dict(
                        {
                            "wrm_pembebasan_lahan": True,
                            "wrm_ippkh": True,
                            "wrm_ukl_upl": True,
                            "wrm_amdal": True,
                            "wrm_cutting_dumping": True,
                            "wrm_pengadaan_rig": True,
                            "wrm_pengadaan_drilling_services": True,
                            "wrm_pengadaan_lli": True,
                            "wrm_persiapan_lokasi": True,
                            "wrm_internal_kkks": True,
                            "wrm_evaluasi_subsurface": True
                        }
                    )

                    wrm_wbs = random_wrm_from_requirements(wrm, drilling_plan_wbs)
                    wrm_percentages = random_wrm_from_requirements(wrm, 
                        {
                            "wrm_internal_kkks": random.randint(0, 100),
                            "wrm_pengadaan_equipment": random.randint(0, 100),
                            "wrm_pengadaan_services": random.randint(0, 100),
                            "wrm_pengadaan_handak": random.randint(0, 100),
                            "wrm_pengadaan_octg": random.randint(0, 100),
                            "wrm_pengadaan_lli": random.randint(0, 100),
                            "wrm_pengadaan_artificial_lift": random.randint(0, 100),
                            "wrm_sumur_berproduksi": random.randint(0, 100),
                            "wrm_fasilitas_produksi": random.randint(0, 100),
                            "wrm_persiapan_lokasi": random.randint(0, 100),
                            "wrm_well_integrity": random.randint(0, 100),
                        }
                    )

                    plan_job_dict = {
                        "start_date": plan_start_date,
                        "end_date": plan_end_date,
                        "total_budget": plan_total_budget,
                        "rig_id": rig.id,
                        "job_operation_days": plan_job_operation_days,
                        "work_breakdown_structure": wows_plan_wbs,
                        **random_data_from_dict(
                            {
                            "job_hazards": [
                                {
                                    "hazard_type": "GAS KICK",
                                    "hazard_description": "string",
                                    "severity": "LOW",
                                    "mitigation": "string",
                                    "remark": "string"
                                }
                                ],
                                "job_documents": [
                                {
                                    "file_id": drilling_trajectory_file_id,
                                    "document_type": "Drilling Plan",
                                    "remark": "string"
                                }
                                ],
                                "job_project_management_team": [
                                {
                                    "company": "string",
                                    "position": "string",
                                    "name": "string"
                                }
                                ],
                                "job_equipments": [
                                {
                                    "equipment": "string",
                                    "vendor": "string"
                                }
                                ],
                                "job_hse_aspect": {
                                    "near_miss": 0,
                                    "fatality": 0,
                                    "spill": 0,
                                    "unsafe_condition": 0,
                                    "unsafe_action": 0,
                                    "man_hour": 0
                                },
                                "well_schematic": {
                                    "file_id": schematic_file_id,
                                    "filename": "string"
                                },
                            }
                        ),
                        "equipment": "string",
                        "equipment_specifications": "string",
                        "well_id": well_id,
                        "job_category": job_category,
                        "job_description": "string",
                        "onstream_oil": random.randint(0,50),
                        "onstream_gas": random.randint(0,50),
                        "onstream_water_cut": random.uniform(0.5,1),
                        "target_oil": random.randint(51,100),
                        "target_gas": random.randint(51,100),
                        "target_water_cut": random.uniform(0, 0.49),
                        **wrm
                    }

                    actual_job_dict = {
                        "total_budget": actual_total_budget,
                        "rig_id": rig.id,
                        "job_operation_days": plan_job_operation_days,
                        "work_breakdown_structure": wows_plan_wbs,
                        **random_data_from_dict(
                            {
                            "job_hazards": [
                                {
                                    "hazard_type": "GAS KICK",
                                    "hazard_description": "string",
                                    "severity": "LOW",
                                    "mitigation": "string",
                                    "remark": "string"
                                }
                                ],
                                "job_documents": [
                                {
                                    "file_id": drilling_trajectory_file_id,
                                    "document_type": "Drilling Plan",
                                    "remark": "string"
                                }
                                ],
                                "job_project_management_team": [
                                {
                                    "company": "string",
                                    "position": "string",
                                    "name": "string"
                                }
                                ],
                                "job_equipments": [
                                {
                                    "equipment": "string",
                                    "vendor": "string"
                                }
                                ],
                                "job_hse_aspect": {
                                    "near_miss": 0,
                                    "fatality": 0,
                                    "spill": 0,
                                    "unsafe_condition": 0,
                                    "unsafe_action": 0,
                                    "man_hour": 0
                                },
                                "well_schematic": {
                                    "file_id": schematic_file_id,
                                    "filename": "string"
                                },
                            }
                        ),
                        "rig_id": rig.id,
                        "equipment": "string",
                        "equipment_specifications": "string",
                        "well_id": well_id,
                        "job_category": job_category,
                        "job_description": "string",
                        "onstream_oil": random.randint(0,50),
                        "onstream_gas": random.randint(0,50),
                        "onstream_water_cut": random.uniform(0.5,1),
                        "target_oil": random.randint(51,100),
                        "target_gas": random.randint(51,100),
                        "target_water_cut": random.uniform(0, 0.49),
                        **wrm_percentages
                        }

                    wows_job_dict = {
                        "area_id": area_id,
                        "area_type": "WILAYAH KERJA",
                        "field_id": field_id,
                        "contract_type": contract_type,
                        "afe_number": f'AFE0{j}' if contract_type == 'COST-RECOVERY' else '-',
                        "wpb_year": 2024,
                        "job_plan": plan_job_dict,
                    }
                    
                    well_obj = ExistingWell(
                        **job_crud.parse_schema(CreateExistingWell(**well_dict), variables={'uwi':well_id, 'unit_type':UnitType.METRICS}), id=well_id, kkks_id=kkks_id
                    )

                    db.recursive_add(
                        well_obj
                    )
                    
                    db.commit()
                    
                    if job_type == JobType.WORKOVER:
                        work_schema = CreateWorkoverJob
                        job_actual_schema = CreateDummyActualWorkover
                        actual_work_schema = ActualWorkover
                    else:
                        work_schema = CreateWellServiceJob
                        job_actual_schema = CreateDummyActualWellService
                        actual_work_schema = ActualWellService
                        
                    db_job = Job(
                        **job_crud.parse_schema(work_schema(**wows_job_dict), variables={'uwi':well_id, 'unit_type':UnitType.METRICS})
                    )
                    
                    actual_job = actual_work_schema(
                        **job_crud.parse_schema(job_actual_schema(**actual_job_dict), variables={'uwi':well_id, 'unit_type':UnitType.METRICS})
                    )

                db_job.kkks_id = kkks_id
                db_job.job_type = job_type
                db_job.date_proposed = datetime.now().date()
                db_job.planning_status = PlanningStatus.PROPOSED
                
                db_job.created_by_id = user_id
                db_job.time_created = datetime.now()
                
                if operation_status < 8:
                    db_job.planning_status = PlanningStatus.APPROVED
                    db_job.actual_job = actual_job
                    db_job.date_approved = datetime.now().date()
                    db_job.approved_by_id = user.id
                    db_job.remarks = None
                    
                    if operation_status in [1,2,3,4,5,6,7]:
                        
                        if actual_start_date < datetime.now().date():
                            
                            for key in wrm_percentages.keys():
                                setattr(db_job.actual_job, key, 100)
                            
                            db_job.operation_status = OperationStatus.OPERATING
                            
                            db_job.actual_job.start_date = actual_start_date
                            db_job.job_issues = [
                                JobIssue(
                                    date_time = datetime.now(),
                                    severity = random_enum_value(Severity),
                                    description = 'test',
                                    resolved = True,
                                    resolved_date_time = datetime.now(),
                                ),
                                JobIssue(
                                    date_time = datetime.now(),
                                    severity = random_enum_value(Severity),
                                    description = 'test',
                                    resolved = False,
                                    resolved_date_time = None,
                                )
                            ]

                            if operation_status in [2,3,4,5,6,7]:
                                
                                actual_end_date = (plan_start+timedelta(days=25)).date()
                                
                                if actual_end_date < datetime.now().date():
                                    
                                    db_job.operation_status = OperationStatus.FINISHED
                                    db_job.actual_job.end_date = actual_end_date
                                    db_job.actual_job = actual_job
                                    db_job.daily_operations_report = [
                                        generate_dummy_dor(date) for date in daterange(actual_start_date, actual_end_date)
                                    ]
                                    
                                    if operation_status in [3,4,5,6,7]:
                                        db_job.ppp_status = PPPStatus.PROPOSED
                                        db_job.date_ppp_approved = datetime.now().date()
                                        
                                        ppp = ProposePPP(
                                            surat_pengajuan_ppp=PPPDocument(file_id=drilling_trajectory_file_id, filename=drilling_trajectory_file_id),
                                            nomor_surat_pengajuan_ppp='testtestestest',
                                            dokumen_persetujuan_afe=PPPDocument(file_id=drilling_trajectory_file_id, filename=drilling_trajectory_file_id),
                                            dokumen_project_summary=PPPDocument(file_id=drilling_trajectory_file_id, filename=drilling_trajectory_file_id),
                                            dokumen_pernyataan=PPPDocument(file_id=drilling_trajectory_file_id, filename=drilling_trajectory_file_id),
                                            dokumen_laporan_pekerjaan=PPPDocument(file_id=drilling_trajectory_file_id, filename=drilling_trajectory_file_id),
                                            dokumen_formulir=PPPDocument(file_id=drilling_trajectory_file_id, filename=drilling_trajectory_file_id),
                                            dokumen_korespondensi=PPPDocument(file_id=drilling_trajectory_file_id, filename=drilling_trajectory_file_id),
                                            dokumen_sumur_tidak_berproduksi=PPPDocument(file_id=drilling_trajectory_file_id, filename=drilling_trajectory_file_id),
                                            dokumen_daftar_material=PPPDocument(file_id=drilling_trajectory_file_id, filename=drilling_trajectory_file_id),
                                            dokumen_lainnya=[
                                                PPPOtherDocument(file_id=drilling_trajectory_file_id, filename=drilling_trajectory_file_id, remark="testtesttest"),
                                                PPPOtherDocument(file_id=drilling_trajectory_file_id, filename=drilling_trajectory_file_id, remark="testtesttest"),
                                            ],
                                        )
                                        
                                        propose_ppp_model_fields = ProposePPP.model_fields.keys()
                    
                                        syarat_ppp_fields = [x for x in propose_ppp_model_fields if x not in ["dokumen_lainnya"]]
                                        
                                        for syarat_ppp in syarat_ppp_fields:
                                            
                                            if isinstance(getattr(ppp, syarat_ppp), BaseModel):
                                                dokumen_syarat_obj = JobDocument(**getattr(ppp, syarat_ppp).model_dump(), job_instance_id = db_job.actual_job_id, document_type = JobDocumentType.PPP)
                                            
                                            setattr(db_job, syarat_ppp, dokumen_syarat_obj)
                                        
                                        db_job.nomor_surat_pengajuan_ppp = ppp.nomor_surat_pengajuan_ppp
                                        
                                        documents = []
                                        
                                        for dokumen in ppp.dokumen_lainnya:
                                            documents.append(
                                                JobDocument(
                                                    **dokumen.model_dump(),
                                                    document_type = JobDocumentType.PPP_OTHER
                                                )
                                            )
                                        
                                        db_job.date_ppp_proposed = date.today()
                                        db.add_all(documents)
                                    
                                        if operation_status == 4:
                                            db_job.ppp_status = PPPStatus.RETURNED
                                            db_job.date_ppp_approved = None
                                        elif operation_status in [5,6,7]:
                                            db_job.ppp_status = PPPStatus.APPROVED
                                            db_job.date_ppp_approved = datetime.now().date()
                                            
                                            if operation_status == 7:
                                                db_job.closeout_status = CloseOutStatus.APPROVED
                                                db_job.final_budget = random.randint(100000, 1000000)
                                                db_job.date_co_approved = datetime.now().date()
                                                db_job.date_co_proposed = date.today()
                                            elif operation_status == 6:
                                                db_job.closeout_status = CloseOutStatus.PROPOSED
                                                db_job.final_budget = random.randint(100000, 1000000)
                                                db_job.date_co_approved = None
                                                db_job.date_co_proposed = date.today()
                                else:
                                    db_job.actual_job = actual_job
                                    db_job.daily_operations_report = [
                                        generate_dummy_dor(date) for date in daterange(actual_start_date, datetime.now().date())
                                    ]
                            else:
                                db_job.actual_job = actual_job
                                db_job.daily_operations_report = [
                                        generate_dummy_dor(date) for date in daterange(actual_start_date, datetime.now().date())
                                    ]

                elif operation_status >= 8:
                    db_job.planning_status = PlanningStatus.RETURNED
                    db_job.date_returned = datetime.now().date()
                    db_job.returned_by_id = user.id
                    db_job.remarks = None

                db.recursive_add(db_job)
                

                db.commit()
