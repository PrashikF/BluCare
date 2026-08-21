from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, StateGraph


from app.graph.remedy import generate_remedy
from app.graph.retrieval import retrieve_condition_docs, retrieve_remedy_docs
from app.graph.synthesis import synthesize_conditions
from app.core.config import settings
from app.schemas.state import TriageState


def central_agent_node(state: TriageState) -> dict:
    from app.graph.central_agent import central_agent_node_impl

    last_user_msgs = [m for m in state["messages"] if getattr(m, "type", m.get("role") if isinstance(m, dict) else None) in ("human", "user")]
    conversation_text = "\n".join(
        m.content if hasattr(m, "content") else m.get("content", "") for m in last_user_msgs
    )



    top_conditions = state.get("retrieved_docs", [])
    previous_stage = state.get("stage")
    possible_conditions = state.get("possible_conditions", [])

    result = central_agent_node_impl(
        conversation_messages=state["messages"],
        known_facts=state.get("symptom_facts", {}),
        top_conditions=top_conditions,
        possible_conditions=possible_conditions,
        turn_count=state.get("turn_count", 0),
        max_turns=settings.max_intake_turns,
        state_summary=state.get("chat_summary")
    )

    # Delta Updates: Merge the new updates into the existing symptom facts
    current_facts = state.get("symptom_facts", {})
    updates_dict = result.symptom_updates.model_dump(exclude_unset=True, exclude_none=True)
    
    # Handle retractions first
    if "symptoms_to_remove" in updates_dict:
        to_remove = [s.lower() for s in updates_dict.pop("symptoms_to_remove")]
        for key in ["associated_symptoms", "known_allergies"]:
            if key in current_facts and isinstance(current_facts[key], list):
                # Keep items that are NOT in to_remove
                current_facts[key] = [item for item in current_facts[key] if item.lower() not in to_remove]

    for k, v in updates_dict.items():
        if isinstance(v, list) and isinstance(current_facts.get(k), list):
            # Extend lists (like associated_symptoms) uniquely
            current_facts[k] = list(set(current_facts[k] + v))
        else:
            current_facts[k] = v

    updates = {
        "symptom_facts": current_facts,
        "router_decision": result.decision,
        "confidence_score": result.confidence_score,
        "turn_count": state.get("turn_count", 0) + 1,
        "stage": "central_agent",
    }

    # Rolling Summary Logic
    if updates["turn_count"] % 3 == 0 and len(state["messages"]) > 4:
        from app.graph.central_agent import summarize_chat
        new_summary = summarize_chat(conversation_text)
        updates["chat_summary"] = new_summary

    if result.decision == "call_rag" and previous_stage == "rag":
        # Loop prevention: we just did RAG.
        if top_conditions:
            updates["router_decision"] = "final_synthesis"
        else:
            updates["router_decision"] = "wait_for_user"
            updates["messages"] = [{"role": "assistant", "content": "I couldn't find any specific conditions matching that in my medical database. Could you provide a bit more detail about your symptoms?"}]

    if updates["router_decision"] == "call_rag":
        updates["latest_rag_query"] = result.rag_query
    
    if result.response_to_user and updates.get("router_decision") != "wait_for_user":
        updates["messages"] = [{"role": "assistant", "content": result.response_to_user}]

    return updates





def rag_retrieval_node(state: TriageState) -> dict:
    latest_user_message = next(
        (m.content if hasattr(m, "content") else m.get("content", "")
         for m in reversed(state["messages"])
         if getattr(m, "type", m.get("role") if isinstance(m, dict) else None) in ("human", "user")),
        "",
    )
    docs = retrieve_condition_docs(state["symptom_facts"], latest_user_message)
    serializable_docs = [{"page_content": d.page_content, "metadata": d.metadata} for d in docs]
    return {"retrieved_docs": serializable_docs, "stage": "rag"}


def distillation_node(state: TriageState) -> dict:
    from app.graph.distillation import distill_rag_docs
    docs = state.get("retrieved_docs", [])
    if not docs:
        return {"retrieved_docs": []}
    distilled = distill_rag_docs(state["symptom_facts"], docs)
    return {"retrieved_docs": distilled}


