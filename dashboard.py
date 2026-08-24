from beanie import Document
class Dashboard(Document):
    dashboard_id:str
    company_id:str
    view:str
    class Settings:
        name='dashboards'
