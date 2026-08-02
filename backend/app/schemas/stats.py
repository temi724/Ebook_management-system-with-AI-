from typing import List
from pydantic import BaseModel


class BookStats(BaseModel):
    """Catalogue totals. Titles are distinct books; copies are physical items,
    so a single title with 4 copies counts as 1 title and 4 copies."""
    titles: int
    total_copies: int
    available_copies: int
    borrowed_copies: int


class CategoryStat(BaseModel):
    category: str
    titles: int
    copies: int


class LoanStats(BaseModel):
    """Loan counts per status. Field names mirror LoanStatus values."""
    pending: int
    approved: int
    active: int
    return_requested: int
    returned: int
    rejected: int
    overdue: int
    total: int


class MonthlyLoanStat(BaseModel):
    month: str   # "2026-08", stable for sorting and keys
    label: str   # "Aug", for axis ticks
    count: int


class DashboardStats(BaseModel):
    books: BookStats
    categories: List[CategoryStat]
    loans: LoanStats
    monthly_loans: List[MonthlyLoanStat]
