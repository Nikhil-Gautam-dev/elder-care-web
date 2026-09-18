"""
Vercel serverless entry for POST /api/signup (fallback path)
"""
import os
import sys

root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

try:
    from server import app
    handler = app
    application = app
except Exception as e:
    import traceback
    err = traceback.format_exc()
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    app = FastAPI()
    handler = app
    application = app

    @app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"])
    async def fallback(path_name: str):
        return JSONResponse(status_code=500, content={"detail": f"Startup error: {str(e)}", "trace": err})
