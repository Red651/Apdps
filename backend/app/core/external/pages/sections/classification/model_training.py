from dash_pydantic_form import ModelForm, fields
from pydantic import BaseModel, Field
from typing import Optional, Literal
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from dash import Input, Output, callback, html, State, dcc, no_update
import dash_mantine_components as dmc
from app.core.external.pages.sections.classification.utils import parse_validation_errors, session_get_file_path, session_json_to_dict, session_save_model,reset_button, continue_button, session_schema_save, session_schema_load
from sklearn.model_selection import train_test_split
from sklearn.model_selection import train_test_split, GridSearchCV, RandomizedSearchCV
import numpy as np
from pydantic import ValidationError
from typing import List
import pandas as pd
import numpy as np
import plotly.graph_objs as go
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split, GridSearchCV, RandomizedSearchCV
from sklearn.decomposition import PCA
from dash.exceptions import PreventUpdate
from imblearn.over_sampling import SMOTE,RandomOverSampler
from imblearn.under_sampling import RandomUnderSampler

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_curve,
    precision_recall_curve,
    confusion_matrix,
)


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
    # Model Selection
    ml_model_type: Literal["logistic_regression", "decision_tree", "random_forest", "svm"] = Field(
        ..., description="Type of classification model to train."
    )
    
    # Parameter Tuning
    tuning_method: Literal["manual", "grid_search", "random_search"] = Field(
        ..., description="Hyperparameter tuning method to be used."
    )
    test_size: float = Field(
        default= 0.2,
        description="Test Size"
    )
    space_train: Literal['pca','original'] = Field(
        description='Space',
        default='original'
    )
    sampling: Literal['over','under','original'] = Field(
        description='Sampling Imbalance',
        default='original'
    )
    metrics: Literal["accuracy", "precision", "recall", "f1"]  = Field(
        ..., description="List of evaluation metrics to compute.", default_factory=list
    )
    # Model-specific parameters
    max_depth: Optional[int] = Field(None, description="Maximum depth of the tree for Decision Tree and Random Forest.")
    n_estimators: Optional[int] = Field(None, description="Number of trees in the forest for Random Forest.")
    C: Optional[float] = Field(None, description="Regularization strength for Logistic Regression and SVM.")
    
    
    # Model Evaluation
    

def formModelSelect(list_model):
    class ModelSelectSchema(BaseModel):
        # Model Evaluation
        select_model: Literal[tuple(list_model)] = Field(
            description="Choose model n to use",
        )
    
    return ModelSelectSchema


def select_train_evaluate(df: pd.DataFrame, target: str, schema):
    X = df.drop(columns=[target])
    y = df[target]

    if schema['sampling'] == 'over':
        sampling = RandomOverSampler(sampling_strategy='all')
        X,y = sampling.fit_resample(X,y)
    elif schema['sampling']  == 'under':
        sampling = RandomUnderSampler(sampling_strategy='all')
        X,y = sampling.fit_resample(X,y)
    if schema['space_train'] == 'pca':
        pca = PCA(n_components = 2)
        new_feature = pca.fit_transform(X)
        X = pd.DataFrame(new_feature,columns=['PC1','PC2'])

    # Model Selection
    if schema['ml_model_type'] == "logistic_regression":
        model = LogisticRegression()
    elif schema['ml_model_type'] == "decision_tree":
        model = DecisionTreeClassifier()
    elif schema['ml_model_type'] == "random_forest":
        model = RandomForestClassifier()
    elif schema['ml_model_type'] == "svm":
        model = SVC(probability=True)  # Enable probability estimates for ROC curve visualization
    else:
        raise ValueError(f"Unsupported model type: {schema['ml_model_type']}")
    # Hyperparameter Tuning
    if schema['tuning_method'] == "manual":
        # For manual tuning, set the parameters directly
        if isinstance(model, (LogisticRegression, SVC)) and schema['C'] is not None:
            model.C = schema['C']
        if isinstance(model, (DecisionTreeClassifier, RandomForestClassifier)) and schema['max_depth'] is not None:
            model.max_depth = schema['max_depth']
        if isinstance(model, RandomForestClassifier) and schema['n_estimators'] is not None:
            model.n_estimators = schema['n_estimators']

    elif schema['tuning_method'] in ["grid_search", "random_search"]:
        param_grid = {}
        if isinstance(model, (LogisticRegression, SVC)):
            param_grid["C"] = [0.01, 0.1, 1.0, 10.0] 
        if isinstance(model, (DecisionTreeClassifier, RandomForestClassifier)):
            param_grid["max_depth"] = [3, 5, 10, 15] 
        if isinstance(model, RandomForestClassifier):
            param_grid["n_estimators"] = [50, 100, 200]

        if schema['tuning_method'] == "grid_search":
            search = GridSearchCV(model, param_grid=param_grid, cv=5)
        else:
            search = RandomizedSearchCV(model, param_distributions=param_grid, cv=5)
        search.fit(X, y)
        model = search.best_estimator_

    # Train the model
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=schema['test_size'], random_state=42)
    model.fit(X_train, y_train)


    y_pred = model.predict(X_test)

    dict_schema = session_schema_load()
    dict_schema['space'] = schema['space_train']
    dict_schema['model'] = model

    if dict_schema['space'] == 'pca':
        dict_schema['pca'] = pca

    session_schema_save(dict_schema)


    idx_target = np.where(target==np.array(dict_schema['column']))[0]
    encode = dict_schema['label_enc'][idx_target[0]]
    y_pred, y_test = encode.inverse_transform(y_pred), encode.inverse_transform(y_test)

    evaluation_results = evaluate_classification_model(y_test, y_pred, encode, schema['metrics'])
    # Create Visualizations
    visualizations = create_classification_visualizations(model, X_test, y_test, y_pred, encode, schema['metrics'])
    visualizations,list_model,tabel, x_axis =fig_per_train(X_train, X_test, y_train, y_test, model, visualizations, encode, schema)
    
    return model, evaluation_results, visualizations, list_model, tabel, x_axis# Return the visualizations

