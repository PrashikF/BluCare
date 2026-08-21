from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_groq import ChatGroq
from app.core.config import settings

def distill_rag_docs(symptom_facts: dict, raw_docs: list) -> list:
    """
    Acts as the 'Intern': Uses a fast, cheap model to read dense RAG documents
    and extract only the clinical facts relevant to the patient's symptoms.
    """
    if not raw_docs:
        return []

    # Use the fast, cheap 8B model specifically for this task to save time/money
    # We use the secondary API key to avoid rate limiting the main 70b model
    fast_llm = ChatGroq(
        model=settings.groq_model,
        temperature=0.0,
        groq_api_key=settings.groq_api_key,
    )

    system_prompt = """You are a medical data extraction intern.
Your job is to read raw medical textbook excerpts and extract ONLY the bullet points that directly relate to the patient's reported symptoms.
If a document is completely irrelevant to the patient, return "IRRELEVANT".
Keep your output extremely concise. Do not include introductory text."""

    patient_context = f"Patient Symptoms: {symptom_facts}"
    
    # 1. Compile all prompts
    prompts = []
    for doc in raw_docs:
        content = doc.get("page_content", "")
        prompt = f"{patient_context}\n\nRaw Document Text:\n{content}"
        prompts.append([SystemMessage(content=system_prompt), HumanMessage(content=prompt)])
        
    # 2. Execute all LLM calls in parallel!
    # This turns 10 sequential 0.5s calls (5s total) into 1 parallel 0.5s batch!
    responses = fast_llm.batch(prompts)
    
    # 3. Process the parallel results
    distilled_docs = []
    for doc, response in zip(raw_docs, responses):
        distilled_text = response.content.strip()
        if "IRRELEVANT" not in distilled_text.upper() and len(distilled_text) > 10:
            distilled_docs.append({"page_content": distilled_text, "metadata": doc.get("metadata", {})})
            
    return distilled_docs
