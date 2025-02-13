from dash_pydantic_form import ModelForm, fields
from pydantic import BaseModel, Field, ValidationError
from typing import List, Optional, Union, Literal
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler
import plotly.express as px
import plotly.graph_objects as go
from typing import List, Dict
from dash import Input, Output, callback, html, State, dcc, MATCH, ALL, no_update
from dash.exceptions import PreventUpdate
import dash_mantine_components as dmc
from app.core.external.pages.sections.regression.utils import parse_validation_errors, create_table_description, session_get_file_path, session_df_to_file, continue_button, reset_button, session_dict_to_json, session_schema_create, session_schema_save
import pandas.api.types as ptypes
from sklearn.preprocessing import LabelEncoder, OrdinalEncoder
import category_encoders as ce

class DataPreprocessingSchema(BaseModel):
    missing_value_handling: Literal["remove", "fill_mean", "fill_median", "fill_mode", "custom"] = Field(
        "remove", 
        description="Method for handling missing values"
    )
    custom_value: Optional[float] = Field(
        0, 
        description="Custom value for filling missing data, used if missing_value_handling is 'custom'"
    )
    scaling_method: Optional[Literal["standard", "minmax", "robust"]] = Field(
        "standard", 
        description="Scaling method to be applied to numerical features"
    )
    outlier_handling: Optional[Literal["remove", "cap", "none"]] = Field(
        "remove", 
        description="Method for handling outliers"
    )
    cap_value: Optional[float] = Field(
        0, 
        description="Value to cap outliers, used if outlier_handling is 'cap'"
    )

class LabeledDataProcessing(BaseModel):
    missing_value_handling: Literal["remove", "custom"] = Field(
        "remove", 
        description="Method for handling missing values"
    )
    custom_value: Optional[float] = Field(
        0, 
        description="Custom value for filling missing data, used if missing_value_handling is 'custom'"
    )
    encoding_method: Literal["label"] = Field("label", description="Encoding method for categorical features.")

def preprocess_and_visualize_series(series: pd.Series, schema: DataPreprocessingSchema):
    
    visualizations = {
        'before':{},
        'after':{}
    }

    # Initial Data Distribution
    fig_hist = px.histogram(series, x=series.name, title=f"Distribution of {series.name} Before Preprocessing", template='simple_white')
    fig_hist.update_layout(margin=dict(l=20, r=20, t=50, b=20))
    fig_box = px.box(series, y=series.name, title=f"Box Plot of {series.name} Before Preprocessing", template='simple_white')
    fig_box.update_layout(margin=dict(l=20, r=20, t=50, b=20))

    visualizations['before'] = {'histogram': fig_hist, 'box': fig_box}

    
    # Handling missing values
    if schema.missing_value_handling == "remove":
        series = series.dropna()
    elif schema.missing_value_handling == "fill_mean":
        series = series.fillna(series.mean())
    elif schema.missing_value_handling == "fill_median":
        series = series.fillna(series.median())
    elif schema.missing_value_handling == "fill_mode":
        series = series.fillna(series.mode()[0])
    elif schema.missing_value_handling == "custom" and schema.custom_value is not None:
        series = series.fillna(schema.custom_value)

    # Handling outliers
    if schema.outlier_handling == "remove":
        mean = series.mean()
        std = series.std()
        series = series[(np.abs(series - mean) <= (3 * std))]
    elif schema.outlier_handling == "cap" and schema.cap_value is not None:
        series = pd.Series(np.where(series > schema.cap_value, schema.cap_value, series.values), name=series.name)

    # Scaling numerical feature
    if schema.scaling_method:
        scaler = None
        if schema.scaling_method == "standard":
            scaler = StandardScaler()
        elif schema.scaling_method == "minmax":
            scaler = MinMaxScaler()
        elif schema.scaling_method == "robust":
            scaler = RobustScaler()
        
        series = pd.Series(scaler.fit_transform(series.values.reshape(-1, 1)).flatten(), name=series.name)

        # Visualize scaled data
        fig_hist_scaled = px.histogram(series, x=series.name, title=f"Distribution of {series.name} After Scaling ({schema.scaling_method})", template='simple_white')
        fig_hist_scaled.update_layout(margin=dict(l=20, r=20, t=50, b=20))
        fig_box_scaled = px.box(series, y=series.name, title=f"Box Plot of {series.name} After Scaling ({schema.scaling_method})", template='simple_white')
        fig_box_scaled.update_layout(margin=dict(l=20, r=20, t=50, b=20))

        visualizations['after'] = {'histogram': fig_hist_scaled, 'box': fig_box_scaled}

    return visualizations
    
