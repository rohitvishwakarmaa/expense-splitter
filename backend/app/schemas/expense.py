from pydantic import BaseModel, Field, validator
from typing import List, Optional, Literal


class ExpenseCreate(BaseModel):
    group_id: str = Field(..., description="ID of the group this expense belongs to")
    description: Optional[str] = Field("", max_length=200)
    amount: float = Field(..., gt=0, description="Total expense amount (must be > 0)")
    paid_by: str = Field(..., min_length=1, description="Name of the person who paid")
    participants: List[str] = Field(..., min_items=1, description="List of participants sharing this expense")
    split_type: Literal["equal"] = Field("equal", description="Split type — currently only 'equal' is supported")

    @validator("participants")
    def paid_by_must_be_participant(cls, participants, values):
        paid_by = values.get("paid_by")
        if paid_by and paid_by not in participants:
            raise ValueError(f"paid_by '{paid_by}' must be in participants list")
        return participants

    class Config:
        json_schema_extra = {
            "example": {
                "group_id": "64b8f9a2e4b0c3d1f5e6a7b8",
                "description": "Dinner at restaurant",
                "amount": 1500.0,
                "paid_by": "Alice",
                "participants": ["Alice", "Bob", "Charlie"],
                "split_type": "equal"
            }
        }


class ExpenseResponse(BaseModel):
    id: str
    group_id: str
    description: Optional[str]
    amount: float
    paid_by: str
    participants: List[str]
    split_type: str
