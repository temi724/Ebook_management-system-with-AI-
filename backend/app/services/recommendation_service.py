from typing import List, Optional
from sqlalchemy.orm import Session

# AI/ML dependencies (langchain, chromadb, sentence-transformers) are heavy and
# optional. Import them lazily so the API can boot — and gracefully fall back to
# popularity-based recommendations — even when the AI stack is not installed/available.
try:
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    from langchain_community.vectorstores import Chroma
    from langchain_community.embeddings import HuggingFaceEmbeddings
    AI_DEPENDENCIES_AVAILABLE = True
except Exception:  # pragma: no cover - depends on optional heavy deps
    RecursiveCharacterTextSplitter = None
    Chroma = None
    HuggingFaceEmbeddings = None
    AI_DEPENDENCIES_AVAILABLE = False
from app.models.book import Book
from app.models.reading_history import ReadingHistory
from app.schemas.recommendation import BookRecommendation, RecommendationResponse
import logging

logger = logging.getLogger(__name__)


class RecommendationService:
    """AI-powered book recommendation service using RAG over local embeddings"""

    # Vector search always returns the nearest books even for a totally unrelated query,
    # so results need a relevance floor. One absolute cutoff is not enough on its own:
    # conversational queries score much lower than keyword ones ("web development" tops
    # out at 0.47, "learn how to build a website" at 0.31 for the same books), because
    # filler words dilute the embedding. A floor high enough to keep junk out of short
    # queries therefore returns nothing at all for natural-language ones.
    #
    # So two cutoffs are combined:
    #   RELEVANCE_THRESHOLD    absolute floor — keeps unrelated queries empty. Measured
    #                          top score for off-topic queries is ~0.07-0.22, so 0.25
    #                          leaves headroom above the worst case.
    #   RELATIVE_THRESHOLD     fraction of the best hit — trims the long tail on broad
    #                          queries. Without it "literature" returns 9 books spanning
    #                          4 unrelated categories instead of the 3 that belong.
    RELEVANCE_THRESHOLD = 0.25
    RELATIVE_THRESHOLD = 0.6

    def __init__(self):
        self.vector_store = None
        self.text_splitter = None
        self.embeddings = None

        if not AI_DEPENDENCIES_AVAILABLE:
            logger.warning(
                "AI dependencies (langchain/chromadb/sentence-transformers/ollama) are not "
                "installed. Recommendations will use popularity-based fallback."
            )
            return

        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50
        )
        try:
            self.embeddings = HuggingFaceEmbeddings(
                model_name="sentence-transformers/all-MiniLM-L6-v2"
            )
        except Exception as e:
            logger.warning(f"Could not initialize embeddings model: {e}. Recommendations will use fallback.")
            self.embeddings = None
    
    def invalidate_vector_store(self):
        """Mark the cached vector store as stale (e.g. after the catalogue changes).
        It will be rebuilt lazily on the next recommendation request."""
        self.vector_store = None

    def initialize_vector_store(self, db: Session):
        """Initialize or update vector store with book data"""
        if not self.embeddings:
            logger.warning("Embeddings not available, skipping vector store initialization")
            return
        try:
            books = db.query(Book).filter(Book.is_active == True).all()
            
            if not books:
                logger.warning("No books found to initialize vector store")
                return
            
            # Prepare documents
            documents = []
            metadatas = []
            
            for book in books:
                # Create rich text representation of book
                book_text = f"""
                Title: {book.title}
                Author: {book.author}
                Category: {book.category or 'Unknown'}
                Description: {book.description or 'No description'}
                Tags: {book.tags or ''}
                Publisher: {book.publisher or 'Unknown'}
                Year: {book.publication_year or 'Unknown'}
                """
                
                documents.append(book_text)
                metadatas.append({
                    "book_id": book.id,
                    "title": book.title,
                    "author": book.author,
                    "category": book.category or "Unknown"
                })
            
            # Create vector store. Use cosine distance so the score maps to a clean
            # cosine similarity (0–1 for related text) rather than raw L2 distance.
            self.vector_store = Chroma.from_texts(
                texts=documents,
                embedding=self.embeddings,
                metadatas=metadatas,
                collection_name="books",
                collection_metadata={"hnsw:space": "cosine"},
            )
            
            logger.info(f"Vector store initialized with {len(books)} books")
            
        except Exception as e:
            logger.error(f"Error initializing vector store: {e}")
            raise
    
    def get_recommendations_by_query(
        self,
        db: Session,
        query: str,
        limit: int = 5
    ) -> RecommendationResponse:
        """Get book recommendations based on user query using RAG"""
        try:
            if not self.vector_store:
                self.initialize_vector_store(db)

            # The vector store stays None whenever the AI stack is unusable — missing
            # dependencies, or an embeddings model that failed to load. Degrade to
            # popularity ranking rather than returning nothing, which is what the
            # module contract promises and what the personalized path already does.
            if not self.vector_store:
                logger.warning(
                    "Vector store unavailable; serving popularity fallback for query: %r", query
                )
                fallback = self._get_popular_books(db, limit)
                fallback.query_understood = query
                return fallback

            # Search similar books (retrieve a few extra to allow for filtering).
            results = self.vector_store.similarity_search_with_score(
                query, k=limit * 2
            )

            if not results:
                return RecommendationResponse(
                    recommendations=[], query_understood=query, total_results=0
                )

            # The relative cutoff is anchored to the best hit, so it has to be computed
            # before filtering. Results are ordered best-match first.
            top_similarity = float(1 - results[0][1])
            cutoff = max(self.RELEVANCE_THRESHOLD, top_similarity * self.RELATIVE_THRESHOLD)

            # Extract book recommendations. Because results are ordered, once a book falls
            # below the cutoff none of the remaining ones qualify.
            recommendations = []
            seen_books = set()

            for doc, score in results:
                similarity = float(1 - score)
                if similarity < cutoff:
                    break

                book_id = doc.metadata.get("book_id")
                if not book_id or book_id in seen_books:
                    continue

                book = db.query(Book).filter(Book.id == book_id).first()
                if book and book.available_copies > 0:
                    recommendations.append(
                        BookRecommendation(
                            book_id=book.id,
                            title=book.title,
                            author=book.author,
                            category=book.category or "Unknown",
                            similarity_score=similarity,
                            reason=f"Highly relevant to your search. This book matches your interest in {book.category or 'this topic'}."
                        )
                    )
                    seen_books.add(book_id)

                if len(recommendations) >= limit:
                    break

            return RecommendationResponse(
                recommendations=recommendations[:limit],
                query_understood=query,
                total_results=len(recommendations)
            )
            
        except Exception as e:
            logger.error(f"Error getting recommendations: {e}")
            # Search failed outright — still return something useful rather than an
            # empty list. If even the fallback query fails the DB is unreachable, so
            # an empty response is all that is left.
            try:
                fallback = self._get_popular_books(db, limit)
                fallback.query_understood = query
                return fallback
            except Exception as fallback_error:
                logger.error(f"Popularity fallback also failed: {fallback_error}")
                return RecommendationResponse(
                    recommendations=[],
                    query_understood=query,
                    total_results=0
                )
    
    def get_personalized_recommendations(
        self,
        db: Session,
        user_id: int,
        limit: int = 5
    ) -> RecommendationResponse:
        """Get personalized recommendations based on user's reading history"""
        try:
            # Get user's reading history
            history = db.query(ReadingHistory).filter(
                ReadingHistory.user_id == user_id
            ).order_by(ReadingHistory.read_date.desc()).limit(10).all()
            
            if not history:
                # No history, return popular books
                return self._get_popular_books(db, limit)
            
            # Build query from user's interests
            read_books = [h.book for h in history if h.book]
            categories = [b.category for b in read_books if b.category]
            authors = [b.author for b in read_books]
            
            query = f"Books similar to {', '.join(set(categories[:3]))} by authors like {', '.join(set(authors[:3]))}"
            
            return self.get_recommendations_by_query(db, query, limit)
            
        except Exception as e:
            logger.error(f"Error getting personalized recommendations: {e}")
            return self._get_popular_books(db, limit)
    
    def _get_popular_books(self, db: Session, limit: int) -> RecommendationResponse:
        """Fallback: Get popular books"""
        books = db.query(Book).filter(
            Book.is_active == True,
            Book.available_copies > 0
        ).order_by(Book.rating.desc()).limit(limit).all()
        
        recommendations = [
            BookRecommendation(
                book_id=book.id,
                title=book.title,
                author=book.author,
                category=book.category or "Unknown",
                similarity_score=(book.rating or 0.0) / 5.0,
                reason="Popular book in our library"
            )
            for book in books
        ]
        
        return RecommendationResponse(
            recommendations=recommendations,
            query_understood="Popular books",
            total_results=len(recommendations)
        )


# Singleton instance - lazy initialized
_recommendation_service = None

def get_recommendation_service() -> RecommendationService:
    """Get or create the recommendation service singleton"""
    global _recommendation_service
    if _recommendation_service is None:
        _recommendation_service = RecommendationService()
    return _recommendation_service

# For backwards compatibility
recommendation_service = None  # Will be initialized on first use