def preprocess_label_and_visualize_series(series: pd.Series, schema: LabeledDataProcessing):
    
    if schema.missing_value_handling == "remove":
        series = series.dropna()
    elif schema.missing_value_handling == "custom" and schema.custom_value is not None:
        series = series.fillna(schema.custom_value)
    
    if schema['encoding_method'] == "label":
        le = LabelEncoder()
        encoded_series = pd.Series(le.fit_transform(series), index=series.index, name=series.name)
        

    # elif schema['encoding_method'] == "hash":
    #     hash_encoder = ce.HashingEncoder(cols=[series.name], n_components=10)
    #     temp_df = pd.DataFrame({series.name: series})
    #     hash_encoded = hash_encoder.fit_transform(temp_df)
    #     encoded_series = hash_encoded.sum(axis=1)  # Optional: Summarize encoded values as a single series (depends on use-case)
    
    series = encoded_series
    
    fig_bar = px.bar(series.value_counts().reset_index(), 
            x=series.name, y='count', 
            labels={ 'count': 'Count'}, 
            title='Frequency of Categories')
    fig_bar.update_layout(template='plotly_white')
    fig_pie = px.pie(series.value_counts().reset_index(), 
                names=series.name, values='count', 
                labels={ 'count': 'Count'}, 
                title='Proportion of Categories')
    
    return [fig_bar, fig_pie]
    
