"""Pre-demo setup check.

Verifies that everything the API needs at runtime is actually usable — not just
installed. Several failures here are silent in normal operation: a broken AI
import or an empty catalogue still serves recommendations, just poor ones.

Run with the project venv:
    Windows:  venv311\\Scripts\\python verify_setup.py
    macOS:    ./venv311/bin/python verify_setup.py
"""
import importlib
import sys

OK, FAIL, WARN = "[ OK ]", "[FAIL]", "[WARN]"

failures = []
warnings = []


def check(label, fn, fatal=True):
    try:
        detail = fn()
    except Exception as e:
        marker = FAIL if fatal else WARN
        (failures if fatal else warnings).append(label)
        print(f"{marker} {label}: {type(e).__name__}: {e}")
        return False
    print(f"{OK} {label}" + (f" — {detail}" if detail else ""))
    return True


print(f"\nPython {sys.version.split()[0]} at {sys.executable}\n")

# --- Core web/database stack -------------------------------------------------
print("Core dependencies")
for mod in ("fastapi", "uvicorn", "sqlalchemy", "pymysql", "pydantic",
            "pydantic_settings", "jose", "passlib", "qrcode"):
    check(mod, lambda m=mod: getattr(importlib.import_module(m), "__version__", ""))

# --- AI stack ----------------------------------------------------------------
# These are optional by design (recommendation_service falls back to popularity
# ranking), so a failure here is a warning — but it means no semantic search.
print("\nAI dependencies (optional — fallback is popularity ranking)")
ai_ok = all([
    check("langchain", lambda: importlib.import_module("langchain").__version__, fatal=False),
    check("langchain_community", lambda: importlib.import_module("langchain_community") and "", fatal=False),
    check("chromadb", lambda: importlib.import_module("chromadb").__version__, fatal=False),
    check("sentence_transformers",
          lambda: importlib.import_module("sentence_transformers").__version__, fatal=False),
])


def ai_flag():
    from app.services.recommendation_service import AI_DEPENDENCIES_AVAILABLE
    if not AI_DEPENDENCIES_AVAILABLE:
        raise RuntimeError("service reports AI unavailable — will use popularity fallback")
    return "semantic search enabled"


check("recommendation_service AI path", ai_flag, fatal=False)


def embedding_model():
    """Load the model the way the service does. Downloads (~87 MB) if not cached."""
    from sentence_transformers import SentenceTransformer
    m = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    dim = len(m.encode("connectivity check"))
    return f"loaded, {dim}-dim embeddings"


if ai_ok:
    check("embedding model all-MiniLM-L6-v2", embedding_model, fatal=False)

# --- Database ----------------------------------------------------------------
print("\nDatabase")


def db_connect():
    from sqlalchemy import text
    from app.db.base import engine
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    url = engine.url
    return f"connected to {url.database} on {url.host}:{url.port}"


def book_count():
    from app.db.base import SessionLocal
    # Import every model before querying: app/models/__init__.py is empty, so the
    # mappers are only registered by whoever imports them. Book relates to Loan, and
    # querying with Loan unregistered raises "failed to locate a name ('Loan')".
    # The app itself avoids this by importing all endpoints via api_router.
    from app.models import book, loan, reading_history, user  # noqa: F401
    from app.models.book import Book
    db = SessionLocal()
    try:
        n = db.query(Book).filter(Book.is_active == True).count()
    finally:
        db.close()
    if n == 0:
        raise RuntimeError("catalogue is empty — recommendations will return nothing")
    return f"{n} active books"


if check("connection", db_connect):
    check("catalogue", book_count, fatal=False)

# --- Verdict -----------------------------------------------------------------
print()
if failures:
    print(f"{len(failures)} blocking problem(s): {', '.join(failures)}")
    sys.exit(1)
if warnings:
    print(f"Runs, but degraded: {', '.join(warnings)}")
    sys.exit(0)
print("All checks passed — semantic recommendations ready.")
