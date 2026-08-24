from beanie import Document

class Client(Document):
    id: str
    name: str

    class Settings:
        name = 'clients'
