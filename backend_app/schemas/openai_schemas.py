import time
from pydantic import BaseModel, Field
from typing import Optional, Literal


class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant", "tool"]
    content: str
    id: str
    created: int


class ChatCompletionChoice(BaseModel):
    index: int = 0
    message: ChatMessage
    finish_reason: Optional[Literal["stop", "length", "tool_calls", "content_filter", "function_call"]] = None


class ChatCompletionResponse(BaseModel):
    id: str
    object: Literal["chat.completion"] = "chat.completion"
    created: int = Field(default_factory=lambda: int(time.time()))
    model: str
    choices: list[ChatCompletionChoice]
    usage: Optional[dict] = None


class ChatCompletionDelta(BaseModel):
    role: Optional[Literal["assistant"]] = None
    content: Optional[str] = None


class ChatCompletionChunkChoice(BaseModel):
    index: int = 0
    delta: ChatCompletionDelta
    finish_reason: Optional[Literal["stop", "length", "tool_calls", "content_filter", "function_call"]] = None


class ChatCompletionChunk(BaseModel):
    id: int
    object: Literal["chat.completion.chunk"] = "chat.completion.chunk"
    created: int = Field(default_factory=lambda: int(time.time()))
    model: str
    choices: list[ChatCompletionChunkChoice]


class ChatCompletionRequest(BaseModel):
    model: str = "mock-gpt-model"
    chat_id: str
    user_id: str
    messages: list[ChatMessage]
    max_tokens: Optional[int] = 512
    temperature: Optional[float] = 0.1
    stream: Optional[bool] = False


class ModelEntry(BaseModel):
    id: str = "BaseLLM"
    object: str = "model"
    created: int = Field(default_factory=lambda: int(time.time()))
    owned_by: str = "organization-owner"


class ModelsResponse(BaseModel):
   object: str = "list"
   data: list[ModelEntry] = Field(default=[ModelEntry()])
    
