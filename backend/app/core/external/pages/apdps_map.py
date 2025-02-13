from ast import Dict
import dash_mantine_components as dmc
import dash_leaflet as dl
from dash import callback, register_page
from dash.dependencies import Input, Output, State
from dash.exceptions import PreventUpdate
from dash_iconify import DashIconify
import os
from typing import Literal
import geopandas as gpd
import random
from dash_extensions.javascript import assign
from uuid import UUID

register_page(__name__, path='/map', name='ApDPS Map')

from app.api.spatial.crud import create_seperated_geojson_view_kkks
from app.api.auth.crud import get_kkks
from app.core.database import sessionmanager

def folder_file_list_without_extension(directory):
    filenames_without_extension = []
    for filename in os.listdir(f'app/core/external/data/{directory}'):
        base_name, _ = os.path.splitext(filename)
        filenames_without_extension.append(base_name)
    return filenames_without_extension

def read_map_batch(type: Literal['cekungan', 'tata_guna_lahan'], names: list[str]) -> dl.GeoJSON:
    
    gdf = gpd.read_file(f'app/core/external/data/{type}/{names[0]}.json')
    gdf["color_value"] = "#"+''.join([random.choice('0123456789ABCDEF') for j in range(6)])
    
    if len(names) > 1:
        
        for name in names[1:]:
            
            temp_gdf = gpd.read_file(f'app/core/external/data/{type}/{name}.json')
            temp_gdf["color_value"] = "#"+''.join([random.choice('0123456789ABCDEF') for j in range(6)])

            gdf = gdf._append(temp_gdf)
        
    return dl.GeoJSON(data=gdf.to_geo_dict())

def read_geojson(name: str, color: str):
    
    return dl.GeoJSON(data=gpd.read_file(f'app/core/external/data/{name}.json').to_geo_dict(), style={'color':color})

def read_kkks_to_dl_geojson(kkks_id: str) -> Dict:
    
    with sessionmanager.sync_session() as db:
        result = create_seperated_geojson_view_kkks(db, kkks_id)
        
        area_gdf = gpd.GeoDataFrame().from_features(result['area'])
        fields_gdf = gpd.GeoDataFrame().from_features(result['fields'])
        if result['jobs'] is not None:
            jobs_gdf = gpd.GeoDataFrame().from_features(result['jobs'])
        else:
            jobs_gdf = None

        bounds = area_gdf.total_bounds
        x = (bounds[0] + bounds[2]) / 2
        y = (bounds[1] + bounds[3]) / 2

        output = {
            'area': dl.GeoJSON(data=area_gdf.to_geo_dict(), onEachFeature=on_each_feature_area, style={'color':'#0596b3'}),
            'fields': dl.GeoJSON(data=fields_gdf.to_geo_dict(), onEachFeature=on_each_feature_field,style={'color':'#00b0e3'}),
            'jobs': dl.GeoJSON(data=jobs_gdf.to_geo_dict()) if jobs_gdf is not None else None,
            'center': {'x': x, 'y': y}
        }
    
    return output

on_each_feature_area = {'variable': 'dashExtensions.default.function1'}

on_each_feature_field = {'variable': 'dashExtensions.default.function2'}

map = dl.Map(
    center=[-2.600029, 118.015776], 
    attributionControl=False,
    zoom=5, 
    children=[
        dl.TileLayer(
            # url='http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
            maxZoom=20,
            # subdomains=['mt0','mt1','mt2','mt3']
        ),
        dl.ScaleControl(
            position="bottomleft"
        ),
        dl.LayerGroup(
            id='layers-geojson'
        ),
        dl.GeoJSON(
            data=gpd.read_file(f'app/core/external/data/wilayah_kerja.json').to_geo_dict(), onEachFeature=on_each_feature_area, style={'color': '#54d6f0'}
        ),
        dl.LayerGroup(
            id='kkks-layer'
        ),
    ], 
    style={'height': '100vh','width':'100vw'}, 
    id="map"
)


