import os
import uuid
import json
import asyncio
from typing import Any, AsyncGenerator
from backend_app.utils.encrypt import encrypt, check_password

from fastapi import FastAPI, HTTPException, status
from contextlib import asynccontextmanager
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware  
from starlette.responses import StreamingResponse

from backend_app.db.db import DBManager
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
from backend_app.schemas.db_schemas import (
    SignupRequest,
    SigninRequest,
    SigninResponse,
    ChatURL
)


FRONTEND_DIR = "dist"
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

db_manager = DBManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await db_manager.init_db()
        print("✅ Database initialized")
    except Exception as e:
        raise Exception(f"❌ Failed to initialize DB: {e}")
    yield

    await db_manager.engine.dispose()

app = FastAPI(lifespan=lifespan)
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


@app.post("/signup")
async def signup(request: SignupRequest):
    hashed_password = encrypt(request.password)

    existing_user = await db_manager.get_user_by_email(email=request.email)
    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email already exists"
        )

    await db_manager.create_user(
        user_id=str(uuid.uuid4()),
        user_email=request.email,
        password=hashed_password
    )
    return {"response": "user created"}


@app.post("/signin")
async def signin(request: SigninRequest):
    existing_user = await db_manager.get_user_by_email(email=request.email)
    if existing_user is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Invalid email"
        )
    
    if not check_password(request.password, str(existing_user.password)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password"
        )
    
    user_chats = await db_manager.get_user_chats(user_id=str(existing_user.user_id))
    
    chats_data: list[ChatURL] = []
    for user_chat in user_chats:
        chats_data.append(
            ChatURL(
                url=f"/c/{user_chat.chat_id}",
                name=str(user_chat.chat_name) or "Untitled",
                created_at=str(user_chat.created_at)
            )
        )
    
    response = SigninResponse(
        success=True,
        chats=chats_data
    )
    return response


# @app.post("/c/{chat_id}/messages")
# async def send_message(chat_id: str):
#     return

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

