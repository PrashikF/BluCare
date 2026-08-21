import os
import re

chat_page_path = '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/pages/MultiRagChatPage.jsx'
with open(chat_page_path, 'r') as f:
    chat = f.read()

dot_effect = """
  // Sync Chat State to Sidebar Dot
  useEffect(() => {
    const dot = document.getElementById('chatBrandDot');
    if (!dot) return;
    
    if (isLoading || thinkingStep !== 'Analyzing clinical guidelines...') {
      dot.className = 'brand-dot generating shrink-0 transition-all duration-400 ease-in-out';
      dot.style.boxShadow = '';
    } else if (inputQuery.trim().length > 0) {
      dot.className = 'brand-dot typing shrink-0 transition-all duration-400 ease-in-out';
      dot.style.boxShadow = '';
    } else {
      dot.className = 'brand-dot shrink-0 transition-all duration-400 ease-in-out';
      dot.style.boxShadow = 'none';
    }
  }, [isLoading, inputQuery, thinkingStep]);

"""

chat = chat.replace('  // Citations drawer state', dot_effect + '  // Citations drawer state')

with open(chat_page_path, 'w') as f:
    f.write(chat)

print("Dot effect added!")
