from bson import ObjectId
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from app.models.group import PyObjectId


class ExpenseModel(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    group_id: str
    description: Optional[str] = ""
    amount: float
    paid_by: str
    participants: List[str]
    split_type: Literal["equal"] = "equal"

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
