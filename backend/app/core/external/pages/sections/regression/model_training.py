from dash_pydantic_form import ModelForm, fields
from pydantic import BaseModel, Field
from typing import Optional, Literal
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from dash import Input, Output, callback, html, State, dcc, no_update
import dash_mantine_components as dmc
from app.core.external.pages.sections.regression.utils import parse_validation_errors, session_get_file_path, session_json_to_dict, session_save_model,reset_button, continue_button, session_schema_load, session_schema_save
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet
from sklearn.tree import DecisionTreeRegressor
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet
from sklearn.tree import DecisionTreeRegressor
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV, RandomizedSearchCV
import numpy as np
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from pydantic import ValidationError
from dash.exceptions import PreventUpdate

alert_default  = dmc.Alert(
                'If model Number not selected use last model fit',
                color="blue",
                variant="filled",
                withCloseButton=True
                )
alert_selected = dmc.Alert(
                'The spesific model has been selected',
                color="green",
                variant="filled",
                withCloseButton=True
                )

alert_selected_not = dmc.Alert(
                'If model not properly choose will use default model',
                color="red",
                variant="filled",
                withCloseButton=True
                )

class ModelTrainingSchema(BaseModel):
    ml_model_type: Literal["linear", "ridge", "lasso", "elasticnet", "decision_tree"] = Field(
        ..., description="Type of regression model to train"
    )
    validation_method: Literal["train_test_split", "cross_validation"] = Field(
        description="Validation method to be used",
        default='train_test_split'
    )
    test_size: Optional[float] = Field(
        0.2, description="Test size ratio for train-test split"
    )
    cross_validation_folds: Optional[int] = Field(
        default=5, description="Number of folds for cross-validation"
    )
    tuning_method: Literal["manual", "grid_search", "random_search"] = Field(
        ..., description="Hyperparameter tuning method"
    )
    metrics: Literal["R2", "RMSE", "MAE"] = Field(
        description="List of metrics to evaluate the model",
        default_factory=list
    )
    # Model-specific parameters
    alpha: Optional[float] = Field(
        None, description="Regularization strength for Ridge, Lasso, ElasticNet"
    )
    l1_ratio: Optional[float] = Field(
        None, description="The ElasticNet mixing parameter (only for ElasticNet)"
    )
    max_depth: Optional[int] = Field(
        None, description="Maximum depth of the tree for DecisionTreeRegressor"
    )
    min_samples_split: Optional[int] = Field(
        None, description="Minimum samples required to split an internal node for DecisionTreeRegressor"
    )

    # Evaluation metrics
    

def formModelSelect(list_model):
    class ModelSelectSchema(BaseModel):
        # Model Evaluation
        select_model: Literal[tuple(list_model)] = Field(
            description="Choose model n to use",
        )
    
    return ModelSelectSchema

