from pydantic import BaseModel, Field
from typing import List
from bson import ObjectId


class GroupCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Group name")
    members: List[str] = Field(..., min_items=1, description="List of member names")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Weekend Trip",
                "members": ["Alice", "Bob", "Charlie"]
            }
        }


class GroupResponse(BaseModel):
    id: str
    name: str
    members: List[str]

    class Config:
        json_schema_extra = {
            "example": {
                "id": "64b8f9a2e4b0c3d1f5e6a7b8",
                "name": "Weekend Trip",
                "members": ["Alice", "Bob", "Charlie"]
            }
        }
