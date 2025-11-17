import os
from pathlib import Path
from abc import ABC, abstractmethod
from langchain_core.documents import Document
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.document_loaders import UnstructuredMarkdownLoader


class BaseTextDataReader(ABC):
    def __init__(self, path: str):
        self.path = path

    @abstractmethod
    def read_data(self) -> list[Document]:
        pass


class PDFReader(BaseTextDataReader):
    def read_data(self) -> list[Document]:
        loader = PyPDFLoader(self.path)
        return loader.load()


class MDReader(BaseTextDataReader):
    def read_data(self) -> list[Document]:
        loader = UnstructuredMarkdownLoader(self.path)
        return loader.load()


def get_reader(path: str) -> BaseTextDataReader:
    if not os.path.exists(path):
        raise ValueError(f"Path \"{path}\" does not exist.")

    if not os.path.isdir(path):
        ext = Path(path).suffix.lower()
        if ext == ".pdf":
            return PDFReader(path)
        elif ext == ".md":
            return MDReader(path)
        else:
            raise ValueError(f"Unsupported file type: {ext}.")
    else:
        raise NotImplementedError(f"Path \"{path}\" is not a file. Recursive reading is not implemented.")
    