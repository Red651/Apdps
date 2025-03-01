from io import BytesIO

import matplotlib.pyplot as plt 
from app.api.visualize.lib.wellschematicspy import models, schematics

def generate_well_casing(
    names = [],
    top_depths = [],
    bottom_depths = [],
    diameters = [],
):
    wsh = schematics.WellSchema(
        open_holes=[
            models.OpenHole(
                name = '',
                top = 0,
                bottom= 0,
                diameter = 0
            )
        ]
    )
    wsh.casings = [
        models.Casing(
            name=names[i],
            top=top_depths[i],
            bottom=bottom_depths[i],
            diameter = diameters[i]
        ) for i in range(len(names)) 
    ] 
    
    wsh.plot()
    fig = plt.gcf()
    buf = BytesIO()
    fig.savefig(buf, format="png")
    plt.close(fig)

    return buf