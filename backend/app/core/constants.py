from enum import Enum as PyEnum
import numpy as np

well_level_type = ['WELL', 'WELL ORIGIN', 'WELLBORE', 'WELLBORE SEGMENT', 'WELLBORE COMPLETION', 'WELLBORE CONTACT INTERVAL']

well_class = ['DELINEATION', 'WILDCAT', 'INJECTION', 'PRODUCER', 'INFILL', 'STEPOUT']

well_profile_type = ['HORIZONTAL', 'VERTICAL', 'DIRECTIONAL','J-TYPE', 'S-TYPE']

environment_type = ['MARINE', 'LAND', 'SWAMP']

subsea_elev_ref_type = ["KELLY BUSHING", "DRILLER FLOOR", "ROTARY TABLE"]

ground_elev_type = ["KELLY BUSHING", "GROUND", "SEA LEVEL"]

elev_ref_datum = ["MSL", "LAT"]

water_depth_datum = ["MEAN SEA LEVEL"]

well_status = ["ACTIVE", "SUSPENDED", "ABANDONED", "TPA", "PA"]

hydrocarbon_target = ["OIL", "GAS"]

class UnitType(PyEnum):
    METRICS = 'METRICS'
    IMPERIAL = 'IMPERIAL'

uom = {
    UnitType.METRICS: {
        'Dimensionless': 'frac',
        "Diameter": "mm",
        'Velocity': 'm/s',
        'Time': 's',
        'Length': 'm',
        'Area': 'm²',
        'Volume': 'm³',
        'Weight': 'kg',
        'Amount of chemical substance': 'mol',
        'Molar mass': 'kg/mol',
        'Pipe Diameter': 'm',
        'Temperature': '°C',
        'Pressure': 'kPa',
        'Volumetric flow rate (oil & water)': 'cmd',
        'Volumetric flow rate (gas)': 'cmd',
        'GOR': 'm³/m³',
        'Density (liquids)': 'kg/m³',
        'Density (gases)': 'kg/m³',
        'Specific gravity': '1',
        'Compressibility': 'Pa⁻¹',
        'Permeability': 'm²',
        'Porosity': 'frac',
        'Dynamic Viscosity': 'Pa·s',
        'Productivity': 'm³/(Pa·s)',
        'Transmissibility': 'm³/(Pa·s)',
        'Pressure diffusivity': 'm²/s',
        'Wellbore storage': 'm³/Pa',
        'Thermal conductivity': 'W/(m·K)',
        'Specific heat capacity': 'J/(kg·K)',
        'Thermal diffusivity': 'm²/s'
    },
    UnitType.IMPERIAL: {
        'Dimensionless': 'frac',
        "Diameter": "in",
        'Velocity': 'ft/s',
        'Time': 'hr',
        'Length': 'ft',
        'Area': 'ft²',
        'Volume': 'bbl',
        'Weight': 'lb',
        'Amount of chemical substance': 'mol',
        'Molar mass': 'lb/mol',
        'Pipe Diameter': 'in',
        'Temperature': '°F',
        'Pressure': 'psi',
        'Volumetric flow rate (oil & water)': 'bpd',
        'Volumetric flow rate (gas)': 'scf/d',
        'GOR': 'scf/bbl',
        'Density (liquids)': 'lb/ft³',
        'Density (gases)': 'lb/ft³',
        'Specific gravity': '1',
        'Compressibility': 'psi⁻¹',
        'Permeability': 'md',
        'Porosity': 'frac',
        'Dynamic Viscosity': 'cp',
        'Productivity': 'bbl/(psi·d)',
        'Transmissibility': 'bbl/(psi·d)',
        'Pressure diffusivity': 'ft²/s',
        'Wellbore storage': 'bbl/psi',
        'Thermal conductivity': 'BTU/(hr·ft·°F)',
        'Specific heat capacity': 'BTU/(lb·°F)',
        'Thermal diffusivity': 'ft²/s'
    }
}

uoms = np.unique([
    "°C", "°F", "m", "ft", "mm", "in", "unitless", "kg", "lb", "cP", "m³", "bbl", 
    "kg/m³", "lb/gal", "lb/ft³", "rpm", "N·m", "ft-lb", "N", "Pa", "psi", "mm⁴", "%", 
    "m/hr", "L/min", "bbl/min", "kg/m", "lb/ft", "kPa/m", "psi/ft", "kW", "hp", "L/day", 
    "bbl/day", "m³/day", "mcf/day", "$ (USD)", "$/day", "kg/m³", "ppg", "Pa·s", "lb·s/ft²", 
    "dimensionless", "API units", "m³/m³", "ft³/bbl", "mD", "1/Pa", "W", "BTU/h", "mol%", 
    "m³/(Pa·s)", "bbl/(psi·day)", "N/m", "dyn/cm", "mD·ft", "times/year", "seconds", 
    "tests/year", "N·lbf", "years", "kg/BOE", "lb/BOE", 'm/s', 'inch', 'm3', 'ft3'
])