layers = dmc.Stack(
    [
        dmc.MultiSelect(
            id='tata-guna-lahan',
            label='Tata Guna Lahan',
            placeholder='Pilih Provinsi',
            searchable=True,
            clearable=True,
            comboboxProps={"zIndex": 1200},
            w='100%',
            data=folder_file_list_without_extension('tata_guna_lahan'),
        ),
        dmc.MultiSelect(
            id='cekungan',
            label='Cekungan',
            placeholder='Pilih Cekungan',
            searchable=True,
            clearable=True,
            comboboxProps={"zIndex": 1200},
            w='100%',
            data=folder_file_list_without_extension('cekungan'),
        ),
        dmc.Checkbox(
            label='Batas Landas Kontinen',
            checked=False,
            description=dmc.ColorInput(id='color-batas-landas-kontinen',popoverProps={'zIndex': 1200}, value='#FF0000'),
            id='checkbox-batas-landas-kontinen',
        ),
        dmc.Checkbox(
            label='Batas Laut Teritorial',
            checked=False,
            description=dmc.ColorInput(id='color-batas-laut-teritorial',popoverProps={'zIndex': 1200}, value='#FFFF00'),
            id='checkbox-batas-laut-teritorial',
        ),
        dmc.Checkbox(
            label='Batas Laut',
            checked=False,
            description=dmc.ColorInput(id='color-batas-laut',popoverProps={'zIndex': 1200}, value='#FFFF00'),
            id='checkbox-batas-laut',
        ),
        dmc.Checkbox(
            label='Zona Ekonomi Ekslusif',
            checked=False,
            description=dmc.ColorInput(id='color-zona-ekonomi-ekslusif',popoverProps={'zIndex': 1200}, value='#0000FF'),
            id='checkbox-zona-ekonomi-ekslusif',
        ),
    ]
)

modal_choose_layers = dmc.Modal(
    [
        dmc.Stack(
            [
                layers
            ],
            m='md'
        ),
        dmc.Flex(
            dmc.Button(
                'Apply',
                color='blue',
                radius='xl',
                n_clicks=0,
                size='md',
                id='apply-layers'
            ),
            justify='end'
        )
    ],
    opened=False,
    zIndex=1100,
    id='modal-choose-layers',
    title=dmc.Group(
        [
            DashIconify(icon='ph:stack-light', width=25),
            dmc.Title('Create Scene',size='xl',fw=600),
        ],
        gap='sm'
    ),
    size='xl'
)

button_show_modal_choose_layers = dmc.ActionIcon(
    DashIconify(icon='ph:stack-light', width=20),
    id='button-show-modal-choose-layers',
    variant='default',
    size=40,
    radius='xl',
    n_clicks=0
)

layout = dmc.Group(
    [
        map,
        dmc.Affix(
            dmc.Center(
                dmc.Select(
                    placeholder='Pilih KKKS',
                    searchable=True,
                    clearable=True,
                    comboboxProps={"zIndex": 1200},
                    w='100%',
                    id='kkks',
                )
            ),
            position={'top':20, 'right':'30vw'},
            zIndex=1000,
            style={'width':'40vw'}
        ),
        dmc.Affix(
            dmc.Stack(
                [
                    # credit,
                    modal_choose_layers,
                    dmc.Flex(
                        button_show_modal_choose_layers,
                        justify='end'
                    )
                ],
            ),
            position={'top':20,'right':20},
            zIndex=1000,
            style={'max-height':'90vh'}
        ),
    ],
    gap=0
)


@callback(
    Output('kkks', 'data'),
    Input('kkks', 'data'),
)
def populate_kkks(data):
    
    with sessionmanager.sync_session() as db:
        kkks = get_kkks(db)
        kkks_list = [{'label':kkks.name, 'value':str(kkks.value)} for kkks in kkks]
    
    if data is None:
        return kkks_list
    else:
        raise PreventUpdate
    
@callback(
    Output('kkks-layer', 'children'),
    Output('map', 'viewport'),
    Input('kkks', 'value'),
)
def show_kkks(kkks):
    
    if kkks:
        output_dict = read_kkks_to_dl_geojson(kkks)
        output = [output_dict['area'], output_dict['fields'], output_dict['jobs']]
        viewport = dict(center=[output_dict['center']['y'], output_dict['center']['x']], zoom=10, transition="flyTo")
        return output, viewport
    else:
        raise PreventUpdate

