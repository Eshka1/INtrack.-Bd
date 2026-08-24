from beanie import Document

class ClientRequirement(Document):
    requirement_id: str
    client_id: str
    product_name: str
    per_piece_req: float

    class Settings:
        name = 'client_requirements'
