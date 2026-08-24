from beanie import Document
class BalanceSheet(Document):
    balance_id:str
    company_id:str
    date:str
    class Settings:
        name='balance_sheets'
