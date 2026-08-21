import os

chat_path = '/Users/Abhi/Downloads/BluCare/BluCare/frontend/src/pages/MultiRagChatPage.jsx'
with open(chat_path, 'r') as f:
    chat = f.read()

old_logic = """    if (isLoading || thinkingStep !== 'Analyzing clinical guidelines...') {
      dot.className = 'brand-dot generating shrink-0 transition-all duration-400 ease-in-out';
      dot.style.boxShadow = '';
    } else if (inputQuery.trim().length > 0) {
      dot.className = 'brand-dot typing shrink-0 transition-all duration-400 ease-in-out';
      dot.style.boxShadow = '';
    } else {
      dot.className = 'brand-dot shrink-0 transition-all duration-400 ease-in-out';
      dot.style.boxShadow = 'none';
    }"""

new_logic = """    if (inputQuery.trim().length > 0 && !isLoading) {
      dot.className = 'brand-dot typing shrink-0 transition-all duration-400 ease-in-out';
      dot.style.boxShadow = '';
    } else {
      // Return to original default color when idle or generating
      dot.className = 'brand-dot shrink-0 transition-all duration-400 ease-in-out';
      dot.style.boxShadow = 'none';
    }"""

chat = chat.replace(old_logic, new_logic)

with open(chat_path, 'w') as f:
    f.write(chat)

print("Dot logic updated to return to original color during generation")