# Helper function to evaluate the classification model
def evaluate_classification_model(y_test, y_pred, encode, metrics: List[str]) -> dict:
    if np.issubdtype(np.array(y_pred).dtype, np.number):
        y_pred = encode.inverse_transform(y_pred)
    elif np.issubdtype(np.array(y_test).dtype, np.number):
        encode.inverse_transform(y_test)
    evaluation_results = {}
    if "accuracy" in metrics:
        evaluation_results["accuracy"] = accuracy_score(y_test, y_pred)
    if "precision" in metrics:
        evaluation_results["precision"] = precision_score(y_test, y_pred, average="weighted")
    if "recall" in metrics:
        evaluation_results["recall"] = recall_score(y_test, y_pred, average="weighted")
    if "f1" in metrics:
        evaluation_results["f1"] = f1_score(y_test, y_pred, average="weighted")
    return evaluation_results

# Helper function to create Plotly visualizations for classification models
def create_classification_visualizations(model, X_test, y_test, y_pred, encode, metrics: List[str]) -> dict:
    visualizations = {}

    # Confusion Matrix
    cm = confusion_matrix(y_test, y_pred)
    fig_cm = go.Figure(data=go.Heatmap(z=cm, x=model.classes_, y=model.classes_, colorscale="Blues"))
    fig_cm.update_layout(title="Confusion Matrix", xaxis_title="Predicted", yaxis_title="Actual")
    visualizations["confusion_matrix"] = fig_cm

    # ROC Curve (if applicable)
    if len(model.classes_) == 2:  # ROC Curve is applicable only for binary classification
        y_prob = model.predict_proba(X_test)[:, 1]
        y_prob = encode.inverse_transform(y_prob)
        fpr, tpr, _ = roc_curve(y_test, y_prob)
        fig_roc = go.Figure()
        fig_roc.add_trace(go.Scatter(x=fpr, y=tpr, mode="lines", name="ROC Curve"))
        fig_roc.add_trace(go.Scatter(x=[0, 1], y=[0, 1], mode="lines", line=dict(dash="dash"), name="Random Classifier"))
        fig_roc.update_layout(title="ROC Curve", xaxis_title="False Positive Rate", yaxis_title="True Positive Rate")
        visualizations["roc_curve"] = fig_roc

    # Precision-Recall Curve (if applicable)
    if len(model.classes_) == 2:  # Precision-Recall Curve is applicable only for binary classification
        precision, recall, _ = precision_recall_curve(y_test, y_prob)
        fig_pr = go.Figure()
        fig_pr.add_trace(go.Scatter(x=recall, y=precision, mode="lines", name="Precision-Recall Curve"))
        fig_pr.update_layout(title="Precision-Recall Curve", xaxis_title="Recall", yaxis_title="Precision")
        visualizations["precision_recall_curve"] = fig_pr

    # Feature Importance (for models that support it)
    if hasattr(model, "feature_importances_"):
        feature_importance = model.feature_importances_
        fig_fi = go.Figure(data=go.Bar(x=X_test.columns, y=feature_importance))
        fig_fi.update_layout(title="Feature Importance", xaxis_title="Features", yaxis_title="Importance")
        visualizations["feature_importance"] = fig_fi

    return visualizations