def condition_synthesis_node(state: TriageState) -> dict:
    from langchain_core.documents import Document
    docs = [Document(page_content=d["page_content"], metadata=d["metadata"]) for d in state.get("retrieved_docs", [])]
    result = synthesize_conditions(state["symptom_facts"], docs)
    
    summary_list = "\n".join(f"- {s}" for s in result.summary)
    causes_list = "\n".join(f"- {c.name}: {c.reason}" for c in result.alternative_conditions)
    
    markdown_output = (
        f"Summary:\n{summary_list}\n\n"
        f"Most likely condition: {result.most_likely_condition.name}\n"
        f"{result.most_likely_condition.reason}\n\n"
        f"Alternative conditions:\n{causes_list}\n\n"
        f"Explanation:\n{result.explanation}\n\n"
        f"Recommendation:\n- {result.recommendation}\n\n"
        f"Would you like some home remedies, OTC options, or have any other questions about this diagnosis?\n\n"
        f"[ACTION:Find nearby hospitals for {result.most_likely_condition.name}]\n"
        f"[ACTION:Give me home remedies for {result.most_likely_condition.name}]"
    )

    conditions_dump = [result.most_likely_condition.model_dump()] + [c.model_dump() for c in result.alternative_conditions]
    
    return {
        "possible_conditions": conditions_dump,
        "messages": [{"role": "assistant", "content": markdown_output}],
        "stage": "post_prediction",
    }


def remedy_node(state: TriageState) -> dict:
    conditions = state.get("possible_conditions", [])
    if not conditions:
        return {"stage": "post_prediction", "messages": [{"role": "assistant", "content": "I haven't diagnosed any conditions yet."}]}

    # Get the top 2 conditions
    top_conditions = [c["name"] for c in conditions[:2]]
    latest_user_message = next(
        (m.content if hasattr(m, "content") else m.get("content", "")
         for m in reversed(state["messages"])
         if getattr(m, "type", m.get("role") if isinstance(m, dict) else None) in ("human", "user")),
        "",
    )
    patient_context = {
        "age_group": state["symptom_facts"].get("age_group"),
        "is_pregnant": state["symptom_facts"].get("is_pregnant"),
        "known_allergies": state["symptom_facts"].get("known_allergies"),
    }

    # Retrieve docs for both conditions
    all_docs = []
    for cond in top_conditions:
        docs = retrieve_remedy_docs(cond, latest_user_message)
        all_docs.extend(docs)

    from app.graph.synthesis import format_docs_for_prompt
    context_text = format_docs_for_prompt(all_docs)

    from langchain_core.prompts import ChatPromptTemplate
    from app.core.llm import get_llm
    from app.schemas.state import RemedyOutput
    
    # We will use the existing remedy prompt but feed it the combined conditions
    from app.graph.remedy import _REMEDY_SYSTEM_PROMPT

    prompt = ChatPromptTemplate.from_messages([("system", _REMEDY_SYSTEM_PROMPT)])
    llm = get_llm(temperature=0.2)
    condition_names_str = " and ".join(top_conditions)
    result = (prompt | llm.with_structured_output(RemedyOutput)).invoke({
        "condition_name": condition_names_str,
        "patient_context": patient_context,
        "context": context_text,
    })

    remedies_formatted = [f"- **{r.name}**: {r.why_it_helps}" for r in result.home_remedies]
    otc_formatted = [f"- **{r.name}**: {r.why_it_helps}" for r in result.otc_options]

    remedy_text = (
        f"Here are some remedies based on the likely conditions ({condition_names_str}):\n\n"
        "### Ayurvedic & Home Remedies\n"
        f"{chr(10).join(remedies_formatted) if remedies_formatted else 'None specifically supported by sources.'}\n\n"
        "### OTC Options (general guidance only)\n"
        f"{chr(10).join(otc_formatted) if otc_formatted else 'None specifically supported by sources.'}\n\n"
        f"**Seek medical care immediately if you notice:** {'; '.join(result.red_flags_to_watch_for)}.\n\n"
        "Do you have any other questions?"
    )
    return {
        "remedy_response": result.model_dump(),
        "messages": [{"role": "assistant", "content": remedy_text}],
        "stage": "post_prediction",
    }


def post_diagnosis_chat_node(state: TriageState) -> dict:
    from langchain_core.prompts import ChatPromptTemplate
    from app.core.llm import get_llm

    conditions = state.get("possible_conditions", [])
    predicted_text = "\n".join([f"- {c['name']}: {c['reason']}" for c in conditions]) if conditions else "No diagnosis made."
    
    docs = state.get("retrieved_docs", [])
    context_text = "\n".join([f"- {doc['page_content']}" for doc in docs]) if docs else "No medical context retrieved."

    system_prompt = """You are a helpful medical assistant answering follow-up questions about a patient's recent diagnosis.
    
    The patient's predicted conditions:
    {predicted_text}
    
    Medical Context (use this to answer safely and accurately):
    {context_text}
    
    Rule: Answer the user's latest question concisely and warmly based on the predicted conditions and the medical context.
    Do not invent new diagnoses. End by asking if they need anything else.
    """
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("placeholder", "{messages}"),
    ])
    
    # Pass only the last few messages for token efficiency
    recent_messages = state["messages"][-6:] if len(state["messages"]) > 6 else state["messages"]
    
    llm = get_llm(temperature=0.4)
    chain = prompt | llm
    
    response = chain.invoke({
        "predicted_text": predicted_text,
        "context_text": context_text,
        "messages": recent_messages,
    })
    
    return {
        "messages": [{"role": "assistant", "content": response.content}],
        "stage": "post_prediction",
    }


