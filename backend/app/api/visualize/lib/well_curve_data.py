import matplotlib.pyplot as plt
import random
import lasio
from io import BytesIO
from app.api.utils.models import FileRecord
import pandas as pd

depth_column_names = ["DEPT", "Depth", "DEPTH", "depth", "dept", "Dept", ""]

def generate_log(file: FileRecord):
    
    if file.file_extension == '.las':
        log = lasio.read(file.file_location)
        df = log.df()
        n_curves = len(log.curves)-1
        curve_names = [curve.mnemonic for curve in log.curves[1:]]
        depth = df.index
    else:
        if file.file_extension == '.csv':
            df = pd.read_csv(file.file_location)

        if file.file_extension == '.xlsx':
            df = pd.read_excel(file.file_location)
            
        depth_col = next((col for col in df.columns if 'dept' in col.lower()), None)
        if depth_col is None:
            depth_col = next((col for col in df.columns if 'md' in col.lower()), None)
        if depth_col is None:
            depth_col = next((col for col in df.columns if 'tvd' in col.lower()), None)
        
        depth = df[depth_col]
        df_other = df.drop(columns=[depth_col])
        n_curves = len(df_other.columns)
        curve_names = df_other.columns
        
    fig, axes = plt.subplots(nrows=1, ncols=n_curves, figsize=(10+(n_curves*2), 20))
    for i, curve in enumerate(curve_names):
        ax = axes[i]
        ax.plot(df[curve], depth, color="#{:06x}".format(random.randint(0, 0xFFFFFF)))
        ax.set_xlabel(curve)
        ax.grid()
        ax.invert_yaxis()

    axes[0].set_ylabel("Depth")
    plt.tight_layout()
    buf = BytesIO()
    fig.savefig(buf, format="png")
    plt.close(fig)

    return buf

def generate_ppfg(file: FileRecord):
    
    if file.file_extension == '.csv':
        df = pd.read_csv(file.file_location)

    if file.file_extension == '.xlsx':
        df = pd.read_excel(file.file_location)
    
    fig, ax = plt.subplots(figsize=(8, 20))
    ax.plot(df['OVERBURDEN_PRESSURE'], df['DEPTH'], label='Overburden/Lithostratigraphic Pressure', color="green", linewidth=1.5)
    ax.plot(df['HYDROSTATIC_PRESSURE'], df['DEPTH'], label='Hydrostatic Pressure', linestyle='dashed', color="blue", linewidth=1.5)
    ax.plot(df['PORE_PRESSURE'], df['DEPTH'], label='Pore Pressure', color="red", linewidth=1.5)
    ax.plot(df['MIN_FRACTURE_PRESSURE'], df['DEPTH'], label='Minimum Fracture Pressure', color="orange", linewidth=1.5)
    ax.plot(df['MAX_FRACTURE_PRESSURE'], df['DEPTH'], label='Maximum Fracture Pressure', color="purple", linewidth=1.5)

    # Add labels, legend, and grid
    ax.set_xlabel("Pressure")
    ax.set_ylabel("Depth")
    ax.legend(loc="upper right")
    ax.grid(which="both", linestyle='--', linewidth=0.5, alpha=0.7)
    ax.minorticks_on()
    ax.tick_params(which="minor", bottom=False, left=False)
    # Invert y-axis to have depth increase downwards
    ax.invert_yaxis()

    # Adjust layout to prevent overlapping labels
    plt.tight_layout()
    buf = BytesIO()
    fig.savefig(buf, format="png")
    plt.close(fig)

    return buf