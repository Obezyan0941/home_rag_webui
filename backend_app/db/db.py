import os
import asyncio
from datetime import datetime
from backend_app import init_runtime
from typing import Literal

from sqlalchemy.pool import NullPool
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import Column, Integer, String, DateTime, Boolean, select, insert


init_runtime()
Base = declarative_base()

class Users(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String)
    user_email = Column(String)
    password = Column(String)
    created_at = Column(DateTime(timezone=True))

class Chats(Base):
    __tablename__ = 'chats'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String)
    chat_id = Column(String)
    chat_name = Column(String)
    created_at = Column(DateTime(timezone=True))
    last_message_at = Column(DateTime(timezone=True))
    chat_dump = Column(String)


class DBManager:
    def __init__(
        self,
        db_name: str = "./data/db",
        db_type: Literal["postgres", "sqlite"] = "sqlite"
    ):
        if db_type == "postgres":
            user = os.getenv("POSTGRES_LOGIN")
            password = os.getenv("POSTGRES_PASSWORD")
            host = os.getenv("POSTGRES_HOST", "localhost")
            port = os.getenv("POSTGRES_PORT", "5432")
            url = f"postgresql+asyncpg://{user}:{password}@{host}:{port}/{db_name}"
            poolclass = None
        elif db_type == "sqlite":
            path = os.getenv("SQLITE_PATH", f"{db_name}.db")
            url = f"sqlite+aiosqlite:///{path}"
            poolclass = NullPool
        else:
            raise ValueError(f"Unsupported db_type: {db_type}")

        self.engine = create_async_engine(
            url,
            echo=False,
            poolclass=poolclass,
        )

        self.AsyncSessionLocal = async_sessionmaker(
            bind=self.engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
        )

    async def init_db(self):
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    
    async def create_user(self, user_id: str, user_email: str, password: str):
        async with self.AsyncSessionLocal() as session:
            stmt = (
                insert(Users).values(
                    user_id=user_id,
                    created_at=datetime.now(),
                    user_email=user_email,
                    password=password
                )
            )
            await session.execute(stmt)
            await session.commit()
        
    async def get_all_users(self):
        async with self.AsyncSessionLocal() as session:
            result = await session.execute(select(Users))
            return result.scalars().all()
        
    async def get_user_by_email(self, email: str) -> Users | None:
        async with self.AsyncSessionLocal() as session:
            result = await session.execute(
                select(Users).where(Users.user_email == email)
            )
            user = result.scalar_one_or_none()
            return user
        
    async def get_user_chats(self, user_id: str) -> list[Chats]:
        async with self.AsyncSessionLocal() as session:
            result = await session.execute(
                select(Chats).where(Chats.user_id == user_id)
            )
        chats = list(result.scalars())
        return chats
    
