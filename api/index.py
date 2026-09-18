import os
import sys
import traceback

root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

try:
    from server import app
except Exception as e:
    err_msg = traceback.format_exc()
    print(f"[Vercel Startup Error]: {err_msg}")
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    app = FastAPI(title="Kivo Interpreter Fallback")

    @app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"])
    async def catch_all(path_name: str):
        return JSONResponse(
            status_code=500,
            content={
                "detail": f"Serverless Startup Error on /{path_name}: {str(e)}",
                "traceback": err_msg
            }
        )