def facilities_node(state: TriageState) -> dict:
    from app.core.llm import get_llm
    from app.rag.tools.facilities_tool import find_nearby_facilities
    from langchain_core.messages import SystemMessage, ToolMessage
    
    llm_with_tools = get_llm(temperature=0).bind_tools([find_nearby_facilities])
    
    sys_msg = SystemMessage(content="You are a medical routing assistant. The user wants to find nearby hospitals or ambulances. You MUST call the `find_nearby_facilities` tool. Extract their Latitude (lat) and Longitude (lon) from the [SYSTEM CONTEXT] in their message. Determine if they need a 'hospital' or 'ambulance'. Extract their disease from the conversation (use 'general' if none).")
    
    response = llm_with_tools.invoke([sys_msg] + state["messages"][-4:])
    
    if response.tool_calls:
        tool_call = response.tool_calls[0]
        tool_msg = find_nearby_facilities.invoke(tool_call)
        
        final_llm = get_llm(temperature=0.3)
        final_sys = SystemMessage(content="You are BluCare. Present the scraped facilities (if any) to the user warmly and concisely. Use markdown links for the Google Maps links.")
        
        final_resp = final_llm.invoke([final_sys] + state["messages"][-4:] + [response, ToolMessage(content=str(tool_msg), tool_call_id=tool_call["id"])])
        
        return {
            "messages": [{"role": "assistant", "content": final_resp.content}],
            "stage": "post_prediction",
        }
    else:
        return {
            "messages": [{"role": "assistant", "content": "I couldn't locate your GPS coordinates to find nearby facilities. Please ensure location services are enabled."}],
            "stage": "post_prediction",
        }


def route_after_agent(state: TriageState) -> str:
    decision = state.get("router_decision")
    if decision == "call_rag":
        if state.get("stage") == "rag":
            # Infinite loop prevention: LLM asked for RAG again immediately
            return "condition_synthesis" if state.get("retrieved_docs") else "wait_for_user"
        return "rag_retrieval"
    elif decision == "final_synthesis":
        return "condition_synthesis"
    elif decision == "call_remedy":
        return "remedy"
    elif decision == "call_facilities":
        return "facilities"
    elif decision == "post_diagnosis_chat":
        return "post_diagnosis_chat"
    else:
        return "wait_for_user"


def build_graph():
    graph = StateGraph(TriageState)

    graph.add_node("central_agent", central_agent_node)
    graph.add_node("rag_retrieval", rag_retrieval_node)
    graph.add_node("distillation", distillation_node)

    graph.add_node("condition_synthesis", condition_synthesis_node)
    graph.add_node("remedy", remedy_node)
    graph.add_node("facilities", facilities_node)
    graph.add_node("post_diagnosis_chat", post_diagnosis_chat_node)

    graph.set_entry_point("central_agent")

    graph.add_conditional_edges(
        "central_agent",
        route_after_agent,
        {

            "rag_retrieval": "rag_retrieval",
            "condition_synthesis": "condition_synthesis",
            "remedy": "remedy",
            "facilities": "facilities",
            "post_diagnosis_chat": "post_diagnosis_chat",
            "wait_for_user": END,
        }
    )

    graph.add_edge("rag_retrieval", "distillation")
    graph.add_edge("distillation", "condition_synthesis")
    graph.add_edge("condition_synthesis", END)
    graph.add_edge("remedy", END)
    graph.add_edge("facilities", END)
    graph.add_edge("post_diagnosis_chat", END)


    # Attempt to use Redis checkpointer for production, fallback to SqliteSaver/MemorySaver
    try:
        # pyrefly: ignore [missing-import]
        from langgraph.checkpoint.redis import RedisSaver
        # pyrefly: ignore [missing-import]
        from redis import Redis
        redis_conn = Redis.from_url(settings.redis_url)
        redis_conn.ping()
        checkpointer = RedisSaver(redis_conn)
        print(f"Using Redis for state checkpointing ({settings.redis_url}).")
    except Exception:
        try:
            import sqlite3
            # pyrefly: ignore [missing-import]
            from langgraph.checkpoint.sqlite import SqliteSaver
            sqlite_conn = sqlite3.connect("checkpoints.sqlite", check_same_thread=False)
            checkpointer = SqliteSaver(sqlite_conn)
            print("Using SQLite for state checkpointing (checkpoints.sqlite).")
        except Exception:
            from langgraph.checkpoint.memory import MemorySaver
            checkpointer = MemorySaver()
            print("Using MemorySaver for state checkpointing.")

    return graph.compile(checkpointer=checkpointer)


compiled_graph = build_graph()
