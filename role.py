from beanie import Document

class Role(Document):
    role_id: str
    company_id: str
    role_name: str

    class Settings:
        name = 'roles'
