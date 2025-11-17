import os
import json
import asyncio
from typing import Any, AsyncGenerator

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware  
from starlette.responses import StreamingResponse

from backend_app.schemas.openai_schemas import (
    ModelEntry,
    ChatMessage,
    ModelsResponse,
    ChatCompletionChunk,
    ChatCompletionDelta,
    ChatCompletionChoice,
    ChatCompletionRequest,
    ChatCompletionResponse,
    ChatCompletionChunkChoice,
)


FRONTEND_DIR = "dist"
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods like GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],  # Allows all headers
)

@app.get("/v1/models")
@app.get("/models")
def list_models(): 
    return ModelsResponse(data=[ModelEntry(id="llm_title")])


async def _resp_async(messages: list[ChatMessage]) -> str:
    response = ""
    async for token in _resp_async_generator(messages=messages):
        response += token
    return response


async def _resp_async_generator(messages: list[ChatMessage]) -> AsyncGenerator[str, Any]:
    i = 0
    await asyncio.sleep(1)
    for token in "This is a temp message. If you see it, it means it works.".split(" "):
        chunk = ChatCompletionChunk(
            id = i,
            object = "chat.completion.chunk",
            model = "llm_title",
            choices = [
                ChatCompletionChunkChoice(
                    delta=ChatCompletionDelta(
                        role="assistant",
                        content=token + " "
                    )
                )
            ]
        )
        await asyncio.sleep(0.1)
        yield f"data: {json.dumps(chunk.model_dump())}\n\n"
        i += 1


@app.post("/chat/completions")
async def chat_completions(request: ChatCompletionRequest):
    if request.stream:
        return StreamingResponse(_resp_async_generator(request.messages), media_type="text/event-stream")
    
    resp_content = await _resp_async(request.messages)

    model_name = request.model or "mock-model"
    response = ChatCompletionResponse(
        id="chatcmpl",
        model=model_name,
        choices=[
            ChatCompletionChoice(
                message=ChatMessage(role="assistant", content=resp_content)
            )
        ]
    )
    return response


app.mount(
    "/assets",
    StaticFiles(directory=os.path.join(FRONTEND_DIR, "assets")),
    name="assets"
)

app.mount(
    "/",
    StaticFiles(directory=FRONTEND_DIR, html=True),
    name="spa"
)

# @app.get("/{full_path:path}")
# async def serve_spa(full_path: str):
#     if os.path.exists(os.path.join(FRONTEND_DIR, full_path)):
#         return FileResponse(os.path.join(FRONTEND_DIR, full_path))
#     return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))

