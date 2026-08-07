import logging
import sys
import uuid
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response

# Configure structured root logging format
LOG_FORMAT = "%(asctime)s [%(levelname)s] [Trace: %(correlation_id)s] %(name)s: %(message)s"


class CorrelationIdFilter(logging.Filter):
    """Injects correlation_id into log records."""

    def __init__(self, correlation_id: str = "sys"):
        super().__init__()
        self.correlation_id = correlation_id

    def filter(self, record):
        if not hasattr(record, "correlation_id"):
            record.correlation_id = getattr(self, "correlation_id", "sys")
        return True


def setup_logging():
    """Initializes application-wide structured logging."""
    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s")
    handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)

    # Avoid duplicate handlers on re-init
    if not root_logger.handlers:
        root_logger.addHandler(handler)


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """Middleware attaching X-Correlation-ID headers to all incoming HTTP requests."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        correlation_id = request.headers.get("X-Correlation-ID") or str(uuid.uuid4())
        request.state.correlation_id = correlation_id

        response = await call_next(request)
        response.headers["X-Correlation-ID"] = correlation_id
        return response
