from dash import html, register_page
from app.core.external.pages.report_functions import generate_text_report

register_page(__name__, path='/report/division', title='Daily Division Report')

def layout():
    layout = html.Div(
        generate_text_report(),
        id='container',
        style={'margin':15}
    )
    return layout

