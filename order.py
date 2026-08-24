from beanie import Document
class Order(Document):
    order_id:str
    company_id:str
    order_date:str
    order_status:str
    class Settings:
        name='orders'
