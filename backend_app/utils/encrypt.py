import bcrypt
from bcrypt import checkpw


def encrypt(string: str) -> str:
    byte_string = string.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed_bytes = bcrypt.hashpw(byte_string, salt)

    return hashed_bytes.decode("utf-8")


def check_password(password: str, existing_password: str) -> bool:
    return checkpw(
        password.encode("utf-8"),
        existing_password.encode("utf-8")
    )