def select_train_evaluate(df: pd.DataFrame, target: str, schema):
    print(schema)
    # Prepare data for training
    X = df.drop(columns=[target])
    y = df[target]

    # Define the model
    if schema['ml_model_type'] == "linear":
        model = LinearRegression()
    elif schema['ml_model_type'] == "ridge":
        model = Ridge(alpha=1.0)
    elif schema['ml_model_type'] == "lasso":
        model = Lasso(alpha=1.0)
    elif schema['ml_model_type'] == "elasticnet":
        model = ElasticNet(alpha=1.0, l1_ratio=0.5)
    elif schema['ml_model_type'] == "decision_tree":
        model = DecisionTreeRegressor()

    # Handle validation method
    if schema['validation_method'] == "train_test_split":
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=schema['test_size'],random_state = 42)
    else:
        X_train, X_test, y_train, y_test = X, None, y, None  # For cross-validation, we'll use the entire dataset

    # Hyperparameter tuning
    if schema['tuning_method'] == "manual":
        if isinstance(model,DecisionTreeRegressor) and (schema['max_depth'] is not None and schema['min_samples_split'] is not None):
            model.max_depth = schema['max_depth']
            model.min_samples_split = schema['min_samples_split']
        elif isinstance(model,(Lasso,Ridge)) and schema['alpha'] is not None:
            model.alpha = schema['alpha']
        elif isinstance(model,ElasticNet) and (schema['alpha'] is not None and schema['l1_ratio'] is not None):
            model.alpha = schema['alpha']
            model.l1_ratio = schema['l1_ratio']
        # Parameters are already set during model initialization
    elif schema['tuning_method'] in ["grid_search", "random_search"]:
        param_grid = {}
        if schema['ml_model_type'] in ["ridge", "lasso", "elasticnet"]:
            param_grid['alpha'] = [0.1, 1.0, 10.0]
        if schema['ml_model_type']== "elasticnet":
            param_grid['l1_ratio'] = [0.1, 0.5, 0.9]
        if schema['ml_model_type'] == "decision_tree":
            param_grid['max_depth'] = [None, 5, 10, 15]
            param_grid['min_samples_split'] = [2, 5, 10]

        if schema['tuning_method'] == "grid_search":
            search = GridSearchCV(model, param_grid=param_grid, cv=schema['cross_validation_folds'])
        else:
            search = RandomizedSearchCV(model, param_distributions=param_grid, cv=schema['cross_validation_folds'])

        search.fit(X_train, y_train)
        model = search.best_estimator_

    # Training the model
    if schema['validation_method'] == "train_test_split":
        model.fit(X_train, y_train)

    # Evaluate the model
    evaluation_results = {}
    visualizations = {}


    if schema['validation_method'] == "train_test_split":
        y_pred = model.predict(X_test)

        # Calculate evaluation metrics
        if "R2" in schema['metrics']:
            evaluation_results["R2"] = r2_score(y_test, y_pred)
        if "RMSE" in schema['metrics']:
            evaluation_results["RMSE"] = np.sqrt(mean_squared_error(y_test, y_pred))
        if "MAE" in schema['metrics']:
            evaluation_results["MAE"] = mean_absolute_error(y_test, y_pred)
        


        # Create visualizations
        # Predicted vs Actual Plot
        fig_pred_actual = px.scatter(
            x=y_test,
            y=y_pred,
            labels={'x': 'Actual Values', 'y': 'Predicted Values'},
            title='Predicted vs Actual Values'
        )
        fig_pred_actual.add_trace(
            go.Scatter(x=y_test, y=y_test, mode='lines', name='Ideal Fit')
        )
        fig_pred_actual.update_layout(template='simple_white')
        visualizations['predicted_vs_actual'] = fig_pred_actual

        # Residual Plot
        residuals = y_test - y_pred
        fig_residuals = px.scatter(
            x=y_pred,
            y=residuals,
            labels={'x': 'Predicted Values', 'y': 'Residuals'},
            title='Residual Plot'
        )
        fig_residuals.add_hline(y=0, line_dash="dash", line_color="red")
        fig_residuals.update_layout(template='simple_white')
        visualizations['residuals'] = fig_residuals

    else:
        # For cross-validation, we will evaluate the metrics across the folds
        if "R2" in schema['metrics']:
            r2_scores = cross_val_score(model, X_train, y_train, cv=schema['cross_validation_folds'], scoring='r2')
            evaluation_results["R2"] = np.mean(r2_scores)
        if "RMSE" in schema['metrics']:
            neg_mse_scores = cross_val_score(model, X_train, y_train, cv=schema['cross_validation_folds'], scoring='neg_mean_squared_error')
            evaluation_results["RMSE"] = np.sqrt(-np.mean(neg_mse_scores))
        if "MAE" in schema['metrics']:
            neg_mae_scores = cross_val_score(model, X_train, y_train, cv=schema['cross_validation_folds'], scoring='neg_mean_absolute_error')
            evaluation_results["MAE"] = -np.mean(neg_mae_scores)
        # Note: Visualizations are not generated for cross-validation in this example

    # Feature Importance (if applicable)
    if schema['ml_model_type'] == "decision_tree":
        importance = model.feature_importances_
        feature_names = X.columns
        fig_feature_importance = px.bar(
            x=feature_names,
            y=importance,
            labels={'x': 'Features', 'y': 'Importance'},
            title='Feature Importance'
        )
        fig_feature_importance.update_layout(template='simple_white')
        visualizations['feature_importance'] = fig_feature_importance

    list_model = []
    

    if schema['validation_method'] == 'train_test_split':

        number_per_train = round(len(X_train)*schema['test_size'])
        index_per_train = np.arange(0,len(X_train),number_per_train)


        x_axis = np.arange(schema['test_size']*100,100,schema['test_size']*100)


        if len(index_per_train) > len(x_axis)+1:
            index_per_train = index_per_train[:len(x_axis)+1]

        
        r2_per_train = []
        rmse_per_train = []
        mae_per_train = []

        scores_per_train = {}

        for i in range(1,len(index_per_train)):
            X_train_per_train = X_train.iloc[:index_per_train[i],:]
            y_train_per_train = y_train.iloc[:index_per_train[i]]

            model.fit(X_train_per_train,y_train_per_train)
            y_pred_per_train = model.predict(X_test)

            r2_per_train.append(r2_score(y_test, y_pred_per_train))
            rmse_per_train.append(np.sqrt(mean_squared_error(y_test, y_pred_per_train)))
            mae_per_train.append(mean_absolute_error(y_test, y_pred_per_train))
            list_model.append(model)

        fig_r2_per_train = px.line(
            x=x_axis,
            y=r2_per_train,
            labels={'x': 'percentage of data used (%)', 'y': 'R2 Score'},
            title='R2 Score per percentage of data used',
            template='simple_white'
        )

        fig_rmse_per_train = px.line(
            x=x_axis,
            y=rmse_per_train,
            labels={'x': 'percentage of data used (%)', 'y': 'RMSE Score'},
            title='RMSE Score per percentage of data used',
            template='simple_white'
        )

        fig_mae_per_train = px.line(
            x=x_axis,
            y=mae_per_train,
            labels={'x': 'percentage of data used (%)', 'y': 'MAE Score'},
            title='MAE Score per percentage of data used (%)',
            template='simple_white'
        )


        if "R2" in schema['metrics']:
            visualizations['r2_score_per_train'] = fig_r2_per_train
            scores_per_train['R2'] = r2_per_train
        if "RMSE" in schema['metrics']:
            visualizations['rmse_score_per_train'] = fig_rmse_per_train
            scores_per_train['RMSE'] = rmse_per_train
        if "MAE" in schema['metrics']:
            visualizations['mae_score_per_train'] = fig_mae_per_train
            scores_per_train['MAE'] = mae_per_train


    head = [metric for metric in schema['metrics']]
    head.insert(0,'Percent')
    list_baru = [list(values) for values in zip(*scores_per_train.values())]
    list_baru_2 = [list_baru[i].insert(0,f'{x_axis[i]} %') for i in range(0,len(list_baru))]

    tabel = dmc.Table(
                data={
                    "head": head,
                    "body": list_baru
                }
            ),

    return model, evaluation_results, visualizations, list_model, tabel, x_axis

