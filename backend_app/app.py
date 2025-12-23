import os
import uuid
import json
import time
import asyncio
import random
from typing import Any, AsyncGenerator
from backend_app.utils.encrypt import encrypt, check_password

from fastapi import FastAPI, HTTPException, status
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
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
    SignInResponse,
    ChatDetails,
    SetChatRequest,
    SetChatResponse,
    GetChatRequest,
    GetChatResponse,
    DeleteChatRequest,
    EditChatRequest
)


FRONTEND_DIR = "dist"
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://192.168.0.119:5173"
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


async def _resp_async(
        messages: list[ChatMessage],
        user_id: str,
        chat_id: str
        ) -> str:
    response = ""
    async for token in _resp_async_generator(
        messages=messages,
        user_id=user_id,
        chat_id=chat_id
        ):
        response += token
    return response


async def temp_llm_async_generator(messages: list[ChatMessage]) -> AsyncGenerator[str, Any]:
    await asyncio.sleep(1)
    for token in "This is a temp message. If you see it, it means it works.".split(" "):
        yield token + " "
        await asyncio.sleep(0.1)

async def _resp_async_generator(
        messages: list[ChatMessage],
        user_id: str,
        chat_id: str
        ) -> AsyncGenerator[str, Any]:
    
    new_messagee = ""
    async for token in temp_llm_async_generator(messages=messages):
        chunk = ChatCompletionChunk(
            id = 0,
            object = "chat.completion.chunk",
            model = "llm_title",
            choices = [
                ChatCompletionChunkChoice(
                    delta=ChatCompletionDelta(
                        role="assistant",
                        content=token
                    )
                )
            ]
        )
        new_messagee += token
        yield f"data: {json.dumps(chunk.model_dump())}\n\n"
    
    messages.append(ChatMessage(
        id=str(round(random.random() * random.random() * 10000)),
        role="assistant",
        content=new_messagee,
        created=int(time.time())
    ))
    chat_dump = json.dumps([model.model_dump() for model in messages], indent=4)
    await db_manager.set_user_chat(user_id=user_id, chat_id=chat_id, new_chat_dump=chat_dump)
    

@app.post("/chat/completions")
async def chat_completions(request: ChatCompletionRequest):
    if request.stream:
        return StreamingResponse(_resp_async_generator(
            messages=request.messages,
            user_id=request.user_id,
            chat_id=request.chat_id
            ), media_type="text/event-stream")
    
    resp_content = await _resp_async(
        messages=request.messages,
        user_id=request.user_id,
        chat_id=request.chat_id
        )

    model_name = request.model or "mock-model"
    response = ChatCompletionResponse(
        id="chatcmpl",
        model=model_name,
        choices=[
            ChatCompletionChoice(
                message=ChatMessage(
                    id=str(round(random.random() * random.random() * 10000)),
                    role="assistant",
                    content=resp_content,
                    created=int(time.time())
                )
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

    user_id = str(uuid.uuid4())
    await db_manager.create_user(
        user_id=user_id,
        user_email=request.email,
        password=hashed_password
    )
    response = SignInResponse(
        success=True,
        chats=[],
        user_id=user_id
    )
    return response

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
    
    chats_data: list[ChatDetails] = [ChatDetails.model_validate(user_chat) for user_chat in user_chats]
    
    response = SignInResponse(
        success=True,
        chats=chats_data,
        user_id=str(existing_user.user_id)
    )
    return response


@app.post("/setchat")
async def set_chat(request: SetChatRequest):
    chat_data = await db_manager.set_user_chat(
        user_id=request.user_id,
        chat_id=request.chat_id,
        new_chat_dump=request.chat_dump
    )
    return SetChatResponse(
        success=True,
        chat_id=str(chat_data.chat_id),
        chat_name=str(chat_data.chat_name),
        created_at=str(chat_data.created_at),
        last_message_at=str(chat_data.last_message_at)
    )


@app.post("/delchat")
async def delete_chat(request: DeleteChatRequest):
    success = await db_manager.delete_user_chat(
        user_id=request.user_id,
        chat_id=request.chat_id,
    )
    message: dict[str, str | bool] = {"success": success}
    if success:
        return JSONResponse(message)
    else:
        message["message"] = "Could not find requested chat"
        return JSONResponse(
            content=message,
            status_code=status.HTTP_400_BAD_REQUEST
        )


@app.post("/editchat")
async def edit_chat(request: EditChatRequest):
    success = await db_manager.edit_chat_name(
        user_id=request.user_id,
        chat_id=request.chat_id,
        new_chat_name=request.new_chat_name
    )
    message: dict[str, str | bool] = {"success": success}
    if success:
        return JSONResponse(message)
    else:
        message["message"] = "Could not find requested chat"
        return JSONResponse(
            content=message,
            status_code=status.HTTP_400_BAD_REQUEST
        )


@app.post("/getchat")
async def get_chat(request: GetChatRequest):
    chat_data = await db_manager.get_user_chat(
        user_id=request.user_id,
        chat_id=request.chat_id,
    )
    if chat_data:
        success = True
        chat_dump = str(chat_data.chat_dump)
    else:
        success = False
        chat_dump = ""
    return GetChatResponse(
        success=success,
        chat_dump=chat_dump
    )


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

