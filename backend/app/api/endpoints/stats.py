from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.base import get_db
from app.models.book import Book
from app.models.loan import Loan, LoanStatus
from app.schemas.stats import (
    BookStats,
    CategoryStat,
    DashboardStats,
    LoanStats,
    MonthlyLoanStat,
)
from app.api.dependencies.auth import get_current_librarian

router = APIRouter()

MONTHS_OF_HISTORY = 12
_MONTH_LABELS = ("Jan", "Feb", "Mar", "Apr", "May", "Jun",
                 "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")


def _recent_months(count: int):
    """The last `count` months as (year, month), oldest first and including the
    current one. Used to pad the loan history so months with no activity still
    appear on the chart — otherwise the x-axis silently skips quiet months and
    makes the trend look continuous when it is not."""
    now = datetime.utcnow()
    total = now.year * 12 + (now.month - 1)
    return [divmod(total - offset, 12) for offset in range(count - 1, -1, -1)]


@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_librarian),
):
    """Aggregate library statistics for the staff dashboard.

    Restricted to librarians and admins: it exposes catalogue-wide and
    borrowing totals that individual users have no business reading.
    """
    # ── Catalogue totals ────────────────────────────────────────────────
    # Aggregate in SQL rather than loading every book; the catalogue is the
    # largest table here and this endpoint runs on every dashboard open.
    titles, total_copies, available_copies = db.query(
        func.count(Book.id),
        func.coalesce(func.sum(Book.total_copies), 0),
        func.coalesce(func.sum(Book.available_copies), 0),
    ).filter(Book.is_active == True).one()

    total_copies = int(total_copies or 0)
    available_copies = int(available_copies or 0)

    books = BookStats(
        titles=int(titles or 0),
        total_copies=total_copies,
        available_copies=available_copies,
        # Clamped at zero: available_copies is maintained by the loan flow and a
        # bad manual edit could push it above total_copies, which would surface
        # here as a negative "borrowed" figure.
        borrowed_copies=max(0, total_copies - available_copies),
    )

    # ── Titles per category ─────────────────────────────────────────────
    category_rows = (
        db.query(
            Book.category,
            func.count(Book.id),
            func.coalesce(func.sum(Book.total_copies), 0),
        )
        .filter(Book.is_active == True)
        .group_by(Book.category)
        .order_by(func.count(Book.id).desc())
        .all()
    )
    categories = [
        CategoryStat(
            category=row[0] or "Uncategorised",
            titles=int(row[1]),
            copies=int(row[2] or 0),
        )
        for row in category_rows
    ]

    # ── Loans by status ─────────────────────────────────────────────────
    status_counts = dict(
        db.query(Loan.status, func.count(Loan.id)).group_by(Loan.status).all()
    )

    def count_for(loan_status: LoanStatus) -> int:
        # Status may come back as the enum or its raw string depending on how the
        # row was written, so check both rather than assuming one form.
        return int(
            status_counts.get(loan_status)
            or status_counts.get(loan_status.value)
            or 0
        )

    loans = LoanStats(
        pending=count_for(LoanStatus.PENDING),
        approved=count_for(LoanStatus.APPROVED),
        active=count_for(LoanStatus.ACTIVE) + count_for(LoanStatus.RENEWED),
        return_requested=count_for(LoanStatus.RETURN_REQUESTED),
        returned=count_for(LoanStatus.RETURNED),
        rejected=count_for(LoanStatus.REJECTED),
        overdue=count_for(LoanStatus.OVERDUE),
        total=sum(int(v) for v in status_counts.values()),
    )

    # ── Loan requests per month ─────────────────────────────────────────
    months = _recent_months(MONTHS_OF_HISTORY)
    oldest_year, oldest_month = months[0]
    cutoff = datetime(oldest_year, oldest_month + 1, 1)

    monthly_rows = (
        db.query(
            func.extract("year", Loan.created_at),
            func.extract("month", Loan.created_at),
            func.count(Loan.id),
        )
        .filter(Loan.created_at >= cutoff)
        .group_by(
            func.extract("year", Loan.created_at),
            func.extract("month", Loan.created_at),
        )
        .all()
    )
    counts_by_month = {(int(y), int(m) - 1): int(c) for y, m, c in monthly_rows}

    monthly_loans = [
        MonthlyLoanStat(
            month=f"{year}-{month + 1:02d}",
            label=_MONTH_LABELS[month],
            count=counts_by_month.get((year, month), 0),
        )
        for year, month in months
    ]

    return DashboardStats(
        books=books,
        categories=categories,
        loans=loans,
        monthly_loans=monthly_loans,
    )