def fig_per_train(X_train, X_test, y_train, y_test, model, visualizations, encode, schema):
    number_per_train = round(len(X_train) * schema['test_size'])
    index_per_train = np.arange(0,len(X_train),number_per_train)

    x_axis = np.arange(schema['test_size']*100,100,schema['test_size']*100)

    if len(index_per_train) > len(x_axis)+1:
        index_per_train = index_per_train[:len(x_axis)+1]

    met_train = [list(schema['metrics'])]

    list_model = []

    for i in range(1,len(index_per_train)):
        X_train_per_train = X_train.iloc[:index_per_train[i],:]
        y_train_per_train = y_train.iloc[:index_per_train[i]]

        model.fit(X_train_per_train,y_train_per_train)
        y_pred_per_train = model.predict(X_test)
        met_per_train = evaluate_classification_model(y_test, y_pred_per_train, encode, schema['metrics'])

        met_train.append(list(met_per_train.values()))
        list_model.append(model)


    columns, *values = met_train
    result_dict = {col: list(val) for col, val in zip(columns, zip(*values))}

    head = [key for key in result_dict.keys()]
    head.insert(0,'Percent')
    list_baru = [list(values) for values in zip(*result_dict.values())]
    list_baru_2 = [list_baru[i].insert(0,f'{x_axis[i]} %') for i in range(0,len(list_baru))]


    for key in result_dict:
        fig_per_train = px.line(
            x=x_axis,
            y=list(map(float,result_dict[key])),
            labels={'x': 'percentage of data used (%)', 'y': f'{key} Score'},
            title=f'{key} Score per Percentage of Data Used',
            template='simple_white'
        )

        visualizations[f'{key}'] = fig_per_train

    tabel = dmc.Table(
                data={
                    "head": head,
                    "body": list_baru
                }
            ),

    return visualizations, list_model, tabel, x_axis

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
                options_labels={"logistic_regression": "Logistic Regression", "decision_tree": "Decision Tree", "random_forest": "Random Forest", "svm": "SVM"},
                description="Type of classification model to train",
                required=True,
            ),
            "tuning_method": fields.Select(
                options_labels={"manual": "Manual", "grid_search": "Grid Search", "random_search": "Random Search"},
                description="Hyperparameter tuning method",
                required=True,
            ),
            "C":{
                "visible": (('ml_model_type', 'in', ["logistic_regression","svm"]), ('tuning_method', '==','manual'))
            },
            "max_depth":{
                "visible": (('ml_model_type', 'in', ["decision_tree","random_forest"]), ('tuning_method', '==','manual'))
            },
            "n_estimators":{
                "visible": (('ml_model_type', 'in', ["random_forest"]), ('tuning_method', '==','manual'))
            },
            "metrics": fields.MultiSelect(
                #options_labels={'accuracy':'Accuracy','precision':'Precision','recall':'Recall','f1':'F1-Score'},
                description="METRICS to evaluate the model",
                required=True,
            ),
            "test_size": fields.Number(
                min = 0.1,
                max = 0.4,
            ),
            "space_train": fields.Select(
                options_labels={'pca':'PCA 2D Space','original':'Original Space'},
                description='Space of Model to be Train'
            ),
            "sampling": fields.Select(
                options_labels={'over':'Over Sampling','original':'Original Data','under':'Under Sampling'},
                description='Sampling Method to Overcome Imbalanced Data'
            )
        },
    )

    layout = dmc.Stack(
        [
            form,
            dmc.Button("Apply", color="blue", id='classification-apply_model_selection', n_clicks=0),
            dcc.Loading(type='circle',id='classification-loading-placeholder',style={"width": "80px", "height": "80px"}),
            html.Div(id="classification-model-selection-output"),
            html.Div(id='classification-tabel-selection-scores'),
            dmc.Group(
                [
                    html.Div(id='classification-model-final-select-form', style={'flex-grow': '1'}),  # Biarkan form berkembang dengan grow
                    dmc.Button("Select", color="blue", id='classification-apply_model_final', n_clicks=0),
                ],
                justify='space-between',
                grow=True,
                id='classification-model-select-container',
                style={
                    'display': 'None',
                    'align-items': 'flex-end',  # Pastikan elemen berada di bawah
                    'height': 'fit-content', # Tambahkan padding agar tidak terlalu rapat
                }
            ),
            html.Div(id='classification-model-final-select-status'),
            dmc.Group(
                [
                    reset_button,
                    html.Div(
                        id='classification-proceed-output',
                    )
                ],
                justify="space-between",
            )
        ]
    )
    
    return layout

@callback(
    Output("classification-model-selection-output", "children"),
    Output("classification-loading-placeholder","children"),
    Output('classification-model-final-select-form','children',allow_duplicate=True),
    Output("classification-proceed-output", "children", allow_duplicate=True),
    Output('classification-model-final-select-status','children',allow_duplicate=True),
    Output('classification-model-select-container','style',allow_duplicate=True),
    Output('classification-tabel-selection-scores','children',allow_duplicate=True),
    Input('classification-apply_model_selection', 'n_clicks'),
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
            ), no_update, no_update, no_update, no_update, no_update, no_update
        
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
            ), no_update, no_update, no_update, no_update, no_update, no_update
        

@callback(
    Output("classification-model-final-select-status", "children", allow_duplicate=True),
    Input('classification-apply_model_final', 'n_clicks'),
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
            
