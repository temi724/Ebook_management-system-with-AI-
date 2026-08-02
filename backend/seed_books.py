"""Seed the catalogue with demo books.

Deliberately spans distinct subject clusters (AI/ML, web development, databases,
security, African literature, business) so semantic search has something to
discriminate between — a catalogue of near-identical books makes the vector
search look no better than the popularity fallback.

Idempotent: books are matched on ISBN, so re-running updates rather than duplicates.

    Windows:  venv311\\Scripts\\python seed_books.py
    macOS:    ./venv311/bin/python seed_books.py
"""
from app.db.base import Base, SessionLocal, engine

# Import every model so the mappers resolve before we query (app/models/__init__.py
# is empty, and Book relates to Loan / ReadingHistory by name).
from app.models import book, loan, reading_history, user  # noqa: F401
from app.models.book import Book

BOOKS = [
    # --- Artificial intelligence / machine learning ---
    ("978-0134610993", "Artificial Intelligence: A Modern Approach", "Stuart Russell, Peter Norvig",
     "Pearson", 2020, "Artificial Intelligence",
     "The definitive textbook on artificial intelligence, covering intelligent agents, search, "
     "knowledge representation, probabilistic reasoning, machine learning and robotics.",
     1136, 4.7, "ai,machine learning,agents,search,reasoning"),
    ("978-0262035613", "Deep Learning", "Ian Goodfellow, Yoshua Bengio, Aaron Courville",
     "MIT Press", 2016, "Artificial Intelligence",
     "A comprehensive introduction to deep neural networks, covering backpropagation, "
     "convolutional networks, recurrent networks, regularization and generative models.",
     800, 4.6, "deep learning,neural networks,cnn,rnn"),
    ("978-1492032649", "Hands-On Machine Learning with Scikit-Learn and TensorFlow", "Aurelien Geron",
     "O'Reilly Media", 2019, "Artificial Intelligence",
     "A practical guide to building machine learning systems, from linear regression and "
     "decision trees through to deep neural networks trained with TensorFlow and Keras.",
     856, 4.8, "machine learning,python,tensorflow,scikit-learn,practical"),
    ("978-3319571317", "Natural Language Processing with Transformers", "Lewis Tunstall",
     "O'Reilly Media", 2022, "Artificial Intelligence",
     "How transformer models work and how to apply them to text classification, named entity "
     "recognition, summarization, question answering and semantic search with embeddings.",
     406, 4.5, "nlp,transformers,embeddings,semantic search,language models"),

    # --- Web development ---
    ("978-1491954621", "Learning React", "Alex Banks, Eve Porcello",
     "O'Reilly Media", 2020, "Web Development",
     "Building modern user interfaces with React: components, hooks, state management, "
     "routing and data fetching in single-page applications.",
     310, 4.4, "react,javascript,frontend,hooks,components"),
    ("978-1098106225", "Building Python Web APIs with FastAPI", "Abdulazeez Abdulazeez Adeshina",
     "Packt Publishing", 2022, "Web Development",
     "Designing and deploying REST APIs in Python using FastAPI, covering routing, dependency "
     "injection, request validation with Pydantic, authentication and testing.",
     158, 4.3, "fastapi,python,rest api,backend,pydantic"),
    ("978-1593279509", "Eloquent JavaScript", "Marijn Haverbeke",
     "No Starch Press", 2018, "Web Development",
     "A modern introduction to programming in JavaScript, covering the language itself, "
     "the browser document object model, and building applications on the web platform.",
     472, 4.2, "javascript,programming,web,browser"),

    # --- Databases ---
    ("978-0321884497", "SQL Antipatterns", "Bill Karwin",
     "Pragmatic Bookshelf", 2010, "Databases",
     "Common mistakes in database design and SQL queries, and how to avoid them: bad schema "
     "normalization, poor indexing choices, and unsafe query construction.",
     328, 4.5, "sql,databases,schema design,indexing,antipatterns"),
    ("978-1449373320", "Designing Data-Intensive Applications", "Martin Kleppmann",
     "O'Reilly Media", 2017, "Databases",
     "The principles behind reliable, scalable and maintainable data systems: replication, "
     "partitioning, transactions, consistency, consensus and stream processing.",
     616, 4.9, "databases,distributed systems,scalability,replication,transactions"),
    ("978-0596009762", "MySQL Cookbook", "Paul DuBois",
     "O'Reilly Media", 2014, "Databases",
     "Practical recipes for working with MySQL: writing queries, managing schemas, indexing "
     "for performance, handling transactions and administering servers.",
     866, 4.1, "mysql,sql,database administration,queries"),

    # --- Security ---
    ("978-1118026472", "The Web Application Hacker's Handbook", "Dafydd Stuttard, Marcus Pinto",
     "Wiley", 2011, "Cybersecurity",
     "Finding and exploiting security flaws in web applications: authentication bypass, "
     "session hijacking, SQL injection, cross-site scripting and access control failures.",
     912, 4.6, "security,web security,penetration testing,sql injection,xss"),
    ("978-1593278267", "Practical Cryptography", "Jean-Philippe Aumasson",
     "No Starch Press", 2017, "Cybersecurity",
     "How cryptography works in practice: hash functions, block ciphers, authenticated "
     "encryption, key exchange, digital signatures and transport layer security.",
     304, 4.4, "cryptography,encryption,security,tls,hashing"),

    # --- African literature ---
    ("978-0385474542", "Things Fall Apart", "Chinua Achebe",
     "Anchor Books", 1994, "African Literature",
     "The story of Okonkwo, a leader in a nineteenth century Igbo village in Nigeria, and the "
     "disruption of his community by British colonialism and Christian missionaries.",
     209, 4.5, "nigerian literature,igbo,colonialism,classic,fiction"),
    ("978-1400096923", "Half of a Yellow Sun", "Chimamanda Ngozi Adichie",
     "Anchor Books", 2007, "African Literature",
     "Set during the Nigerian Civil War, the intertwined lives of a professor, a houseboy and "
     "twin sisters as Biafra fights for independence.",
     543, 4.6, "nigerian literature,biafra,civil war,historical fiction"),
    ("978-0141186375", "Petals of Blood", "Ngugi wa Thiong'o",
     "Penguin Classics", 2005, "African Literature",
     "Four suspects in a murder investigation recount post-independence Kenya, exposing the "
     "betrayals of the new political and economic elite.",
     432, 4.3, "kenyan literature,postcolonial,politics,fiction"),

    # --- Business / entrepreneurship ---
    ("978-0307887894", "The Lean Startup", "Eric Ries",
     "Crown Business", 2011, "Business",
     "A methodology for building startups through validated learning, rapid experimentation "
     "with minimum viable products, and deciding when to pivot or persevere.",
     336, 4.2, "startup,entrepreneurship,product management,innovation"),
    ("978-0374533557", "Thinking, Fast and Slow", "Daniel Kahneman",
     "Farrar, Straus and Giroux", 2013, "Business",
     "How two systems of thought drive human judgement: fast intuitive reasoning and slow "
     "deliberate analysis, and the cognitive biases that follow from them.",
     499, 4.4, "psychology,decision making,behavioural economics,cognitive bias"),
]

COLUMNS = ("isbn", "title", "author", "publisher", "publication_year",
           "category", "description", "pages", "rating", "tags")


def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    created = updated = 0
    try:
        for row in BOOKS:
            values = dict(zip(COLUMNS, row))
            existing = db.query(Book).filter(Book.isbn == values["isbn"]).first()
            if existing:
                for key, value in values.items():
                    setattr(existing, key, value)
                updated += 1
            else:
                db.add(Book(
                    **values,
                    total_copies=3,
                    available_copies=3,
                    is_active=True,
                    language="English",
                ))
                created += 1
        db.commit()
        total = db.query(Book).filter(Book.is_active == True).count()
    finally:
        db.close()

    print(f"Created {created}, updated {updated}. Catalogue now holds {total} active books.")
    print("Restart the backend (or POST /api/v1/recommendations/initialize-vector-store) "
          "so the vector store picks them up.")


if __name__ == "__main__":
    main()
