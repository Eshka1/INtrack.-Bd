from beanie import Document
class SuperAdmin(Document):
    superadmin_id:str
    uname:str
    password:str
    class Settings:
        name='super_admins'
