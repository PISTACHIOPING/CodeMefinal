from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel


class LinkCreate(BaseModel):
    document_id: str
    title: str | None = None
    expires_at: datetime | None = None
    visibility: Literal["public", "private"] | None = "public"
    password: Optional[str] = None  # password_hash는 서버에서 해시 저장


class LinkRead(BaseModel):
    id: str
    document_id: str
    title: str | None = None
    is_active: bool
    expires_at: datetime | None = None
    created_at: datetime
    access_count: int
    visibility: Literal["public", "private"]

    class Config:
        from_attributes = True
