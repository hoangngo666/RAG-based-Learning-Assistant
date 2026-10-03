import asyncio
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.db.models import ChatSessionDocument, Chunk, Document
from app.rag.embedder import get_embedder
from app.rag.reranker import get_reranker
from app.schemas.chat import Citation


def _build_citation(
    index: int,
    chunk: Chunk,
    document: Document,
) -> Citation:
    text = chunk.text or ""

    return Citation(
        index=index,
        chunk_id=chunk.id,
        doc_id=document.id,
        doc_name=document.name,
        page=chunk.page,
        text=text,
        snippet=text[:300],
    )


async def retrieve_top_k(
    session: AsyncSession,
    chat_session_id: UUID,
    query: str,
    top_k: int | None = None,
) -> list[Citation]:
    settings = get_settings()

    query = query.strip()
    if not query:
        return []

    resolved_top_k = (
        top_k if top_k is not None else settings.retrieval_top_k
    )
    if resolved_top_k <= 0:
        return []

    query_embedding = get_embedder().embed_query(query)

    distance = Chunk.embedding.cosine_distance(
        query_embedding
    ).label("distance")

    candidate_limit = (
        max(resolved_top_k, settings.rerank_candidate_k)
        if settings.rerank_enabled
        else resolved_top_k
    )

    statement = (
        select(Chunk, Document, distance)
        .join(Document, Document.id == Chunk.doc_id)
        .join(
            ChatSessionDocument,
            ChatSessionDocument.document_id == Document.id,
        )
        .where(
            ChatSessionDocument.session_id == chat_session_id
        )
        .where(Document.status == "ready")
        .order_by(distance)
        .limit(candidate_limit)
    )

    rows = (await session.execute(statement)).all()

    if not rows:
        return []

    if settings.rerank_enabled:
        try:
            # Bọc asyncio.to_thread để tránh blocking async event loop nếu reranker chạy CPU-bound
            ranking = await asyncio.to_thread(
                get_reranker().rerank,
                query,
                [chunk.text for chunk, document, _ in rows],
                resolved_top_k,
            )

            valid_ranking = [
                (index, score)
                for index, score in ranking
                if isinstance(index, int)
                and 0 <= index < len(rows)
            ]

            if valid_ranking:
                rows = [
                    rows[index]
                    for index, score in valid_ranking
                ]
            else:
                rows = rows[:resolved_top_k]

        except Exception:
            rows = rows[:resolved_top_k]
    else:
        rows = rows[:resolved_top_k]

    return [
        _build_citation(index, chunk, document)
        for index, (chunk, document, _) in enumerate(
            rows,
            start=1,
        )
    ]


async def retrieve_flashcard_sources(
    session: AsyncSession,
    chat_session_id: UUID,
    query: str,
    top_k: int | None = None,
) -> list[Citation]:
    """Retrieve relevant sources for flashcard generation."""
    return await retrieve_top_k(
        session=session,
        chat_session_id=chat_session_id,
        query=query,
        top_k=top_k,
    )


async def retrieve_study_sources(
    session: AsyncSession,
    chat_session_id: UUID,
    query: str,
    top_k: int | None = None,
) -> list[Citation]:
    """Retrieve relevant sources for study guide and material generation."""
    return await retrieve_top_k(
        session=session,
        chat_session_id=chat_session_id,
        query=query,
        top_k=top_k,
    )