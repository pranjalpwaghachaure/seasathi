import os
from dotenv import load_dotenv
from langchain_nvidia_ai_endpoints import ChatNVIDIA

load_dotenv()
api_key = os.getenv("NVIDIA_API_KEY")

# Ask NVIDIA for a list of all currently active models
llm = ChatNVIDIA(api_key=api_key)
available_models = llm.get_available_models()

print("\n--- ACTIVE NVIDIA MODELS ---")
for model in available_models:
    # Filter for Llama or Nemotron models that are usually good for our tasks
    if "llama" in model.id.lower() or "nemotron" in model.id.lower():
        print(model.id)