from fastapi import APIRouter, HTTPException
from bson import ObjectId
from app.db.database import get_database
from app.schemas.balance import BalanceResponse
from app.services.balance_service import compute_balances

router = APIRouter(prefix="/balances", tags=["Balances"])


@router.get("/{group_id}", response_model=BalanceResponse)
async def get_balances(group_id: str):
    """
    Dynamically compute balances for a group.
    Balances are NEVER stored in the database — always recalculated on request.
    """
    db = get_database()

    if not ObjectId.is_valid(group_id):
        raise HTTPException(status_code=400, detail="Invalid group_id format.")

    group = await db["groups"].find_one({"_id": ObjectId(group_id)})
    if not group:
        raise HTTPException(status_code=404, detail=f"Group '{group_id}' not found.")

    # Fetch all expenses for the group
    expenses = []
    async for exp in db["expenses"].find({"group_id": group_id}):
        expenses.append(exp)

    total_expenses = sum(e["amount"] for e in expenses)
    debts = compute_balances(expenses)

    return BalanceResponse(
        group_id=group_id,
        group_name=group["name"],
        members=group["members"],
        debts=debts,
        total_expenses=round(total_expenses, 2),
        is_settled=len(debts) == 0,
    )