def preprocess_all_and_visualize(df: pd.DataFrame, column_schemas, preprocessed_file_name='preprocessed'):

    dict_schema = session_schema_create()
    if len(df.select_dtypes(include=[np.number]).columns) != 0:
        numeric_cols = df.select_dtypes(include=[np.number]).columns
    # Apply preprocessing to each column according to the schema provided
    for column, schema in column_schemas.items():
        if ptypes.is_numeric_dtype(df[column]):
            if schema['missing_value_handling'] == "remove":
                df = df.dropna(subset=[column])
            elif schema['missing_value_handling'] == "fill_mean":
                fill_value = df[column].mean()
                df[column] = df[column].fillna(fill_value)
            elif schema['missing_value_handling'] == "fill_median":
                fill_value = df[column].median()
                df[column] = df[column].fillna(fill_value)
            elif schema['missing_value_handling'] == "fill_mode":
                fill_value = df[column].mode()[0]
                df[column] = df[column].fillna(fill_value)
            elif schema['missing_value_handling'] == "custom" and schema.get('custom_value') is not None:
                fill_value = schema['custom_value']
                df[column] = df[column].fillna(fill_value)

            if schema['outlier_handling'] == "remove":
                mean = df[column].mean()
                std = df[column].std()
                df = df[(np.abs(df[column] - mean) <= (3 * std))]
            elif schema['outlier_handling'] == "cap" and schema.get('cap_value') is not None:
                df[column] = np.where(df[column] > schema['cap_value'], schema['cap_value'], df[column])


            if schema.get('scaling_method', None):
                scaler = None
                if schema['scaling_method'] == "standard":
                    scaler = StandardScaler()
                elif schema['scaling_method'] == "minmax":
                    scaler = MinMaxScaler()
                elif schema['scaling_method'] == "robust":
                    scaler = RobustScaler()
                
            scaler.fit(df[column].values.reshape(-1, 1))
            df[column] = scaler.transform(df[column].values.reshape(-1, 1)).flatten()
            
            dict_schema['type'].append('number')
            dict_schema['missing_value'].append(schema['missing_value_handling'])
            dict_schema['fill'].append(fill_value if schema['missing_value_handling'] != 'remove' else 0)
            dict_schema['outlier_handling'].append(schema['outlier_handling'])
            dict_schema['outlier_mean'].append(df[column].mean() if schema['outlier_handling'] == 'remove' else 0)
            dict_schema['outlier_std'].append(df[column].std() if schema['outlier_handling'] == 'remove' else 0)
            dict_schema['outlier_cap'].append(schema['cap_value'] if schema['outlier_handling'] == 'cap' else 0)
            dict_schema['label_enc'].append(0)
            dict_schema['scaler'].append(scaler)
            
            
        else:
            df = df.dropna(subset=[column])

            if schema['encoding_method'] == "label":
                le = LabelEncoder()
                df[column] = le.fit_transform(df[column])

            dict_schema['type'].append('string')
            dict_schema['missing_value'].append('most')
            dict_schema['fill'].append(0)
            dict_schema['outlier_handling'].append(0)
            dict_schema['outlier_mean'].append(0)
            dict_schema['outlier_std'].append(0)
            dict_schema['outlier_cap'].append(0)
            dict_schema['label_enc'].append(le)
            dict_schema['scaler'].append(0)
        
        


        dict_schema['column'].append(column)
    session_schema_save(dict_schema)
    # Generate scatter plot matrix for numeric columns
    scatter_fig = None
    if len(numeric_cols) > 1:
        df_2 = df.copy()
        num_cols_copy = list(numeric_cols.copy())
        num_cols_copy = [col.replace(' ', '<br>').replace('_', '<br>') for col in numeric_cols]
        df_2.columns = [col if col not in numeric_cols else num_cols_copy.pop(0) for col in df_2.columns]
        numeric_cols = df_2.columns
        scatter_fig = px.scatter_matrix(df_2, dimensions=numeric_cols, title="Scatter Matrix After Preprocessing", template='simple_white')
        scatter_fig.update_layout(margin=dict(l=20, r=20, t=50, b=20))
    else:
        scatter_fig = 0
    session_df_to_file(df, preprocessed_file_name)

    fontsize = int(20/len(numeric_cols))+12
    scatter_fig.update_layout(
        font_size=fontsize,
    )

    # Return the processed table description and scatter plot
    return create_table_description(df), scatter_fig

