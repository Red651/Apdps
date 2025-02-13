from app.api.visualize.lib.well_profile.well import Well
from plotly.subplots import make_subplots
import plotly.graph_objects as go
import json
import pandas as pd
from typing import List

def render_well_profile(well: Well):
    
    df_trajectory = pd.DataFrame(well.trajectory)
    x = df_trajectory['east']
    y = df_trajectory['north']
    z = df_trajectory['md']

    fig = make_subplots(
        rows=2, cols=2,
        row_heights=[0.6, 0.4],
        specs=[
            [{"type": "scene", "rowspan": 2}, {"type": "xy"}],
            [None, {"type": "xy"}]]
    )

    layout_settings = dict(
        showline=True,
        showgrid=False,
        showticklabels=True,
        linecolor='rgb(204, 204, 204)',
        linewidth=2,
        ticks='outside',
        tickfont=dict(
            family='Arial',
            size=12,
            color='rgb(82, 82, 82)',
        )
    )

    fig.add_trace(go.Scatter3d(x=x, y=y, z=z, name="3D View", mode="lines"), row=1, col=1)
    fig.update_layout(
        scene=dict(
            xaxis_title='Easting',
            yaxis_title='Northing',
            zaxis_title='MD',
            aspectmode='manual',
            zaxis_autorange="reversed"
        ),
    )

    fig.add_trace(go.Scatter(x=x, y=y, name="Top View"), row=1, col=2)
    fig.update_xaxes(title_text='Easting', row=1, col=2, **layout_settings)
    fig.update_yaxes(title_text='Northing', row=1, col=2, **layout_settings)

    fig.add_trace(go.Scatter(x=x, y=z, name='East View'), row=2, col=2)
    fig.update_xaxes(title_text='Easting', row=2, col=2, **layout_settings)
    fig.update_yaxes(title_text='MD', row=2, col=2, **layout_settings)

    fig.update_layout(template='simple_white', height=1000, width = 1000)
    fig.update_layout(margin=dict(l=10, r=10, t=10, b=10))
    
    # Show the subplot
    fig_json = fig.to_json(pretty=True)
    fig_data = json.loads(fig_json)
    
    return fig_data

def render_well_comparison(wells: List[Well], names: List[str]):
    
    fig = make_subplots(
        rows=2, cols=2,
        row_heights=[0.6, 0.4],
        specs=[
            [{"type": "scene", "rowspan": 2}, {"type": "xy"}],
            [None, {"type": "xy"}]]
    )
    
    for well, name in zip(wells, names):
    
        df_trajectory = pd.DataFrame(well.trajectory)
        x = df_trajectory['east']
        y = df_trajectory['north']
        z = df_trajectory['md']

        layout_settings = dict(
            showline=True,
            showgrid=False,
            showticklabels=True,
            linecolor='rgb(204, 204, 204)',
            linewidth=2,
            ticks='outside',
            tickfont=dict(
                family='Arial',
                size=12,
                color='rgb(82, 82, 82)',
            )
        )

        fig.add_trace(go.Scatter3d(x=x, y=y, z=z, name=f"{name} 3D View", mode="lines"), row=1, col=1)
        fig.add_trace(go.Scatter(x=x, y=y, name=f"{name} Top View"), row=1, col=2)
        fig.add_trace(go.Scatter(x=x, y=z, name=f'{name} East View'), row=2, col=2)
        
    fig.update_layout(
        scene=dict(
            xaxis_title='Easting',
            yaxis_title='Northing',
            zaxis_title='MD',
            aspectmode='manual',
            zaxis_autorange="reversed"
        ),
    )

    fig.update_xaxes(title_text='Easting', row=1, col=2, **layout_settings)
    fig.update_yaxes(title_text='Northing', row=1, col=2, **layout_settings)
    fig.update_xaxes(title_text='Easting', row=2, col=2, **layout_settings)
    fig.update_yaxes(title_text='MD', row=2, col=2, **layout_settings)
    fig.update_layout(template='simple_white', height=1000, width = 1000)
    fig.update_layout(margin=dict(l=10, r=10, t=10, b=10))
    
    # Show the subplot
    fig_json = fig.to_json(pretty=True)
    fig_data = json.loads(fig_json)
    
    return fig_data