from langchain.chains.query_constructor.base import AttributeInfo

DOCUMENT_CONTENT_DESCRIPTION = (
    "Medical reference information for triage: structured disease/symptom/"
    "medicine records from a curated JSON database, and raw text chunks "
    "extracted from medical textbooks (PDFs)."
)

METADATA_FIELD_INFO = [
    AttributeInfo(
        name="document_type",
        description=(
            "Whether this chunk comes from the structured JSON medical "
            "database ('structured_json_db') or from a raw PDF textbook "
            "('medical_reference')."
        ),
        type="string",
    ),
    AttributeInfo(
        name="name",
        description=(
            "The specific disease, condition, or medical entity this chunk "
            "is about, e.g. 'Anxiety', 'Dengue Fever', 'Migraine'. Only "
            "present on structured_json_db chunks. Use this when the user "
            "names a specific condition."
        ),
        type="string",
    ),
    AttributeInfo(
        name="entity_type",
        description=(
            "The category of medical entity, e.g. 'disease', 'symptom', "
            "'medicine'. Only present on structured_json_db chunks."
        ),
        type="string",
    ),
    AttributeInfo(
        name="source",
        description=(
            "The origin database of a structured_json_db chunk, e.g. "
            "'medlineplus'. Only present on structured_json_db chunks."
        ),
        type="string",
    ),
    AttributeInfo(
        name="source_book",
        description=(
            "The filename of the source PDF textbook. Only present on "
            "medical_reference (PDF-derived) chunks."
        ),
        type="string",
    ),
    AttributeInfo(
        name="page_number",
        description="Page number within the source PDF book. Only present on medical_reference chunks.",
        type="integer",
    ),
]
