from beanie import Document
class RawMaterial(Document):
    raw_id:str
    inventory_id:str
    raw_name:str
    itemqty:int
    costprice:float
    sellingprice:float
    class Settings:
        name='raw_materials'
