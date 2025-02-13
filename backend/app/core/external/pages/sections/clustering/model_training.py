from dash_pydantic_form import ModelForm, fields
from pydantic import BaseModel, Field
from typing import Optional, Literal
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from dash import Input, Output, callback, html, State, dcc, no_update
import dash_mantine_components as dmc
from app.core.external.pages.sections.clustering.utils import parse_validation_errors, session_get_file_path, session_json_to_dict, session_save_model,reset_button, continue_button, session_schema_load, session_schema_save
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
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering, kmeans_plusplus
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score, davies_bouldin_score, calinski_harabasz_score
from sklearn.metrics import silhouette_samples, silhouette_score, davies_bouldin_score, calinski_harabasz_score
from pyclustering.cluster import cluster_visualizer
from pyclustering.cluster.xmeans import xmeans

alert_model = dmc.Alert(
                'DBSCANS and Agglomerative Clustering doesnt have abilities to Predict New Data with Same Criteria as before, use K-means or X-means Instead',
                color="orange",
                variant="filled",
                withCloseButton=True
                )


class ModelTrainingSchema(BaseModel):
    # Clustering model parameters
    # General clustering model parameters
    ml_model_type: Literal["kmeans", "dbscan", "agglomerative",'xmeans'] = Field(..., description="Type of clustering model to train.")
    
    # Parameters for KMeans
    n_clusters: Optional[int] = Field(3, description="Number of clusters for KMeans and Agglomerative Clustering.")
    init: Optional[Literal["k-means++", "random"]] = Field("k-means++", description="Method for initialization (for KMeans).")
    n_init: Optional[int] = Field(10, description="Number of time the k-means algorithm will be run with different centroid seeds (for KMeans).")
    max_iter: Optional[int] = Field(300, description="Maximum number of iterations for a single run (for KMeans).")

    # Parameters for DBSCAN
    eps: Optional[float] = Field(0.5, description="The maximum distance between two samples for them to be considered as in the same neighborhood (for DBSCAN).")
    min_samples: Optional[int] = Field(5, description="The number of samples (or total weight) in a neighborhood for a point to be considered a core point (for DBSCAN).")

    # Parameters for Agglomerative Clustering
    affinity: Optional[Literal["euclidean", "l1", "l2", "manhattan", "cosine"]] = Field("euclidean", description="Metric used to compute the linkage (for Agglomerative Clustering).")
    linkage: Optional[Literal["ward", "complete", "average", "single"]] = Field("ward", description="Linkage criterion to use (for Agglomerative Clustering).")

    # Visualization parameters
    show_centers: bool = Field(False, description="Whether to show the cluster centers in the plot (for KMeans).")

    # Evaluation parameters
    metrics: Literal["silhouette", "davies_bouldin", "calinski_harabasz"] = Field(
        default_factory=list, description="List of clustering evaluation metrics to compute."
    )
    space_train: Literal['pca','original'] = Field(
        description='Space',
        default='original'
    )

class XmeansModel:
    def __init__(self, centroids):
        self.centroids = np.array(centroids)
    
    def predict(self, data):
        if type(data) != np.ndarray:
            data = np.array(data)
        distances = np.linalg.norm(data[:, np.newaxis] - self.centroids, axis=2)
        labels = np.argmin(distances, axis=1)
        return labels
    
def convert_pca(features_df: pd.DataFrame):
    pca = PCA(n_components = 2)
    new_feature = pca.fit_transform(features_df)
    features_df = pd.DataFrame(new_feature,columns=['PC1','PC2'])
    return features_df, pca


