from fastapi import APIRouter, HTTPException, status
from app.db.database import get_database
from app.schemas.group import GroupCreate, GroupResponse

router = APIRouter(prefix="/groups", tags=["Groups"])


@router.post("/", response_model=GroupResponse, status_code=status.HTTP_201_CREATED)
async def create_group(payload: GroupCreate):
    """Create a new expense-splitting group."""
    db = get_database()

    # Deduplicate and strip member names
    unique_members = list({m.strip() for m in payload.members if m.strip()})
    if not unique_members:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one valid member name is required.",
        )

    group_doc = {
        "name": payload.name.strip(),
        "members": unique_members,
    }

    result = await db["groups"].insert_one(group_doc)
    created = await db["groups"].find_one({"_id": result.inserted_id})

    return GroupResponse(
        id=str(created["_id"]),
        name=created["name"],
        members=created["members"],
    )


@router.get("/{group_id}", response_model=GroupResponse)
async def get_group(group_id: str):
    """Fetch a single group by its ID."""
    from bson import ObjectId

    db = get_database()
    if not ObjectId.is_valid(group_id):
        raise HTTPException(status_code=400, detail="Invalid group ID format.")

    group = await db["groups"].find_one({"_id": ObjectId(group_id)})
    if not group:
        raise HTTPException(status_code=404, detail=f"Group '{group_id}' not found.")

    return GroupResponse(
        id=str(group["_id"]),
        name=group["name"],
        members=group["members"],
    )


@router.get("/", response_model=list[GroupResponse])
async def list_groups():
    """List all groups."""
    db = get_database()
    groups = []
    async for grp in db["groups"].find():
        groups.append(GroupResponse(
            id=str(grp["_id"]),
            name=grp["name"],
            members=grp["members"],
        ))
    return groups
