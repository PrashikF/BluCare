import uuid
from typing import Tuple, Dict, Any
from app.graph.build_graph import compiled_graph
from langchain_core.messages import HumanMessage

class SessionService:
    @staticmethod
    def start_session(initial_message: str = None) -> Tuple[str, str]:
        thread_id = str(uuid.uuid4())
        
        if initial_message:
            config = {"configurable": {"thread_id": thread_id}}
            state = {"messages": [HumanMessage(content=initial_message)]}
            
            result = compiled_graph.invoke(state, config=config)
            
            # Extract last AI message
            messages = result.get("messages", [])
            last_message = ""
            if messages and messages[-1].type == "ai":
                last_message = messages[-1].content
                
            return thread_id, last_message
            
        return thread_id, "Hello! I am your AI symptom triage assistant. Describe how you are feeling."

    @staticmethod
    def process_message(thread_id: str, message: str) -> Dict[str, Any]:
        config = {"configurable": {"thread_id": thread_id}}
        state = {"messages": [HumanMessage(content=message)]}
        
        result = compiled_graph.invoke(state, config=config)
        
        # Safe extraction
        messages = result.get("messages", [])
        last_message = ""
        if messages and hasattr(messages[-1], "type") and messages[-1].type == "ai":
            last_message = getattr(messages[-1], "content", "")
            
        stage = result.get("stage", "unknown")
        
        # If the AI reached post_prediction, RAG and Synthesis are done.
        is_complete = stage == "post_prediction"
        
        symptom_facts = result.get("symptom_facts")
        if not isinstance(symptom_facts, dict):
            symptom_facts = {}
            
        return {
            "message": last_message,
            "is_complete": is_complete,
            "stage": stage,
            "symptom_facts": symptom_facts
        }
