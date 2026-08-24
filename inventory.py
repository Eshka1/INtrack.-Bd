from beanie import Document
class Inventory(Document):
    inventory_id:str
    company_id:str
    field:str
    materials:list
    class Settings:
        name='inventories'
