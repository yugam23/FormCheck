"""
run.py - Production entry point for the FormCheck server.

Simple script to start the Uvicorn ASGI server. Reload is disabled by
default for production stability—use `uvicorn main:app --reload` directly
during development.

For Docker/production, use:
    python run.py
"""

import uvicorn

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
