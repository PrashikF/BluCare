from langchain_groq import ChatGroq

from app.core.config import settings

_llm = None


def get_llm(temperature: float = 0.2):
    """
    Returns a ChatGroq client using active environment configuration.
    """
    return ChatGroq(
        model=settings.groq_model,
        groq_api_key=settings.groq_api_key,
        temperature=temperature,
    )