def create_form(column):

    form = dmc.Stack(
        [
            dmc.Select(
                id={'class':'regression', 'type':"missing_value_handling", 'column': column},
                label="Missing Value Handling",
                description="Method for handling missing values",
                data=[
                    {"label": "Remove", "value": "remove"},
                    {"label": "Fill mean", "value": "fill_mean"},
                    {"label": "Fill median", "value": "fill_median"},
                    {"label": "Fill mode", "value": "fill_mode"},
                    {"label": "Custom", "value": "custom"},
                ],
                value="fill_mean",
                required=True,
            ),
            dmc.NumberInput(
                id={'class':'regression', 'type':"custom_value", 'column': column},
                label="Custom Value",
                description="Custom value for filling missing data, used if missing_value_handling is 'custom'",
                value=0,
                required=False,
                display="none",
            ),
            dmc.Select(
                id={'class':'regression', 'type':"scaling_method", 'column': column},
                label="Scaling Method",
                description="Scaling method to be applied to numerical features",
                data=[
                    {"label": "Standard", "value": "standard"},
                    {"label": "MinMax", "value": "minmax"},
                    {"label": "Robust", "value": "robust"},
                ],
                value="standard",
                required=True,
            ),
            dmc.Select(
                id={'class':'regression', 'type':"outlier_handling", 'column': column},
                label="Outlier Handling",
                description="Method for handling outliers",
                data=[
                    {"label": "Remove", "value": "remove"},
                    {"label": "Cap", "value": "cap"},
                    {"label": "None", "value": "none"},
                ],
                value="none",
                required=True,
            ),
            dmc.NumberInput(
                id={'class':'regression', 'type':"cap_value", 'column': column},
                label="Cap Value",
                description="Value to cap outliers, used if outlier_handling is 'cap'",
                value=0,
                required=False,
                display="none",
            ),
        ]
    )
    
    
    
    # ModelForm(
    #     DataPreprocessingSchema,
    #     "data_preprocessing",
    #     column,
    #     fields_repr={
    #         "missing_value_handling": fields.Select(
    #             options_labels={"remove": "Remove", "fill_mean": "Fill mean", "fill_median": "Fill median", "fill_mode": "Fill mode", "custom": "Custom"},
    #             description="Method for handling missing values",
    #             default="fill_mean",
    #             required=True,
    #         ),
    #         "custom_value": {
    #             "visible": ("missing_value_handling", "==", "custom"),
    #         },
    #         "scaling_method": fields.RadioItems(
    #             options_labels={"standard": "Standard", "minmax": "MinMax", "robust": "Robust"},
    #             description="Scaling method to be applied to numerical features",
    #             default="standard",
    #             required=True,
    #         ),
    #         "outlier_handling": fields.RadioItems(
    #             options_labels={"remove": "Remove", "cap": "Cap", "none": "None"},
    #             description="Method for handling outliers",
    #             default="none",
    #             required=True,
    #         ),
    #         "cap_value": {
    #             "visible": ("outlier_handling", "==", "cap"),
    #         },
    #     },
    # )
    
    return dmc.Stack(
        [
            form,
            dmc.Flex(
                dmc.Button("Apply", color="blue", id={'class':'regression', 'type': 'numeric', 'column': column}, n_clicks=0, w=200),
                justify="end",
            ),
            html.Div(id={'class':'regression', 'type': "output", 'column': column}),
        ]
    )

def create_form_labeled(column):

    form = dmc.Stack(
        [
            dmc.Select(
                id={'class':'regression', 'type':"label_missing_value_handling", 'column': column},
                label="Missing Value Handling",
                description="Method for handling missing values",
                data=[
                    {"label": "Remove", "value": "remove"},
                    {"label": "Custom", "value": "custom"},
                ],
                value="remove",
                required=True,
            ),
            dmc.NumberInput(
                id={'class':'regression', 'type':"label_custom_value", 'column': column},
                label="Custom Value",
                description="Custom value for filling missing data, used if missing_value_handling is 'custom'",
                value=0,
                required=False,
                display="none",
            ),
            dmc.Select(
                id={'class':'regression', 'type':"label_encoding_method", 'column': column},
                label="Encoding Method",
                description="Encoding method to be applied to categorical features",
                data=[
                    {"label":"Label", "value": "label"},
                    # {"label":"Hash", "value": "hash"},
                ],
                value="label",
                required=True,
            ),
        ]
    )
    
    
    
    # ModelForm(
    #     DataPreprocessingSchema,
    #     "data_preprocessing",
    #     column,
    #     fields_repr={
    #         "missing_value_handling": fields.Select(
    #             options_labels={"remove": "Remove", "fill_mean": "Fill mean", "fill_median": "Fill median", "fill_mode": "Fill mode", "custom": "Custom"},
    #             description="Method for handling missing values",
    #             default="fill_mean",
    #             required=True,
    #         ),
    #         "custom_value": {
    #             "visible": ("missing_value_handling", "==", "custom"),
    #         },
    #         "scaling_method": fields.RadioItems(
    #             options_labels={"standard": "Standard", "minmax": "MinMax", "robust": "Robust"},
    #             description="Scaling method to be applied to numerical features",
    #             default="standard",
    #             required=True,
    #         ),
    #         "outlier_handling": fields.RadioItems(
    #             options_labels={"remove": "Remove", "cap": "Cap", "none": "None"},
    #             description="Method for handling outliers",
    #             default="none",
    #             required=True,
    #         ),
    #         "cap_value": {
    #             "visible": ("outlier_handling", "==", "cap"),
    #         },
    #     },
    # )
    
    return dmc.Stack(
        [
            form,
            dmc.Flex(
                dmc.Button("Apply", color="blue", id={'class':'regression', 'type': 'label', 'column': column}, n_clicks=0, w=200),
                justify="end",
            ),
            html.Div(id={'class':'regression', 'type': "label-output", 'column': column}),
        ]
    )

