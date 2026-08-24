from beanie import Document

class Owner(Document):
    owner_id: str
    owner_name: str
    company_id: str
    email: str

    class Settings:
        name = 'owners'
