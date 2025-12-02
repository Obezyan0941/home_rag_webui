import time
from pydantic import BaseModel, Field
from typing import Optional, Literal


class SignupRequest(BaseModel):
    email: str
    password: str


class SigninRequest(BaseModel):
    email: str
    password: str
    return_chats: bool = True
    

class ChatURL(BaseModel):
    url: str
    name: str
    created_at: str


class SigninResponse(BaseModel):
    success: bool
    chats: list[ChatURL]


