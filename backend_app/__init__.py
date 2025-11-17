import os
from pydantic import Field
from pydantic_settings import BaseSettings
from dotenv import load_dotenv, find_dotenv

from .utils.logger import init_logger


class DBConfig(BaseSettings):
    chunk_max_len: int = Field(validation_alias='CHUNK_MAX_LEN', default=800, gt=0)
    chunk_min_len: int = Field(validation_alias='CHUNK_MIN_LEN', default=200, gt=0)
    embedding_dim: int = Field(validation_alias='EMBEDDING_DIM', default=1024, gt=0)
    chunk_overlap: int = Field(validation_alias='CHUNK_OVERLAP', default=400, gt=0)
    upload_batch: int = Field(validation_alias='UPLOAD_BATCH', default=1, gt=0)
    ray_host: str = Field(validation_alias='RAY_HOST', default="localhost:8000")
    qdrant_host: str = Field(validation_alias='QDRANT_HOST', default="localhost:6333")


def init_runtime() -> None:
    # if os.path.exists('/run/secrets/secrets.txt'):
    #     secret_path = '/run/secrets/secrets.txt'
    # else:
    #     secret_path = './secrets/secrets.txt'

    # with open(secret_path) as f:
    #     secret_data = f.readlines()
    # for line in secret_data:
    #     line = line.strip()
    #     if line and not line.startswith('#') and '=' in line:
    #         key, value = line.split('=', 1)
    #         os.environ[key.strip()] = value.strip()
    
    load_dotenv(find_dotenv())


init_runtime()
config = DBConfig()
logger = init_logger()
