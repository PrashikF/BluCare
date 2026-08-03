import sys
sys.path.insert(0, ".")

from app.core.tracing import init_tracing
from app.rag.advanced_retrieval import advanced_retrieve

init_tracing()


def run_case(label, dense_query, nl_context):
    print(f"\n=== {label} ===")
    docs = advanced_retrieve(dense_query_text=dense_query, natural_language_context=nl_context)
    if not docs:
        print("No chunks passed the score threshold -- pipeline correctly returned nothing.")
        return
    for i, d in enumerate(docs, 1):
        label_name = d.metadata.get("name") or d.metadata.get("source_book") or "unknown"
        print(f"{i}. score={d.metadata.get('_score'):.3f} | {label_name}")
        print(f"   {d.page_content[:150]}...")


run_case(
    "Plain symptom query",
    "anxiety with dizziness and shortness of breath",
    "I've been feeling anxious with dizziness and shortness of breath",
)
run_case(
    "Named-condition self-query filter test (expects name='Anxiety')",
    "anxiety",
    "Tell me specifically about Anxiety",
)
run_case(
    "Ayurvedic-intent filter test (expects only chunks with ayurvedic_deep_herbs)",
    "anxiety remedies",
    "What are some Ayurvedic remedies for anxiety?",
)
