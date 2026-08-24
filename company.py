from beanie import Document
class Company(Document):
    company_id:str
    company_name:str
    uid:str
    password:str
    subscription_id:str
    class Settings:
        name='companies'
