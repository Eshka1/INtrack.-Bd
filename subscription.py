from beanie import Document
class Subscription(Document):
    subscription_id:str
    plan_name:str
    start_date:str
    monthly_price:float
    yearly_price:float
    class Settings:
        name='subscriptions'