tab_style = {
  'border': f'2px solid {dmc.theme.DEFAULT_THEME["colors"]["blue"][6]}',
  'border-radius': '5px',
  'bg-color': dmc.theme.DEFAULT_THEME["colors"]["red"][6]
}

def layout():
    
    df = pd.read_csv(session_get_file_path('rawData',extension='csv'), index_col=0)

    columns = df.columns

    tab_list = dmc.Paper(
        dmc.Stack(
            [
                dmc.Title("Columns", size="md"),
                dmc.TabsList(
                    dmc.SimpleGrid(
                        [
                            dmc.TabsTab(column, value=column, style=tab_style) for column in columns
                        ],
                        cols=5,
                        w='100%'
                    ),
                ),
            ],
            m=20,
            gap=20
        ),
        withBorder=True,
        shadow=0
    )

    tabs = dmc.Tabs(
        dmc.Stack(
            [tab_list] + [
                dmc.Paper(
                    [
                        dmc.TabsPanel(
                            create_form(column) if ptypes.is_numeric_dtype(df[column]) else create_form_labeled(column),
                            value=column, 
                            m=20
                        ) for column in columns
                    ], 
                    withBorder=True, 
                    shadow=0)]
            ),
        variant="pills",
        value=columns[0],
    )

    layout = dmc.Stack(
        [
            create_table_description(df),
            tabs,
            dmc.Button("Apply All Preprocessing", color="green", id='regression-apply_preprocessing', n_clicks=0),
            dcc.Loading(type='circle',id='regression-loading-preproccess_data',style={"width": "80px", "height": "80px"}),
            html.Div(id="regression-output"),
            dmc.Group(
                [
                    reset_button,
                    html.Div(
                        id='regression-proceed-output',
                    )
                ],
                justify="space-between",
            )
        ]
    )
    
    return layout

@callback(
    Output({'class':'regression', 'type': "custom_value", 'column': MATCH}, 'display'),
    Input({'class':'regression', 'type': "missing_value_handling", 'column': MATCH}, 'value'),
    prevent_initial_call=True
)
def toggle_custom_value(value):
    if value == "custom":
        return "block"
    else:
        return "none"

@callback(
    Output({'class':'regression', 'type': "label_custom_value", 'column': MATCH}, 'display'),
    Input({'class':'regression', 'type': "label_missing_value_handling", 'column': MATCH}, 'value'),
    prevent_initial_call=True
)
def toggle_custom_value_label(value):
    if value == "custom":
        return "block"
    else:
        return "none"

@callback(
    Output({'class':'regression', 'type': "cap_value", 'column': MATCH}, 'display'),
    Input({'class':'regression', 'type': "outlier_handling", 'column': MATCH}, 'value'),
    prevent_initial_call=True
)
def toggle_cap_value(value):
    if value == "cap":
        return "block"
    else:
        return "none"


