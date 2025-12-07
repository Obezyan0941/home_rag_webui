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
    return_chats: bool = True
    

class ChatDetails(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    chat_id: str
    chat_name: str
    created_at: datetime
    last_message_at: datetime


class SigninResponse(BaseModel):
    success: bool
    chats: list[ChatDetails]