# @callback(
#     Output({'type':'geojson','layer':MATCH}, 'data'),
#     Output({'type':'geojson','layer':MATCH}, 'style'),
#     Input({'type':'checkbox','layer':MATCH}, 'checked'),
#     State({'type':'color-picker','layer':MATCH}, 'value'),
#     State({'type':'color-picker','layer':MATCH}, 'id'),
#     prevent_initial_call=True
# )
# def render_geojson(checked, color, id):
#     if checked:
#         layer = id['layer']
#         return read_geojson(layer), {'color':color}
#     else:
#         return None, None

# @callback(
#     Output({'type':'geojson-group','group':MATCH}, 'data'),
#     Input({'type':'checkbox-group','group':MATCH}, 'value'),
#     State({'type':'checkbox-group','group':MATCH}, 'id'),
#     prevent_initial_call=True
# )
# def render_layer_group(value, id):
#     if value:
#         layer = id['group']
#         return read_map_batch(layer, value)
#     else:
#         return None

@callback(
    Output('layers-geojson', 'children'),
    Output('modal-choose-layers', 'opened', allow_duplicate=True),
    Input('apply-layers', 'n_clicks'),
    State('tata-guna-lahan', 'value'),
    State('cekungan', 'value'),
    State('checkbox-batas-landas-kontinen', 'checked'),
    State('checkbox-batas-laut', 'checked'),
    State('checkbox-batas-laut-teritorial', 'checked'),
    State('checkbox-zona-ekonomi-ekslusif', 'checked'),
    State('color-batas-landas-kontinen', 'value'),
    State('color-batas-laut', 'value'),
    State('color-batas-laut-teritorial', 'value'),
    State('color-zona-ekonomi-ekslusif', 'value'),
    prevent_initial_call=True
)
def render_layers(
    n_clicks, 
    provinsi, 
    cekungan, 
    batas_landas_kontinen, 
    batas_laut, 
    batas_laut_teritorial, 
    zona_ekonomi_ekslusif, 
    color_batas_landas_kontinen, 
    color_batas_laut, 
    color_batas_laut_teritorial, 
    color_zona_ekonomi_eksklusif
):
    if n_clicks > 0:
        
        output = []
        
        if provinsi:
            output.append(read_map_batch('tata_guna_lahan', provinsi))
            
        if cekungan:
            output.append(read_map_batch('cekungan', cekungan))
        
        if batas_landas_kontinen:
            output.append(read_geojson('batas_landas_kontinen', color_batas_landas_kontinen))
        
        if batas_laut:
            output.append(read_geojson('batas_laut', color_batas_laut))
        
        if batas_laut_teritorial:
            output.append(read_geojson('batas_laut_teritorial', color_batas_laut_teritorial))
            
        if zona_ekonomi_ekslusif:
            output.append(read_geojson('zona_ekonomi_ekslusif', color_zona_ekonomi_eksklusif))
            
        return output, False

        
        
        
# @callback(
#     Output({'type':'geojson','layer':MATCH}, 'style'),
#     Input({'type':'color-picker','layer':MATCH}, 'value'),
#     prevent_initial_call=True
# )
# def render_color(value):
#     return {'color': value}
    

@callback(
    Output('modal-choose-layers', 'opened'),
    Input('button-show-modal-choose-layers', 'n_clicks'),
    prevent_initial_call=True
)
def show_modal_choose_layers(n_clicks):
    if n_clicks > 0:
        return True
    else:
        raise PreventUpdate
    
    # if n_clicks > 0:
    #     return True
    # else:
    #     raise PreventUpdate

# @callback(
#     Output('layers-control-container', 'children'),
#     Output('modal-choose-layers', 'opened', allow_duplicate=True),
#     Output('map', 'viewport'),
#     # Output('layers-container', 'children'),
#     Input('button-apply-modal-choose-layers', 'n_clicks'),
#     # State('wilayah-kerja', 'value'),
#     # State('lapangan', 'value'),
#     # State('cekungan', 'value'),
#     State('kkks', 'value'),
#     State('checkbox-batas-landas-kontinen', 'checked'),
#     State('checkbox-batas-laut', 'checked'),
#     State('checkbox-zona-ekonomi-ekslusif', 'checked'),
#     State('color-batas-landas-kontinen', 'value'),
#     State('color-batas-laut', 'value'),
#     State('color-zona-ekonomi-ekslusif', 'value'),
#     prevent_initial_call=True
# )
# def apply_modal_choose_layers(
#     n_clicks, 
#     kkks,
#     batas_landas_kontinen, 
#     batas_laut, 
#     zona_ekonomi_ekslusif,
#     color_batas_landas_kontinen,
#     color_batas_laut,
#     color_zona_ekonomi_eksklusif
#     ):
#     if n_clicks > 0:
        
