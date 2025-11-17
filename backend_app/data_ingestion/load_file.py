import math
import enum
import requests
from backend_app import config, logger
from uuid import uuid4
from transliterate import translit
from qdrant_client import QdrantClient
from langchain_core.documents import Document
from backend_app.data_ingestion.data_readers import get_reader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from qdrant_client.http.models import Distance, VectorParams, PointStruct


class EmbeddingType(enum.Enum):
    DENSE = 'dense'
    SPARSE = 'sparse'   # Not implemented


class QdrantUploader:
    def __init__(self) -> None:
        self.client = QdrantClient(url=config.qdrant_host)

    def create_collection(self, col_name: str) -> None:
        if self.client.collection_exists(collection_name=col_name):
            logger.info(f"Uploading to existing collection: {col_name}")
            return
        
        self.client.create_collection(
            collection_name=col_name,
            vectors_config=VectorParams(
                size=config.embedding_dim,
                distance=Distance.COSINE
                )
        )
        logger.info(f"Created new collection: {col_name}")

    def _prep_collection_name(self, col_name: str) -> str:
        col_name = col_name.replace(" ", "_")
        return col_name
    
    def _compose_point(self, document: Document) -> PointStruct:
        dense = document.metadata.pop(EmbeddingType.DENSE, None)
        sparse = document.metadata.pop(EmbeddingType.SPARSE, None)
        if not dense:
            raise RuntimeError(f"Found empty embedding for document: {document}")

        payload = document.metadata
        payload["text"] = document.page_content

        return PointStruct(
            id=str(uuid4()),
            payload=payload,
            vector=dense,
        )
    
    def _upsert_points(self, col_name: str, points: list[PointStruct]) -> None:
        self.client.upsert(
            collection_name=col_name,
            points=points,
        )

    def _get_dense_embeddings(self, text: str) -> list[float]:
        data = {"texts": [text]}
        response = requests.post(config.ray_host + "embedder", json=data)
        if response.status_code != 200:
            raise ConnectionError(f"Could not retreive embeddings, code {response.status_code}")
        
        response_json = response.json()
        embedding = response_json["result"]
        return embedding
    
    def _get_embeddings(self, document: Document) -> Document:
        dense_embedding = self._get_dense_embeddings(document.page_content)
        document.metadata[EmbeddingType.DENSE] = dense_embedding[0]
        return document
    
    def upload(self, documents: list[Document], col_name: str):
        if not documents:
            raise ValueError("Received empty documents list at upload to qdrant")
        
        col_name = self._prep_collection_name(col_name)
        self.create_collection(col_name)
        
        batch_size = config.upload_batch
        upload_batch: list[PointStruct] = []
        batches_loaded = 0
        total_batches = math.ceil(len(documents) / batch_size)
        for document in documents:
            document = self._get_embeddings(document)
            point = self._compose_point(document)
            upload_batch.append(point)
            if len(upload_batch) >= batch_size:
                self._upsert_points(col_name, upload_batch)
                batches_loaded += 1
                upload_batch = []
                logger.info(f"Batches loaded {batches_loaded} / {total_batches}")
        logger.info(f"Collection {col_name} has been filled.")

    
def split_into_chunks(documents: list[Document]) -> list[Document]:
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=config.chunk_max_len,
        chunk_overlap=config.chunk_overlap,
        length_function=len,
        is_separator_regex=False,
    )
    return text_splitter.split_documents(documents)


def merge_small_chunks(chunks: list[Document]) -> list[Document]:
    if not chunks:
        return chunks

    merged = []
    current = None

    for next_chunk in chunks:
        if current:
            combined_content = current.page_content + "\n\n---\n\n" + next_chunk.page_content
        else:
            combined_content = next_chunk.page_content
        
        if len(combined_content) <= config.chunk_min_len:
            current = Document(
                page_content=combined_content,
                metadata=next_chunk.metadata
            )
        else:
            merged.append(Document(
                page_content=combined_content,
                metadata=next_chunk.metadata
            ))
            current = None

    if current:
        merged.append(current)
    return merged


def upload_to_qdrant(chunks: list[Document], col_name: str) -> None:
    uploader = QdrantUploader()
    uploader.upload(chunks, col_name)


def upload_data(path: str, collection_name: str) -> None:
    logger.info(f"Reading data from path: {path}")
    documents = get_reader(path).read_data()
    chunks = split_into_chunks(documents)   
    chunks = merge_small_chunks(chunks)
    logger.info(f"Total chunks created: {len(chunks)}")
    upload_to_qdrant(chunks, collection_name)
    
