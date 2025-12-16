import time
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional, Literal


class SignupRequest(BaseModel):
    email: str
    password: str


class SigninRequest(BaseModel):
    email: str
    password: str
    

class ChatDetails(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    chat_id: str
    chat_name: str
    created_at: datetime
    last_message_at: datetime


class SignInResponse(BaseModel):
    user_id: str
    success: bool
    chats: list[ChatDetails]


class SetChatRequest(BaseModel):
    user_id: str
    chat_id: str
    chat_dump: str


class SetChatResponse(BaseModel): 
    success: bool
    chat_id: str
    chat_name: str
    created_at: str
    last_message_at: str


class GetChatRequest(BaseModel):
    user_id: str
    chat_id: str


class GetChatResponse(BaseModel): 
    success: bool
    chat_dump: str


