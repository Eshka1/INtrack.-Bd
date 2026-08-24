from beanie import Document
class Expenses(Document):
    expense_id:str
    company_id:str
    expense_name:str
    money:float
    class Settings:
        name='expenses'
