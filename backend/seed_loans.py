"""Seed sample loan history so the staff dashboard charts have something to show.

Spreads requests across the last 12 months with a realistic mix of statuses, and
decrements available_copies for loans that are still out so the "Borrowed" tile
agrees with the catalogue.

Demo data only — safe to skip in a real deployment.

    Windows:  venv311\\Scripts\\python seed_loans.py
    macOS:    ./venv311/bin/python seed_loans.py

Re-running deletes the loans it previously created (marked in notes) and rebuilds
them, so the numbers stay stable instead of compounding.
"""
import random
from datetime import datetime, timedelta

from app.db.base import Base, SessionLocal, engine
from app.models import book, loan, reading_history, user  # noqa: F401  (register mappers)
from app.models.book import Book
from app.models.loan import Loan, LoanStatus
from app.models.user import User

MARKER = "[demo-seed]"
MONTHS = 12
LOANS_PER_MONTH = (3, 9)          # inclusive range, randomised per month
LOAN_PERIOD_DAYS = 14

# Older months are settled; recent months still have live loans. Weighted so the
# mix looks like a working library rather than a uniform spread.
SETTLED_STATUSES = [LoanStatus.RETURNED] * 7 + [LoanStatus.REJECTED] * 2 + [LoanStatus.OVERDUE]
RECENT_STATUSES = [LoanStatus.APPROVED] * 4 + [LoanStatus.PENDING] * 3 + \
                  [LoanStatus.RETURNED] * 2 + [LoanStatus.OVERDUE]

# Loans in these states still hold a copy off the shelf.
HOLDS_A_COPY = {LoanStatus.APPROVED, LoanStatus.ACTIVE, LoanStatus.RENEWED,
                LoanStatus.OVERDUE, LoanStatus.RETURN_REQUESTED}


def month_starts(count):
    """First day of each of the last `count` months, oldest first."""
    now = datetime.utcnow()
    total = now.year * 12 + (now.month - 1)
    out = []
    for offset in range(count - 1, -1, -1):
        year, month = divmod(total - offset, 12)
        out.append(datetime(year, month + 1, 1))
    return out


def main():
    Base.metadata.create_all(bind=engine)
    random.seed(42)  # stable demo data across runs
    db = SessionLocal()
    try:
        borrowers = db.query(User).filter(User.role.in_(["student", "faculty"])).all()
        if not borrowers:
            print("No student or faculty users found. Register one first, then re-run.")
            return

        books = db.query(Book).filter(Book.is_active == True).all()
        if not books:
            print("No books found. Run seed_books.py (or seed_books.sql) first.")
            return

        # Clear previously seeded loans and give their copies back.
        old = db.query(Loan).filter(Loan.notes.like(f"{MARKER}%")).all()
        for existing in old:
            if existing.status in HOLDS_A_COPY and existing.book:
                existing.book.available_copies = min(
                    existing.book.total_copies, existing.book.available_copies + 1
                )
            db.delete(existing)
        db.flush()

        created = 0
        now = datetime.utcnow()

        for index, start in enumerate(month_starts(MONTHS)):
            is_recent = index >= MONTHS - 2
            for _ in range(random.randint(*LOANS_PER_MONTH)):
                requested = start + timedelta(
                    days=random.randint(0, 26), hours=random.randint(8, 18)
                )
                if requested > now:
                    continue

                chosen = random.choice(books)
                status = random.choice(RECENT_STATUSES if is_recent else SETTLED_STATUSES)

                # Only hand out a copy that actually exists.
                if status in HOLDS_A_COPY:
                    if chosen.available_copies < 1:
                        status = LoanStatus.RETURNED
                    else:
                        chosen.available_copies -= 1

                due = requested + timedelta(days=LOAN_PERIOD_DAYS)
                if status == LoanStatus.OVERDUE:
                    due = min(due, now - timedelta(days=random.randint(1, 20)))

                db.add(Loan(
                    user_id=random.choice(borrowers).id,
                    book_id=chosen.id,
                    loan_date=requested,
                    due_date=due,
                    return_date=(requested + timedelta(days=random.randint(3, LOAN_PERIOD_DAYS))
                                 if status == LoanStatus.RETURNED else None),
                    status=status,
                    notes=f"{MARKER} sample loan",
                    created_at=requested,
                    updated_at=requested,
                ))
                created += 1

        db.commit()
        total = db.query(Loan).count()
        print(f"Removed {len(old)} previously seeded loans, created {created}.")
        print(f"Loans in database: {total}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
