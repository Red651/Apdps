import dash
import dash_mantine_components as dmc
from dash import dcc
from enum import Enum
from app.core.config import settings
dash.register_page(__name__, path='/machine-learning/home')


class PageState(Enum):
    ONLINE = 'ONLINE'
    OFFLINE = 'OFFLINE'

def FeatureCard(title, image, description, go_link, predict_link, page_state: PageState):
    
    if page_state == PageState.ONLINE:
        badge = dmc.Badge("Online", color="green")
    else:
        badge = dmc.Badge("Offline", color="red")
    
    return dmc.Card(
        children=[
            dmc.CardSection(
                dmc.Image(
                    src=image,
                    h=160,
                    alt="Norway",
                )
            ),
            dmc.Group(
                [
                    dmc.Text(title, fw=500),
                    badge,
                ],
                justify="space-between",
                mt="md",
                mb="xs",
            ),
            dmc.Text(
                description,
                size="sm",
                c="dimmed",
            ),
            dmc.Anchor(
                dmc.Button(
                    "Train",
                    color="blue",
                    fullWidth=True,
                    mt="md",
                    radius="md",
                    disabled=True if page_state == PageState.OFFLINE else False
                ),
                href=go_link,
            ),
            dmc.Anchor(
                dmc.Button(
                    "Predict",
                    color="red",
                    fullWidth=True,
                    mt="md",
                    radius="md",
                    disabled=True if page_state == PageState.OFFLINE else False
                ),
                href=predict_link,
            ),
        ],
        withBorder=True,
        shadow="sm",
        radius="md",
        w=350,
    )

layout = dmc.SimpleGrid(
    [
        dmc.Center(
            [
                dmc.Stack(
                    [
                        dmc.SimpleGrid(
                            [
                                FeatureCard(
                                    title="Regression",
                                    image=dash.get_asset_url('regression.png'),
                                    description="Regression is a supervised learning task that involves predicting a continuous target variable based on one or more input features.",
                                    go_link=f'{settings.ROOT_PATH}{settings.EXTERNAL_PAGES_PATH}/machine-learning/regression',
                                    predict_link=f'{settings.ROOT_PATH}{settings.EXTERNAL_PAGES_PATH}/machine-learning/pred_regress',
                                    page_state=PageState.ONLINE
                                ),
                                FeatureCard(
                                    title="Classification",
                                    image=dash.get_asset_url('classification.png'),
                                    description="Classification is a supervised learning task that involves predicting a discrete target variable based on one or more input features.",
                                    go_link=f'{settings.ROOT_PATH}{settings.EXTERNAL_PAGES_PATH}/machine-learning/classification',
                                    predict_link=f'{settings.ROOT_PATH}{settings.EXTERNAL_PAGES_PATH}/machine-learning/pred_class',
                                    page_state=PageState.ONLINE
                                ),
                                FeatureCard(
                                    title="Clustering",
                                    image=dash.get_asset_url('clustering.png'),
                                    description="Clustering is a supervised learning task that involves grouping data points based on their similarity",
                                    go_link=f'{settings.ROOT_PATH}{settings.EXTERNAL_PAGES_PATH}/machine-learning/clusterin',
                                    predict_link=f'{settings.ROOT_PATH}{settings.EXTERNAL_PAGES_PATH}/machine-learning/pred_clus',
                                    page_state=PageState.ONLINE
                                ),
                            ],
                            cols=3,
                            w=1100
                        ),
                    ]
                )
            ],
            h=720
        )
    ],
    style={'background-image':'url("https://png.pngtree.com/png-clipart/20230906/original/pngtree-vector-mountain-topography-with-contour-lines-and-elevation-heights-vector-png-image_10932498.png")',
           'background-repeat': 'no-repeat',
           'background-size':'cover',
           'height':'100vh'}
)