def select_model_function(list_model,model_number_dict):
    if model_number_dict['select_model'] == 'Default Model':
        idx_selected = -1
    else:
        idx_selected = int(model_number_dict['select_model'].split(' ')[1])-1
    model = list_model[idx_selected]
    return model

def layout():

    form = ModelForm(
        ModelTrainingSchema,
        "model_selection",
        "main",
        fields_repr={
            "ml_model_type": fields.Select(
                options_labels={"linear": "Linear", "ridge": "Ridge", "lasso": "Lasso", "elasticnet": "Elastic Net", "decision_tree": "Decision Tree"},
                description="Type of regression model to train",
                required=True,
            ),
            "validation_method": fields.Select(
                options_labels={"train_test_split": "Train-Test Split", "cross_validation": "Cross-Validation"},
                description="Validation method",
                visible=False,
                required=True,
            ),
            "tuning_method": fields.Select(
                options_labels={"manual": "Manual", "grid_search": "Grid Search", "random_search": "Random Search"},
                description="Hyperparameter tuning method",
                required=True,
            ),
            "metrics": fields.MultiSelect(
                description="METRICS to evaluate the model",
                required=True,
            ),
            "test_size": {  
                "visible": ("validation_method", "==", "train_test_split"),
                "min" : "0.1",
                "max" : "0.4"
            },
            "cross_validation_folds": {
                "visible": 'false',
                "default": '5',
            },
            "alpha": {
                "visible": (('ml_model_type', 'in', ['ridge','lasso','elasticnet']), ('tuning_method', '==','manual')),
            },
            "l1_ratio": {
                "visible": (('ml_model_type', '==', 'elasticnet'), ('tuning_method', '==','manual')),
                "min":"0.0",
                "max":"1.0"
            },
            "max_depth": {
                "visible": (('ml_model_type', '==', 'decision_tree'), ('tuning_method', '==','manual'))
            },
            "min_samples_split": {
                "visible": (('ml_model_type', '==', 'decision_tree'), ('tuning_method', '==','manual'))
            },
            
        },
    )

    layout = dmc.Stack(
        [
            form,
            dmc.Button("Apply", color="blue", id='regression-apply_model_selection', n_clicks=0),
            dcc.Loading(type='circle',id='regression-loading-placeholder',style={"width": "80px", "height": "80px"}),
            html.Div(id="regression-model-selection-output"),
            html.Div(id='regression-tabel-selection-scores'),
            dmc.Group(
                [
                    html.Div(id='regression-model-final-select-form', style={'flex-grow': '1'}),  # Biarkan form berkembang dengan grow
                    dmc.Button("Select", color="blue", id='regression-apply_model_final', n_clicks=0),
                ],
                justify='space-between',
                grow=True,
                id='regression-model-select-container',
                style={
                    'display': 'None',
                    'align-items': 'flex-end',  # Pastikan elemen berada di bawah
                    'height': 'fit-content', # Tambahkan padding agar tidak terlalu rapat
                }
            ),
            html.Div(id='regression-model-final-select-status'),
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
    Output("regression-model-selection-output", "children"),
    Output("regression-loading-placeholder","children"),
    Output('regression-model-final-select-form','children',allow_duplicate=True),
    Output("regression-proceed-output", "children", allow_duplicate=True),
    Output('regression-model-final-select-status','children',allow_duplicate=True),
    Output('regression-model-select-container','style',allow_duplicate=True),
    Output('regression-tabel-selection-scores','children',allow_duplicate=True),
    Input('regression-apply_model_selection', 'n_clicks'),
    State(ModelForm.ids.main("model_selection", 'main'), "data"),
    prevent_initial_call = True
)
def apply_model_training(n_clicks, form_data):
    if n_clicks > 0:
        
        try:
            
            feature_selection_dict = session_json_to_dict('feature_selection')
            target = feature_selection_dict.get('target')
            df = pd.read_csv(session_get_file_path('feature_selected', extension='csv'), index_col=0)
 

            model, scores, visualizations, list_, tabel, x_axis = select_train_evaluate(df, target, form_data)

            list_model = [f'Model {i+1} ({x_axis[i]})%' for i in range (0,len(x_axis))]


            form_model = formModelSelect(list_model)

            form = ModelForm(
                form_model,
                "model_selection_final",
                "main",
                fields_repr={
                    "select_model": fields.Select(
                        description="Select model number that will use",
                        default='Default Model'
                    ),
                },
            )
            
            dict_schema = session_schema_load()
            dict_schema['model'] = model
            dict_schema['list_model'] = list_
            session_schema_save(dict_schema)

            visualizations = [dcc.Graph(figure=figure) for figure in visualizations.values()]
            
            session_save_model(model, 'model')
            
            return dmc.Stack(
                [
                    dmc.Table(
                        data={
                            "head": ["Metric", "Score"],
                            "body": [
                                [metric, score] for metric, score in scores.items()
                            ],
                        }
                    ),
                    dmc.SimpleGrid(visualizations, cols=3),
                ]
            ), "", form, continue_button, alert_default, {
                    'display': 'flex',
                    'align-items': 'flex-end',  # Pastikan elemen berada di bawah
                    'height': 'fit-content', # Tambahkan padding agar tidak terlalu rapat
                }, tabel
            
            
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
            ), no_update, no_update, no_update, no_update,no_update, no_update
        
        except Exception as exc:
            print(exc)
            return html.Div(
                [
                    dmc.Alert(
                        "There was an error applying model training.",
                        color="red",
                        variant="filled",
                        withCloseButton=True
                    )
                ]
            ), no_update, no_update, no_update, no_update,no_update, no_update
        
@callback(
    Output("regression-model-final-select-status", "children", allow_duplicate=True),
    Input('regression-apply_model_final', 'n_clicks'),
    State(ModelForm.ids.main("model_selection_final", 'main'), "data"),
    prevent_initial_call = True
)
def select_model_training(n_clicks, form_data):
    if n_clicks > 0:
        dict_schema = session_schema_load()
        list_model = dict_schema['list_model']
        if form_data['select_model'] == None:
            return alert_selected_not
        else:

            selected_model = select_model_function(list_model,form_data)

            dict_schema['model'] = selected_model
            session_save_model(selected_model, 'model')

            return alert_selected

    else:
        raise PreventUpdate