#         output = []
#         layer_checkbox_labels = []
#         layer_checkbox_id = []
#         viewport = no_update
#         # layer_desc = []
        
#         # if wilayah_kerja:
#         #     output.append(read_map_batch_to_dl_geojson('wilayah_kerja', wilayah_kerja))
#         #     layer_checkbox_labels.append(f'Wilayah Kerja')
#         #     layer_checkbox_id.append('wilayah_kerja')
#         #     # layer_desc.append(
#         #     #     dmc.List(
#         #     #         [
#         #     #             dmc.ListItem(item) for item in wilayah_kerja
#         #     #         ] 
#         #     #     )
#         #     # )
        
#         # if lapangan:
#         #     output.append(read_map_batch_to_dl_geojson('lapangan', lapangan))
#         #     layer_checkbox_labels.append(f'Lapangan')
#         #     layer_checkbox_id.append('lapangan')
#         #     # layer_desc.append(
#         #     #     dmc.List(
#         #     #         [
#         #     #             dmc.ListItem(item) for item in lapangan
#         #     #         ]
#         #     #     ) 
#         #     # )
        
#         # if cekungan:
#         #     output.append(read_map_batch_to_dl_geojson('cekungan', cekungan))
#         #     layer_checkbox_labels.append(f'Cekungan')
#         #     layer_checkbox_id.append('cekungan')
#         #     # layer_desc.append(
#         #     #     dmc.List(
#         #     #         [
#         #     #             dmc.ListItem(item) for item in cekungan
#         #     #         ]
#         #     #     ) 
#         #     # )
        
#         if kkks:
#             output_dict = read_kkks_to_dl_geojson(kkks)
#             output.append(output_dict['dl'])
#             layer_checkbox_labels.append('KKKS')
#             layer_checkbox_id.append('kkks')
#             viewport = dict(center=[output_dict['center']['y'], output_dict['center']['x']], zoom=10, transition="flyTo")
            
            
#         if batas_landas_kontinen:
#             output.append(read_geojson_to_dl_geojson('batas_landas_kontinen', color_batas_landas_kontinen))
#             layer_checkbox_labels.append('Batas Landas Kontinen')
#             layer_checkbox_id.append('batas_landas_kontinen')
#             # layer_desc.append(None)
        
#         if batas_laut:
#             output.append(read_geojson_to_dl_geojson('batas_laut', color_batas_laut))
#             layer_checkbox_labels.append('Batas Laut')
#             layer_checkbox_id.append('batas_laut')
#             # layer_desc.append(None)
        
#         if zona_ekonomi_ekslusif:
#             output.append(read_geojson_to_dl_geojson('zona_ekonomi_ekslusif', color_zona_ekonomi_eksklusif))
#             layer_checkbox_labels.append('Zona Ekonomi Ekslusif')
#             layer_checkbox_id.append('zona_ekonomi_ekslusif')
#             # layer_desc.append(None)
        
#         # layer_checkbox_output = dmc.CheckboxGroup(
#         #     [
#         #         dmc.Checkbox(
#         #             label=layer,
#         #             value=id,
#         #             description=desc
#         #         ) for layer, id, desc in zip(layer_checkbox_labels, layer_checkbox_id, layer_desc)
#         #     ],
#         #     id='layers-checkbox-group',
#         #     value=layer_checkbox_id
#         # )
        
#         # final_output = dl.LayersControl(
#         #     [
#         #         dl.Overlay(layer, name=name, checked=True) for layer,name in zip(output, layer_checkbox_labels)
#         #     ],
#         #     position='bottomright',
#         # )
        

#         return output, False, viewport

    
#     else:
        
#         raise PreventUpdate