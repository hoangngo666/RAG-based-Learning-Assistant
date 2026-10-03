from uuid import UUID

from pydantic import BaseModel


class Citation(BaseModel):
    index: int
    chunk_id: UUID
    doc_id: UUID
    doc_name: str
    page: int
    text: str
    snippet: str