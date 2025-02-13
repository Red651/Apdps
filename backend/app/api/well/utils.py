import pandas as pd

def to_date(value):
    return pd.to_datetime(value).date()

well_headers = {
    "UNIT_TYPE": str,
    "UWI": str,
    "WELL_NAME": str,
    "ALIAS_LONG_NAME": str,
    "WELL_TYPE": str,
    "WELL_PROFILE_TYPE": str,
    "WELL_DIRECTIONAL_TYPE": str,
    "HYDROCARBON_TARGET": str,
    "ENVIRONMENT_TYPE": str,
    "SURFACE_LONGITUDE": float,
    "SURFACE_LATITUDE": float,
    "BOTTOM_HOLE_LONGITUDE": float,
    "BOTTOM_HOLE_LATITUDE": float,
    "MAXIMUM_INCLINATION": float,
    "AZIMUTH": float,
    "LINE_NAME": str,
    "SPUD_DATE": to_date,
    "FINAL_DRILL_DATE": to_date,
    "COMPLETION_DATE": to_date,
    "ROTARY_TABLE_ELEV": float,
    "KB_ELEV": float,
    "DERRICK_FLOOR_ELEV": float,
    "GROUND_ELEV": float,
    "MEAN_SEA_LEVEL": float,
    "DEPTH_DATUM": str,
    "KICK_OFF_POINT": float,
    "MAXIMUM_TVD": float,
    "FINAL_MD": float,
}

existing_well_headers = {
    **well_headers,
    "WELL_STATUS":str,
    "REMARK":str
}