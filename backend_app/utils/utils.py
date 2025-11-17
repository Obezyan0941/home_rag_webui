import json
from typing import Any


def save_to_json(data: Any, filename: str) -> None:
    if not 'json' in filename:
        raise AssertionError("File name does not contain \".json\"")
    with open(filename, "w", encoding="utf-8") as outfile:
        json.dump(data, outfile, indent=4, ensure_ascii=False)

def read_json(filename: str) -> Any:
    with open(filename, 'r', encoding="utf-8") as json_file:
        json_file = json.load(json_file)

    return json_file


