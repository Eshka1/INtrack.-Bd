from beanie import Document
class Manager(Document):
    manager_id:str
    company_id:str
    name:str
    email:str
    password:str
    class Settings:
        name='managers'
