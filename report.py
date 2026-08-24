from beanie import Document
class Report(Document):
    report_id:str
    company_id:str
    class Settings:
        name='reports'
