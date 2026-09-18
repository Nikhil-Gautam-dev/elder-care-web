import asyncio
import os
import sys
import tempfile
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool
from database import Base, AccountModel, hash_password

async def test():
    db_path = os.path.join(tempfile.gettempdir(), "test_acc.db")
    if os.path.exists(db_path):
        os.remove(db_path)
    eng = create_async_engine(f"sqlite+aiosqlite:///{db_path}", poolclass=NullPool)
    async with eng.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    s = async_sessionmaker(eng, class_=AsyncSession)()
    acc = AccountModel(
        username="u1",
        email="u1@k.ai",
        password_hash=hash_password("pw123")
    )
    s.add(acc)
    await s.commit()
    await s.refresh(acc)
    print("Success inserting account:", acc.to_dict())

if __name__ == "__main__":
    asyncio.run(test())
