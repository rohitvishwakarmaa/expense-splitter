from fastapi import APIRouter, HTTPException, status
from bson import ObjectId
from app.db.database import get_database
from app.schemas.expense import ExpenseCreate, ExpenseResponse

router = APIRouter(prefix="/expenses", tags=["Expenses"])


@router.post("/", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
async def add_expense(payload: ExpenseCreate):
    """Add an expense to a group."""
    db = get_database()

    # Validate group exists
    if not ObjectId.is_valid(payload.group_id):
        raise HTTPException(status_code=400, detail="Invalid group_id format.")

    group = await db["groups"].find_one({"_id": ObjectId(payload.group_id)})
    if not group:
        raise HTTPException(status_code=404, detail=f"Group '{payload.group_id}' not found.")

    # Validate all participants belong to the group
    group_members = set(group["members"])
    invalid = [p for p in payload.participants if p not in group_members]
    if invalid:
        raise HTTPException(
            status_code=400,
            detail=f"Participants not in group: {invalid}. Group members: {list(group_members)}",
        )

    if payload.paid_by not in group_members:
        raise HTTPException(
            status_code=400,
            detail=f"paid_by '{payload.paid_by}' is not a member of the group.",
        )

    expense_doc = {
        "group_id": payload.group_id,
        "description": payload.description or "",
        "amount": payload.amount,
        "paid_by": payload.paid_by,
        "participants": payload.participants,
        "split_type": payload.split_type,
    }

    result = await db["expenses"].insert_one(expense_doc)
    created = await db["expenses"].find_one({"_id": result.inserted_id})

    return ExpenseResponse(
        id=str(created["_id"]),
        group_id=created["group_id"],
        description=created.get("description", ""),
        amount=created["amount"],
        paid_by=created["paid_by"],
        participants=created["participants"],
        split_type=created["split_type"],
    )


@router.get("/group/{group_id}", response_model=list[ExpenseResponse])
async def get_expenses_by_group(group_id: str):
    """Fetch all expenses for a group."""
    db = get_database()
    if not ObjectId.is_valid(group_id):
        raise HTTPException(status_code=400, detail="Invalid group_id format.")

    expenses = []
    async for exp in db["expenses"].find({"group_id": group_id}):
        expenses.append(ExpenseResponse(
            id=str(exp["_id"]),
            group_id=exp["group_id"],
            description=exp.get("description", ""),
            amount=exp["amount"],
            paid_by=exp["paid_by"],
            participants=exp["participants"],
            split_type=exp["split_type"],
        ))
    return expenses