@callback(
    Output({'class':'regression', 'type': "label-output", 'column': MATCH},'children'),
    Input({'class':'regression', 'type': "label", 'column': MATCH}, 'n_clicks'),
    State({'class':'regression', 'type': 'label_missing_value_handling', 'column': MATCH}, 'value'),
    State({'class':'regression', 'type': 'label_custom_value', 'column': MATCH}, 'value'),
    State({'class':'regression', 'type': 'label_encoding_method', 'column': MATCH}, 'value'),
    State({'class':'regression', 'type': "label", 'column': MATCH}, 'id'),
    prevent_initial_call=True
)
def preprcess_labeled_column(n_clicks, missing_value_handling, custom_value, encoding_method, button_id):
    if n_clicks > 0:
        
        column = button_id['column']
        
        try:
            df = pd.read_csv(session_get_file_path('rawData', extension='csv'), index_col=0)
            
            schema = LabeledDataProcessing(
                missing_value_handling=missing_value_handling,
                custom_value=custom_value,
                encoding_method=encoding_method,
            )
            
            visualizations = preprocess_label_and_visualize_series(df[column], schema)

            graphs = [
                dcc.Graph(figure=visualization) for visualization in visualizations
            ]
            
            output = dmc.Stack(
                [
                    dmc.SimpleGrid(
                        graphs,
                        cols=len(graphs),
                    ),
                ]
            )
            
        except ValidationError as exc:
            
            return html.Div(
                [
                    dmc.Alert(
                        parse_validation_errors(exc),
                        color="red",
                        variant="filled",
                        withCloseButton=True
                    )
                ]
            )
            
        except Exception as exc:
            
            print(exc)
            
            return html.Div(
                [
                    dmc.Alert(
                        "There was an error preprocessing your data.",
                        color="red",
                        variant="filled",
                        withCloseButton=True
                    )
                ]
            )
            
            
        return output
    else:
        raise PreventUpdate

@callback(
    Output({'class':'regression', 'type': "output", 'column': MATCH},'children'),
    Input({'class':'regression', 'type': "numeric", 'column': MATCH}, 'n_clicks'),
    State({'class':'regression', 'type': 'missing_value_handling', 'column': MATCH}, 'value'),
    State({'class':'regression', 'type': 'custom_value', 'column': MATCH}, 'value'),
    State({'class':'regression', 'type': 'scaling_method', 'column': MATCH}, 'value'),
    State({'class':'regression', 'type': 'outlier_handling', 'column': MATCH}, 'value'),
    State({'class':'regression', 'type': 'cap_value', 'column': MATCH}, 'value'),
    State({'class':'regression', 'type': "numeric", 'column': MATCH}, 'id'),
)
def preprcess_each_column(n_clicks, missing_value_handling, custom_value, scaling_method, outlier_handling, cap_value, button_id):
    if n_clicks > 0:
        
        column = button_id['column']
        
        try:
            df = pd.read_csv(session_get_file_path('rawData', extension='csv'), index_col=0)
            
            schema = DataPreprocessingSchema(
                missing_value_handling=missing_value_handling,
                custom_value=custom_value,
                scaling_method=scaling_method,
                outlier_handling=outlier_handling,
                cap_value=cap_value
            )
            
            visualizations = preprocess_and_visualize_series(df[column], schema)

            graphs = [
                dcc.Graph(figure=visualizations['before']['histogram']),
                dcc.Graph(figure=visualizations['after']['histogram']),
                dcc.Graph(figure=visualizations['before']['box']),
                dcc.Graph(figure=visualizations['after']['box'])
            ]
            
            output = dmc.Stack(
                [
                    dmc.SimpleGrid(
                        graphs,
                        cols=4,
                    ),
                ]
            )
            
        except ValidationError as exc:
            
            return html.Div(
                [
                    dmc.Alert(
                        parse_validation_errors(exc),
                        color="red",
                        variant="filled",
                        withCloseButton=True
                    )
                ]
            )
            
        except Exception as exc:
            
            return html.Div(
                [
                    dmc.Alert(
                        "There was an error preprocessing your data.",
                        color="red",
                        variant="filled",
                        withCloseButton=True
                    )
                ]
            )
            
            
        return output
    else:
        raise PreventUpdate
    
