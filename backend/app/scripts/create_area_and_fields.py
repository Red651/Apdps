import uuid
import tqdm
from app.api.spatial.models import Area, Field, AreaPhase, AreaType, AreaPosition, AreaProductionStatus, AreaRegion
from app.api.auth.models import KKKS
import geopandas as gpd
from sqlalchemy.orm import Session

def generate_area_and_fields(db: Session):

    wk = gpd.read_file("app/scripts/geospatial/wilayah_kerja.json")
    field = gpd.read_file("app/scripts/geospatial/lapangan.json")

    kkks = []

    for i, wk_row in tqdm.tqdm(wk.iterrows(), desc=f"Generating Areas and Fields"):
        
        fields_obj = []
        
        filtered_field = field[field['WILAYAH_KE'] == wk_row['WILAYAH_KE']]
        
        for j, field_row in filtered_field.iterrows():
            
            fields_obj.append(
                Field(
                    name = field_row['FIELD_NAME'],
                    geojson = filtered_field.loc[[j]].to_json()
                )
            )
        
        kkks_id = str(uuid.uuid4())
        
        kkks_obj = KKKS(
            id = kkks_id,
            name = f"KKKS{i:03}",
            area = Area(
                area_type="WILAYAH KERJA",
                label=f"WK{i:03}",
                name=f"WK{i:03}",
                phase=AreaPhase.EXPLORATION if wk_row['FASE'] == 'EKSPLORASI' else AreaPhase.DEVELOPMENT,
                type=AreaType.CONVENTIONAL if wk_row['JENIS'] == 'KONVENSIONAL' else AreaType.GMB if wk_row['JENIS'] == "GMB" else AreaType.MNK,
                position = AreaPosition.OFFSHORE if wk_row['LOKASI'] == 'OFF' else AreaPosition.ONSHORE if wk_row['LOKASI'] == 'ONS' else AreaPosition.ONSHORE_AND_OFFSHORE,
                production_status = AreaProductionStatus.PRODUCTION if wk_row['PRODUKSI'] == 'PRODUKSI' else AreaProductionStatus.NONPRODUCTION if wk_row['PRODUKSI'] == 'NON-PRODUKSI' else AreaProductionStatus.DEVELOPMENT if wk_row['PRODUKSI'] == 'PENGEMBANGAN' else AreaProductionStatus.OFF,
                region = AreaRegion.REGION_I if wk_row['NGI_region'] == 'REGION I' else AreaRegion.REGION_II if wk_row['NGI_region'] == 'REGION II' else AreaRegion.REGION_III if wk_row['NGI_region'] == 'REGION III' else AreaRegion.REGION_IV if wk_row['NGI_region'] == 'REGION IV' else AreaRegion.REGION_V if wk_row['NGI_region'] == 'REGION V' else AreaRegion.REGION_VI,
                fields = fields_obj,
                geojson = wk.loc[[i]].to_json()
            )
        )

        kkks.append(kkks_obj)
    
    db.add_all(kkks)
    db.commit()

def generate_dummy_area_and_fields(db: Session):

    wk = gpd.read_file("app/scripts/geospatial/wilayah_kerja.json")
    field = gpd.read_file("app/scripts/geospatial/lapangan.json")

    kkks = []
    
    for i, wk_row in tqdm.tqdm(wk.iterrows(), desc=f"Generating Areas and Fields"):
        
        fields_obj = []
        
        fields = field[field['WILAYAH_KE'] == wk_row['WILAYAH_KE']]
        
        for j, field_row in fields.iterrows():
            
            field_obj = Field(
                name = f"FIELD{i:03}/{j:03}",
                geojson = fields.loc[[j]].to_json()
            )
            
            fields_obj.append(
                field_obj
            )
        
        kkks_id = str(uuid.uuid4())
        
        kkks_obj = KKKS(
            id = kkks_id,
            name = f"KKKS{i:03}",
            area = Area(
                area_type="WILAYAH KERJA",
                label=f"WK{i:03}",
                name=f"WK{i:03}",
                phase=AreaPhase.EXPLORATION if wk_row['FASE'] == 'EKSPLORASI' else AreaPhase.DEVELOPMENT,
                type=AreaType.CONVENTIONAL if wk_row['JENIS'] == 'KONVENSIONAL' else AreaType.GMB if wk_row['JENIS'] == "GMB" else AreaType.MNK,
                position = AreaPosition.OFFSHORE if wk_row['LOKASI'] == 'OFF' else AreaPosition.ONSHORE if wk_row['LOKASI'] == 'ONS' else AreaPosition.ONSHORE_AND_OFFSHORE,
                production_status = AreaProductionStatus.PRODUCTION if wk_row['PRODUKSI'] == 'PRODUKSI' else AreaProductionStatus.NONPRODUCTION if wk_row['PRODUKSI'] == 'NON-PRODUKSI' else AreaProductionStatus.DEVELOPMENT if wk_row['PRODUKSI'] == 'PENGEMBANGAN' else AreaProductionStatus.OFF,
                region = AreaRegion.REGION_I if wk_row['NGI_region'] == 'REGION I' else AreaRegion.REGION_II if wk_row['NGI_region'] == 'REGION II' else AreaRegion.REGION_III if wk_row['NGI_region'] == 'REGION III' else AreaRegion.REGION_IV if wk_row['NGI_region'] == 'REGION IV' else AreaRegion.REGION_V if wk_row['NGI_region'] == 'REGION V' else AreaRegion.REGION_VI,
                fields = fields_obj,
                geojson = wk.loc[[0]].to_json()
            )
        )
        
        
        kkks.append(kkks_obj)
    
    db.add_all(kkks)
    db.commit()