def train_clustering_model(features_df: pd.DataFrame, schema: ModelTrainingSchema):
    
    if schema['space_train'] == 'pca':
        features_df, pca = convert_pca(features_df)
    else:
        pca = None

    if schema['ml_model_type'] == "kmeans":
        model = KMeans(
            n_clusters=schema['n_clusters'],
            init=schema['init'],
            n_init=schema['n_init'],
            max_iter=schema['max_iter'],
            random_state=42
        )
    elif schema['ml_model_type'] == "dbscan":
        model = DBSCAN(
            eps=schema['eps'],
            min_samples=schema['min_samples']
        )
    elif schema['ml_model_type'] == "agglomerative":
        model = AgglomerativeClustering(
            n_clusters=schema['n_clusters'],
            metric=schema['affinity'],
            linkage=schema['linkage']
        )
    elif schema['ml_model_type'] == 'xmeans':
        initial_centers, indices = kmeans_plusplus(features_df.values, n_clusters=2, random_state=42)
        xmeans_instance = xmeans(features_df.values, initial_centers)
        xmeans_instance.process()
        clusters = xmeans_instance.get_clusters()
        centers = xmeans_instance.get_centers()
        cluster_labels = np.zeros(features_df.shape[0])
        for i in range(0,len(clusters)):
            cluster_labels[clusters[i]] = i
        model = XmeansModel(centers)
    else:
        raise ValueError(f"Unsupported clustering model type: {schema['model_type']}")

    if schema['ml_model_type'] != 'xmeans':
        cluster_labels = model.fit_predict(features_df)

    # Step 2: Evaluate the clustering results using specified metrics
    evaluation_results = {}

    print(np.unique(cluster_labels))
    if len(np.unique(cluster_labels)) > 1:
        if "silhouette" in schema['metrics']:
            silhouette_avg = silhouette_score(features_df, cluster_labels)
            evaluation_results["silhouette_score"] = silhouette_avg
        if "davies_bouldin" in schema['metrics']:
            davies_bouldin = davies_bouldin_score(features_df, cluster_labels)
            evaluation_results["davies_bouldin_score"] = davies_bouldin
        if "calinski_harabasz" in schema['metrics']:
            calinski_harabasz = calinski_harabasz_score(features_df, cluster_labels)
            evaluation_results["calinski_harabasz_score"] = calinski_harabasz
    else:
        evaluation_results["silhouette_score"] = 'Cannot find the pattern on Data or Criteria of Model too strict'
        evaluation_results["davies_bouldin_score"] = 'Cannot find the pattern on Data or Criteria of Model too strict'
        evaluation_results["calinski_harabasz_score"] = 'Cannot find the pattern on Data or Criteria of Model too strict'

    # Step 3: Create the visualizations
    visualizations = {}

    # Scatter plot showing clusters
    features_df['Cluster'] = cluster_labels
    if schema['space_train'] == 'original':
        plot_df, pca = convert_pca(features_df[features_df.columns[:-1]])
        plot_df['Labeled Cluster'] = cluster_labels
    else:
        plot_df = features_df.copy()
        plot_df['Labeled Cluster'] = cluster_labels
    # fig = px.scatter(features_df, x=schema.x_axis, y=schema.y_axis, color='Cluster',
    #                  title='Cluster Scatter Plot', labels={'color': 'Cluster'}, template='plotly_white')
    fig = px.scatter(
        plot_df,
        x='PC1',
        y='PC2',
        color='Labeled Cluster',
        title=f'Scatter Plot with Cluster on PCA 2D Space',
        labels={'color': 'Cluster'},
    )

    # Update layout for better visualization
    fig.update_layout(
        xaxis_title='PC1',
        yaxis_title='PC2',
        legend_title='Cluster',
        template='simple_white'
    )
    visualizations['cluster_scatter'] = fig

    print(features_df['Cluster'].unique())
    # Silhouette plot if applicable
    if "silhouette" in schema['metrics'] and len(features_df['Cluster'].unique()) > 1:
        silhouette_vals = silhouette_samples(features_df.drop(columns=['Cluster']), cluster_labels)
        fig_silhouette = go.Figure()
        y_lower = 0

        for i in range(len(set(cluster_labels))):
            ith_cluster_silhouette_values = silhouette_vals[cluster_labels == i]
            ith_cluster_silhouette_values.sort()
            size_cluster_i = ith_cluster_silhouette_values.shape[0]
            y_upper = y_lower + size_cluster_i

            fig_silhouette.add_trace(
                go.Bar(
                    x=ith_cluster_silhouette_values,
                    y=np.arange(y_lower, y_upper),
                    orientation='h',
                    name=f'Cluster {i}'
                )
            )
            y_lower = y_upper

        fig_silhouette.add_trace(go.Scatter(x=[silhouette_avg, silhouette_avg], y=[0, len(silhouette_vals)],
                                            mode='lines', line=dict(color='red', dash='dash'), name='Average Silhouette'))
        fig_silhouette.update_layout(title='Silhouette Plot', xaxis_title='Silhouette Coefficient Values', yaxis_title='Samples', template='simple_white')
        visualizations['silhouette_plot'] = fig_silhouette

    return model, evaluation_results, visualizations, pca

