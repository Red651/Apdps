from dash import html, register_page
from app.core.external.pages.report_functions import generate_report

register_page(__name__, path='/report/monthly', title='Monthly Progress Report')

def layout():
    layout = html.Div(
        generate_report('month'),
        id='container',
        style={'margin':15}
    )
    return layout

