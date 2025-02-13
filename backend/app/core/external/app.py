from os import path
from flask import Flask
import dash
from dash import dcc, html, Output, Input, callback
import dash_mantine_components as dmc
from datetime import datetime
import os

if __name__ == "__main__":
    import sys
    import os
    parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
    sys.path[0] = parent_dir
    requests_pathname_prefix = None

from app.core.external.utils.session_funcs import clear_sessions
from app.core.config import settings

requests_pathname_prefix = f'{settings.ROOT_PATH}{settings.EXTERNAL_PAGES_PATH}/'

if __name__ == "__main__":
    requests_pathname_prefix = None

dash._dash_renderer._set_react_version("18.2.0")

# stylesheets = [
#     "https://unpkg.com/@mantine/dates@7/styles.css",
#     "https://unpkg.com/@mantine/code-highlight@7/styles.css",
#     "https://unpkg.com/@mantine/charts@7/styles.css",
#     "https://unpkg.com/@mantine/carousel@7/styles.css",
#     "https://unpkg.com/@mantine/notifications@7/styles.css",
#     "https://unpkg.com/@mantine/nprogress@7/styles.css",
# ]

stylesheets = [
    "app/static/external_stylesheet/dates-styles.css",
    "app/static/external_stylesheet/code-highlight-styles.css",
    "app/static/external_stylesheet/charts-styles.css",
    "app/static/external_stylesheet/carousel-styles.css",
    "app/static/external_stylesheet/notification-styles.css",
    "app/static/external_stylesheet/nprogress-styles.css",
]

import os
assets_path = os.getcwd() +'/app/core/external/assets'

server = Flask(__name__)

server.secret_key = settings.SECRET_KEY

external_app = dash.Dash(
    __name__, 
    server=server,
    use_pages=True,
    suppress_callback_exceptions=True, 
    external_stylesheets=stylesheets, 
    update_title=None,
    requests_pathname_prefix=requests_pathname_prefix,
    assets_folder=assets_path
)

external_app.scripts.config.serve_locally = True
external_app.css.config.serve_locally = True

external_app.title = 'External'

external_app.index_string = '''
<!DOCTYPE html>
<html>
    <head>
        {%metas%}
        <title>{%title%}</title>
        {%css%}
    </head>
    <body>
        {%app_entry%}
        <footer>
            {%config%}
            {%scripts%}
            {%renderer%}
        </footer>
    </body>
</html>
'''

external_app.layout = dmc.MantineProvider(
    [
        dcc.Location(id='url', refresh=False),
        # html.Div(
        #     apdps_map.layout(),
        #     id='page-container',
        # ),
        dash.page_container
    ],
)

# @callback(
#     Output('page-container', 'children'),
#     Input('url', 'pathname'),
# )
# def display_page(pathname):
#     if '/map' in pathname:
#         external_app.title = 'ApDPS Map'
#         return apdps_map.layout()
#     elif '/report' in pathname:
#         external_app.title = 'Report'
#         return report.layout
#     else:
#         return html.Div('Not Found')

# @server.route("/external")
# def external():
#     external_app.title = "External"
#     return external_app.index()

# @server.route("/external/<path>")
# def map_report(path):
#     if path =='map':
#         external_app.title = 'ApDPS Map'
#     elif path == 'report':
#         external_app.title = f'Report {datetime.now().strftime("%d %b %Y %H:%M")}'
#     return external_app.index()

os.makedirs('app/core/external/sessions', exist_ok=True)
clear_sessions()

if __name__ == "__main__":
    external_app.run(debug=True)
    
