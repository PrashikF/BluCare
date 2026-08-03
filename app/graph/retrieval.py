"""REPLACES the Chroma-based version of this file entirely."""

from app.rag.advanced_retrieval import advanced_retrieve


def build_dense_query(symptom_facts: dict) -> str:
    parts = []
    if symptom_facts.get("primary_symptom"):
        parts.append(symptom_facts["primary_symptom"])
    if symptom_facts.get("duration"):
        parts.append(f"for {symptom_facts['duration']}")
    if symptom_facts.get("severity") and symptom_facts["severity"] != "unknown":
        parts.append(f"{symptom_facts['severity']} severity")
    if symptom_facts.get("associated_symptoms"):
        parts.append("with " + ", ".join(symptom_facts["associated_symptoms"]))
    return " ".join(parts) or "general symptom inquiry"


def retrieve_condition_docs(symptom_facts: dict, latest_user_message: str):
    dense_query = build_dense_query(symptom_facts)
    return advanced_retrieve(dense_query_text=dense_query, natural_language_context=latest_user_message)


def retrieve_remedy_docs(condition_name: str, latest_user_message: str):
    dense_query = f"home remedies and over the counter treatment for {condition_name}"
    return advanced_retrieve(dense_query_text=dense_query, natural_language_context=latest_user_message)
