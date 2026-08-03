from langchain_groq import ChatGroq

from app.core.config import settings

_llm = None


def get_llm(temperature: float = 0.2):
    """
    Returns a ChatGroq client. temperature=0.2 default keeps intake questions
    and synthesis focused; bump per-call if you want more variety in
    conversational phrasing later.
    """
    global _llm
    if _llm is None:
        _llm = ChatGroq(
            model=settings.groq_model,
            groq_api_key=settings.groq_api_key,
            temperature=temperature,
        )
    return _llm
