from pydantic import BaseModel
from typing import List


class DebtItem(BaseModel):
    from_member: str
    to_member: str
    amount: float
    description: str  # e.g. "Alice owes Bob ₹250.00"


class BalanceResponse(BaseModel):
    group_id: str
    group_name: str
    members: List[str]
    debts: List[DebtItem]
    total_expenses: float
    is_settled: bool
