import sys
import logging
from pathlib import Path
from typing import Optional, Union
from colorama import init, Fore, Style


init(autoreset=True)

LOG_COLORS = {
    logging.DEBUG: Fore.CYAN,
    logging.INFO: Fore.GREEN,
    logging.WARNING: Fore.YELLOW,
    logging.ERROR: Fore.RED,
    logging.CRITICAL: Fore.RED + Style.BRIGHT,
}


class ColoredFormatter(logging.Formatter):
    def format(self, record):
        log_color = LOG_COLORS.get(record.levelno, "")
        record.levelname = f"{log_color}{record.levelname}{Style.RESET_ALL}"
        record.msg = f"{log_color}{record.msg}{Style.RESET_ALL}"
        return super().format(record)


def init_logger(
    name: str = "app",
    level: int = logging.INFO,
    log_file: Optional[Union[str, Path]] = None,
    use_json: bool = False,
) -> logging.Logger:
    """
    Creates structured logger.

    Args:
        name: logger name.
        level: logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL).
        log_file: file path to write logs to (optional).
        use_json: if True - logs are in json format.

    Returns:
        Настроенный Logger.
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)

    if logger.handlers:
        logger.handlers.clear()

    if use_json:
        formatter = logging.Formatter(
            '{"time": "%(asctime)s", "name": "%(name)s", "level": "%(levelname)s", "message": "%(message)s"}',
            datefmt="%Y-%m-%d %H:%M:%S"
        )
    else:
        formatter = ColoredFormatter(
            fmt="%(asctime)s | %(name)-10s | %(levelname)-8s | %(message)s",
            datefmt="%H:%M:%S"
        )

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    if log_file:
        log_file = Path(log_file)
        log_file.parent.mkdir(parents=True, exist_ok=True)
        file_handler = logging.FileHandler(log_file, encoding="utf-8")
        file_handler.setLevel(level)
        file_formatter = logging.Formatter(
            fmt="%(asctime)s | %(name)-10s | %(levelname)-8s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        file_handler.setFormatter(file_formatter)
        logger.addHandler(file_handler)

    logger.propagate = False

    return logger
