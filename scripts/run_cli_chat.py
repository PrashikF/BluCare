import sys
import uuid

sys.path.insert(0, ".")

from app.core.tracing import init_tracing  # noqa: E402
from app.graph.build_graph import compiled_graph  # noqa: E402
from app.rag.store import warm_up  # noqa: E402

init_tracing()


def main():
    # Warm up happens lazily now
    
    thread_id = str(uuid.uuid4())
    config = {"configurable": {"thread_id": thread_id}}

    print("=== Symptom Triage Agent (CLI test) ===")
    print(f"(thread_id: {thread_id} — check this in LangSmith to see the trace)\n")

    user_input = input("Describe how you're feeling: ")
    state = {
        "messages": [{"role": "user", "content": user_input}],
        "symptom_facts": {},
        "turn_count": 0,
        "confidence_score": 0.0,
        "red_flag": False,
        "red_flag_reason": None,
        "retrieved_docs": [],
        "possible_conditions": [],
        "remedy_response": None,
        "stage": "start",
    }

    while True:
        result = compiled_graph.invoke(state, config=config)

        last_msg = result["messages"][-1]
        content = last_msg.content if hasattr(last_msg, "content") else last_msg.get("content")
        print(f"\nAgent: {content}\n")

        if result.get("stage") == "done":
            print("=== Conversation complete ===")
            break

        user_input = input("You: ")
        state = {"messages": [{"role": "user", "content": user_input}]}
        # LangGraph merges this into the persisted state via the checkpointer —
        # we don't need to resend symptom_facts/turn_count/etc, they're loaded
        # from the thread_id automatically.


if __name__ == "__main__":
    main()
