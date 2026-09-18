"""
Kivo Interpreter — Vercel Python Serverless Entry Point
Built with @vercel/python, handles all /api/* routes.

Vercel routes (vercel.json):
  /api/(.*) -> api/index.py

FastAPI receives the original full path: /api/auth/signup
Routes in server.py handle both /api/auth/signup and /auth/signup.
"""
import os
import sys
import traceback

# Add project root to path so server.py can be imported
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

try:
    from server import app

    # Vercel Python runtime looks for 'app' (ASGI), 'handler', or 'application'
    handler = app
    application = app

    print("[Kivo Vercel] server.py imported successfully. ASGI app ready.")

except Exception as e:
    err_msg = traceback.format_exc()
    print(f"[Kivo Vercel STARTUP ERROR]: {err_msg}")

    # Fallback: minimal FastAPI that reports the startup error
    # This makes it visible in Vercel's function logs
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    from fastapi.middleware.cors import CORSMiddleware

    app = FastAPI(title="Kivo Startup Error Reporter")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    handler = app
    application = app

    @app.api_route(
        "/{path_name:path}",
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"]
    )
    async def catch_all(path_name: str):
        return JSONResponse(
            status_code=500,
            content={
                "detail": f"Vercel serverless startup failed: {str(e)}",
                "path": path_name,
                "traceback": err_msg,
                "hint": "Check requirements.txt — all packages must be installable on Vercel's Python runtime"
            }
        )