@callback(
    Output("regression-output", "children"),
    Output("regression-proceed-output", "children", allow_duplicate=True),
    Output('regression-loading-preproccess_data','children', allow_duplicate=True),
    Input('regression-apply_preprocessing', 'n_clicks'),
    State({'class':'regression', 'type': 'missing_value_handling', 'column': ALL}, 'value'),
    State({'class':'regression', 'type': 'custom_value', 'column': ALL}, 'value'),
    State({'class':'regression', 'type': 'scaling_method', 'column': ALL}, 'value'),
    State({'class':'regression', 'type': 'outlier_handling', 'column': ALL}, 'value'),
    State({'class':'regression', 'type': 'cap_value', 'column': ALL}, 'value'),
    State({'class':'regression', 'type': 'label_missing_value_handling', 'column': ALL}, 'value'),
    State({'class':'regression', 'type': 'label_custom_value', 'column': ALL}, 'value'),
    State({'class':'regression', 'type': 'label_encoding_method', 'column': ALL}, 'value'),
    State({'class':'regression', 'type': "numeric", 'column': ALL}, 'id'),
    State({'class':'regression', 'type': "label", 'column': ALL}, 'id'),
    prevent_initial_call = True
)
def preprocess_all(n_clicks, missing_value_handlings, custom_values, scaling_methods, outlier_handlings, cap_values, label_missing_value_handlings, label_custom_values, label_encoding_methods, numeric_button_ids, label_button_ids):
    if n_clicks > 0:
        
        numeric_columns = [button_id['column'] for button_id in numeric_button_ids]
        
        label_columns = [button_id['column'] for button_id in label_button_ids]
        
        try:
            
            numeric_schemas = [{
                    'missing_value_handling': missing_value_handling,
                    'custom_value': custom_value,
                    'scaling_method': scaling_method,
                    'outlier_handling': outlier_handling,
                    'cap_value': cap_value
                } for missing_value_handling, custom_value, scaling_method, outlier_handling, cap_value in zip(missing_value_handlings, custom_values, scaling_methods, outlier_handlings, cap_values)
            ]
            
            label_schemas = [{
                    'missing_value_handling': label_missing_value_handling,
                    'custom_value': label_custom_value,
                    'encoding_method': label_encoding_method
                } for label_missing_value_handling, label_custom_value, label_encoding_method in zip(label_missing_value_handlings, label_custom_values, label_encoding_methods)
            ]

            
            schemas = numeric_schemas + label_schemas
            columns = numeric_columns + label_columns

            df = pd.read_csv(session_get_file_path('rawData', extension='csv'), index_col=0)
            
            columns_schemas = {columns[i]: schemas[i] for i in range(len(columns))}

            
            columns = [col for col in df.columns if col in columns_schemas]
            schemas = [columns_schemas[col] for col in columns]

            columns_schemas = {columns[i]: schemas[i] for i in range(len(columns))}

            session_dict_to_json(columns_schemas, 'preprocessing')
            
            result = preprocess_all_and_visualize(df, columns_schemas)
            
            if result[1] != 0:

                output = html.Div(
                    [
                        result[0],
                        dmc.ScrollArea(
                            h=1500,
                            children=[dcc.Graph(figure=result[1], style={'height': '3000px','width':'3000px'})],
                            style={'width':'100%'}
                        )
                    ]
                )
            
            else:
                output = dmc.Stack(
                    [
                        result[0],
                    ]
                )
            
            return output, continue_button, ""
        
        except ValidationError as exc:
            
            return html.Div(
                [
                    dmc.Alert(
                        parse_validation_errors(exc),
                        color="red",
                        variant="filled",
                        withCloseButton=True
                    )
                ]
            ), no_update, no_update
            
        except Exception as exc:

            print(exc)
            
            return html.Div(
                [
                    dmc.Alert(
                        "There was an error preprocessing your data.",
                        color="red",
                        variant="filled",
                        withCloseButton=True
                    )
                ]
            ), no_update, no_update

    else:
        raise PreventUpdate