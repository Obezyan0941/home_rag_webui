from enum import Enum  
from pydantic import SecretStr
from backend_app import llm_config
from langchain_openai import ChatOpenAI
from typing import Any, AsyncGenerator
from langchain_core.messages import (
    BaseMessage,
    HumanMessage,
    SystemMessage,
    AIMessage,
    ToolMessage
)
from backend_app.schemas.openai_schemas import ChatMessage


class LangChainMessages(Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"
    TOOL = "tool"

    def __str__(self) -> str:
        return self.value
    
    @classmethod
    def from_openai_dict(cls, message: ChatMessage) -> BaseMessage:
        """
        Converts OpenAI API Message into LangChain BaseMessage.

        :param message: Message object
        :return: BaseMessage subclass
        """
        role: str = message.role
        content = message.content
        if content is None:
            content = ""
        # tool_call_id = message.get("tool_call_id")

        if role == str(cls.USER):
            return HumanMessage(content=content)

        elif role == str(cls.ASSISTANT):
            return AIMessage(content=content)

        elif role == str(cls.SYSTEM):
            return SystemMessage(content=content)

        elif role == str(cls.TOOL):
            return ToolMessage(content=content)

        else:
            raise ValueError(f"Unsupported role: {role}")


class LLMProxy:
    def __init__(self) -> None:
        self.llm = ChatOpenAI(
            base_url=llm_config.llm_host,
            api_key=SecretStr(llm_config.llm_token),
            model=llm_config.model_name,
            temperature=llm_config.llm_temperature,
            streaming=True,
        )
        
    def prep_messages(
        self,
        question: str | None = None,
        messages: list[BaseMessage] | None = None
    ) -> list[BaseMessage]:
        assert question or messages, "Neither question nor messages were supplied"

        if messages:
            chat = messages
        else:
            chat = [HumanMessage(content=question)]

        return chat # type: ignore

    async def stream_chat(
        self,
        question: str | None = None,
        messages: list[BaseMessage] | None = None
    ) -> AsyncGenerator[str, Any]:
        chat = self.prep_messages(question, messages)

        async for chunk in self.llm.astream(chat):
            chunk_text = chunk.content
            if not isinstance(chunk_text, str):
                raise ValueError(f"returned chunk of instance {type(chunk_text)}")
            yield chunk_text
            