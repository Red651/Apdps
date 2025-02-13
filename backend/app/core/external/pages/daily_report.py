from dash import html, register_page
from app.core.external.pages.report_functions import generate_report

register_page(__name__, path='/report/daily', title='Daily Progress Report')

def layout():
    layout = html.Div(
        generate_report('day'),
        id='container',
        style={'margin':15}
    )
    return layout

