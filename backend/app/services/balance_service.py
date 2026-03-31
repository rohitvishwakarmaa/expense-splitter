"""
Balance Calculation Service
===========================
Core business logic for computing who owes whom.

Algorithm:
1. Compute each person's net balance across all expenses.
   net[person] = total_paid - total_owed
2. Positive net → person is owed money (creditor)
3. Negative net → person owes money (debtor)
4. Use a greedy min-cash-flow approach to minimise the number of transactions.
"""

from typing import List, Dict, Tuple
from app.schemas.balance import DebtItem


def calculate_net_balances(expenses: List[dict]) -> Dict[str, float]:
    """
    Compute net balance for every participant across all expenses.
    Returns a dict: {member_name: net_amount}
    Positive → they are owed money.  Negative → they owe money.
    """
    net: Dict[str, float] = {}

    for expense in expenses:
        amount: float = expense["amount"]
        paid_by: str = expense["paid_by"]
        participants: List[str] = expense["participants"]
        split_type: str = expense.get("split_type", "equal")

        if split_type == "equal" and participants:
            share = round(amount / len(participants), 2)
        else:
            # Fallback — should not happen given schema validation
            share = round(amount / len(participants), 2)

        # Payer receives credit for the full amount
        net[paid_by] = net.get(paid_by, 0.0) + amount

        # Every participant (including payer) owes their share
        for participant in participants:
            net[participant] = net.get(participant, 0.0) - share

    # Round to 2 decimal places to avoid floating-point drift
    return {k: round(v, 2) for k, v in net.items()}


def minimize_transactions(net_balances: Dict[str, float]) -> List[DebtItem]:
    """
    Greedy algorithm to minimise the number of debt transactions.
    Pairs the largest debtor with the largest creditor iteratively.
    """
    debts: List[DebtItem] = []

    # Separate into creditors (positive) and debtors (negative)
    creditors: List[Tuple[str, float]] = sorted(
        [(name, amount) for name, amount in net_balances.items() if amount > 0.01],
        key=lambda x: x[1],
        reverse=True,
    )
    debtors: List[Tuple[str, float]] = sorted(
        [(name, abs(amount)) for name, amount in net_balances.items() if amount < -0.01],
        key=lambda x: x[1],
        reverse=True,
    )

    c_idx = 0
    d_idx = 0

    while c_idx < len(creditors) and d_idx < len(debtors):
        creditor_name, credit = creditors[c_idx]
        debtor_name, debt = debtors[d_idx]

        settled = round(min(credit, debt), 2)

        debts.append(
            DebtItem(
                from_member=debtor_name,
                to_member=creditor_name,
                amount=settled,
                description=f"{debtor_name} owes {creditor_name} ₹{settled:.2f}",
            )
        )

        creditors[c_idx] = (creditor_name, round(credit - settled, 2))
        debtors[d_idx] = (debtor_name, round(debt - settled, 2))

        if creditors[c_idx][1] <= 0.01:
            c_idx += 1
        if debtors[d_idx][1] <= 0.01:
            d_idx += 1

    return debts


def compute_balances(expenses: List[dict]) -> List[DebtItem]:
    """
    Public entry point: given raw expense dicts return a list of DebtItems.
    """
    net = calculate_net_balances(expenses)
    return minimize_transactions(net)
