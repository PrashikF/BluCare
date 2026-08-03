import re

_AYURVEDIC_TRIGGERS = [
    r"ayurved",
    r"\bherb",
    r"herbal",
    r"natural remedy",
    r"home remedy",
    r"desi (ilaj|nuska)",
    r"gharelu",
    r"kadha",
    r"traditional medicine",
]
_COMPILED = [re.compile(p, re.IGNORECASE) for p in _AYURVEDIC_TRIGGERS]


def wants_ayurvedic_info(text: str) -> bool:
    """
    Whether the user is specifically asking for Ayurvedic/home-remedy
    guidance. Drives the must_not(IsEmptyCondition) filter merge in
    advanced_retrieval.py -- see the note in this file's header about why
    this can't go through the self-query mechanism itself.
    """
    return any(p.search(text) for p in _COMPILED)
