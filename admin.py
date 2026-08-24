from beanie import Document
class Admin(Document):
    admin_id:str
    username:str
    password:str
    class Settings:
        name='admins'