def layout():
    
    df = pd.read_csv(session_get_file_path('preprocessed', extension='csv'), index_col=0)

    form = ModelForm(
        ModelTrainingSchema,
        "model_selection",
        "main",
        fields_repr={
            "ml_model_type": fields.Select(
                options_labels={"kmeans": "K-Means", "dbscan": "DBSCAN", "agglomerative": "Agglomerative",'xmeans':'X-means'},
                description="Type of clustering model to train", required=True),
            "n_clusters":{
                "visible": ("ml_model_type", "in", ["kmeans",'agglomerative']),
            },
            "init":{
                "visible": ("ml_model_type", "==", "kmeans"),
            },
            "n_init":{
                "visible": ("ml_model_type", "==", "kmeans"),
            },
            "max_iter":{
                "visible": ("ml_model_type", "==", "kmeans"),
            },
            "eps":{
                "visible": ("ml_model_type", "==", "dbscan"),
            },
            "min_samples":{
                "visible": ("ml_model_type", "==", "dbscan"),
            },
            "affinity":{
                "visible": ("ml_model_type", "==", "agglomerative"),
            },
            "linkage":{
                "visible": ("ml_model_type", "==", "agglomerative"),
            },
            "show_centers":{
                "visible": ("ml_model_type", "==", "kmeanss"),
            },
            "space_train": fields.Select(
                options_labels={'pca':'PCA 2D Space','original':'Original Space'},
                description='Space of Model to be Train'
            ),
            "metrics": fields.MultiSelect(description="METRICS to evaluate the model", required=True),
        },
    )

    layout = dmc.Stack(
        [
            form,
            dmc.Button("Apply", color="blue", id='clustering-apply_model_selection', n_clicks=0),
            dcc.Loading(type='circle',id='clustering-loading-placeholder',style={"width": "80px", "height": "80px"}),
            html.Div(id="clustering-model-selection-output"),
            html.Div(id='clustering-alert-model'),
            dmc.Group(
                [
                    reset_button,
                    html.Div(
                        id='clustering-proceed-output',
                    )
                ],
                justify="space-between",
            )
        ]
    )
    
    return layout

@callback(
    Output("clustering-model-selection-output", "children"),
    Output("clustering-loading-placeholder","children"),
    Output("clustering-proceed-output", "children", allow_duplicate=True),
    Output('clustering-alert-model','children',allow_duplicate=True),
    Input('clustering-apply_model_selection', 'n_clicks'),
    State(ModelForm.ids.main("model_selection", 'main'), "data"),
    prevent_initial_call = True
)
def apply_model_training(n_clicks, form_data):
    if n_clicks > 0:
        
        # try:
        # feature_selection_dict = session_json_to_dict('feature_selection')
        df = pd.read_csv(session_get_file_path('feature_selected', extension='csv'), index_col=0)

        model, scores, visualizations, pca = train_clustering_model(df, form_data)

        dict_schema = session_schema_load()
        dict_schema['space'] = form_data['space_train']
        dict_schema['model'] = model

        if dict_schema['space'] == 'pca':
            dict_schema['pca'] = pca
        
        session_schema_save(dict_schema)
        
        visualizations = [dcc.Graph(figure=figure) for figure in visualizations.values()]
        
        session_save_model(model, 'model')

        if isinstance(model, AgglomerativeClustering) or isinstance(model,DBSCAN):
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
                    dmc.SimpleGrid(visualizations, cols=len(visualizations)),
                ]
            ), "", continue_button, alert_model

        else:
            
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
                    dmc.SimpleGrid(visualizations, cols=len(visualizations)),
                ]
            ), "", continue_button, ""
            
            
        # except ValidationError as exc:
        #     return html.Div(
        #         [
        #             dmc.Alert(
        #                 parse_validation_errors(exc),
        #                 color="red",
        #                 variant="filled",
        #                 withCloseButton=True
        #             )
        #         ]
        #     ), no_update
        
        # except Exception as exc:
        #     return html.Div(
        #         [
        #             dmc.Alert(
        #                 "There was an error applying model training.",
        #                 color="red",
        #                 variant="filled",
        #                 withCloseButton=True
        #             )
        #         ]
        #     ), no_update
