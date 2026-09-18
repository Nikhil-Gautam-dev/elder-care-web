import os
import sys
import asyncio
os.environ["VERCEL"] = "1"
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import init_db, get_active_db_type
from server import app
from httpx import AsyncClient, ASGITransport

async def run_test():
    await init_db()
    print("Active DB Type:", get_active_db_type())
    transport = ASGITransport(app=app)
    import uuid
    uid = uuid.uuid4().hex[:6]
    test_email = f"user_{uid}@kivo.ai"
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post("/api/auth/signup", json={
            "name": "Fresh User",
            "email": test_email,
            "password": "password123",
            "role": "user"
        })
        print("Fresh Signup Status:", res.status_code)
        print("Fresh Signup Response:", res.json())

        # Test duplicate signup
        res_dup = await client.post("/api/auth/signup", json={
            "name": "Test User",
            "email": "tester@example.com",
            "password": "password123",
            "role": "user"
        })
        print("Duplicate Signup Status:", res_dup.status_code)
        print("Duplicate Signup Response:", res_dup.json())

        # Test signin
        res_in = await client.post("/api/auth/signin", json={
            "email": "tester@example.com",
            "password": "password123"
        })
        print("Signin Status:", res_in.status_code)
        print("Signin Response:", res_in.json())

if __name__ == "__main__":
    asyncio.run(run_test())
