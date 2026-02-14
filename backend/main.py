# import nest_asyncio
# nest_asyncio.apply()

import os
import chromadb
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from llama_index.core import VectorStoreIndex, Settings
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.llms.google_genai import GoogleGenAI
from llama_index.embeddings.google_genai import GoogleGenAIEmbedding

#Config
load_dotenv()

app = FastAPI(title="ASKH API")

#Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#Cek API Key
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("❌ GOOGLE_API_KEY tidak ditemukan di file .env!")

#Setup AI Models
Settings.llm = GoogleGenAI(
    model="models/gemini-2.5-flash",
    api_key=GOOGLE_API_KEY
)

Settings.embed_model = GoogleGenAIEmbedding(
    model_name="models/gemini-embedding-001",
    api_key=GOOGLE_API_KEY
)

#Load Knowledge Base
print("⚙️ Loading Knowledge Base...")
try:
    db = chromadb.PersistentClient(path="./chroma_db")
    chroma_collection = db.get_or_create_collection("askh_knowledge")
    vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
    index = VectorStoreIndex.from_vector_store(vector_store)
    
    #Setup Chat Engine
    chat_engine = index.as_chat_engine(
        chat_mode="context",
        system_prompt=(
            "Kamu adalah ASKH Assistant. "
            "Tugasmu membantu menjelaskan materi coding dan dokumentasi. "
            "Jawablah dengan ramah, jelas, dan menggunakan Bahasa Indonesia."
        )
    )
    print("✅ Database loaded successfully!")
except Exception as e:
    print(f"❌ Error loading database: {e}")
    index = None 
    chat_engine = None

#Helper Function

def get_markdown_title(filepath):
    """
    [BARU] Mencoba membaca judul dari Frontmatter (title: ...)
    atau dari Header pertama (# Judul).
    """
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            lines = f.readlines()
            
        #Cek Frontmatter
        if len(lines) > 0 and lines[0].strip() == "---":
            for line in lines[1:]:
                if line.strip() == "---": break
                if line.startswith("title:"):
                    return line.replace("title:", "").strip().strip('"').strip("'")

        for line in lines:
            if line.strip().startswith("# "):
                return line.strip().replace("# ", "").strip()
                
    except Exception as e:
        print(f"Error reading title for {filepath}: {e}")
    
    return None

def build_file_tree(root_path):
    """
    Fungsi Rekursif untuk membaca struktur folder bertingkat.
    """
    tree = []
    try:
        items = sorted(os.listdir(root_path))
    except FileNotFoundError:
        return []

    for item in items:
        if item.startswith('.'): continue
        
        full_path = os.path.join(root_path, item)
        
        if os.path.isdir(full_path):
            tree.append({
                "name": item,
                "type": "folder",
                "children": build_file_tree(full_path)
            })
        elif item.endswith(".md"):
            custom_title = get_markdown_title(full_path)

            rel_path = os.path.relpath(full_path, "./data").replace("\\", "/")
            
            tree.append({
                "name": item,
                "displayName": custom_title if custom_title else item.replace(".md", ""),
                "type": "file",
                "path": rel_path
            })
            
    return tree

#API Endpoint

@app.get("/")
def read_root():
    return {"status": "ASKH API is running 🚀"}

class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
def chat_endpoint(req: ChatRequest): 
    if not chat_engine:
        raise HTTPException(status_code=503, detail="Database belum siap/kosong.")
    
    try:
        print(f"📩 Chat: {req.message}")
        response = chat_engine.chat(req.message)
        return {"response": str(response)}
    except Exception as e:
        print(f"❌ Error Chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/docs")
def get_docs_structure():
    base_path = "./data"
    if not os.path.exists(base_path):
        return []
    return build_file_tree(base_path)

@app.get("/api/docs/content")
def get_doc_content(path: str):
    safe_path = os.path.normpath(os.path.join("./data", path))
    
    #Security check
    abs_data_path = os.path.abspath("./data")
    abs_target_path = os.path.abspath(safe_path)
    if not abs_target_path.startswith(abs_data_path):
        raise HTTPException(status_code=403, detail="Access denied")

    if os.path.exists(safe_path) and os.path.isfile(safe_path):
        with open(safe_path, "r", encoding="utf-8") as f:
            content = f.read()
            
            if content.startswith("---"):
                try:
                    parts = content.split("---", 2)
                    if len(parts) >= 3:
                        return {"content": parts[2].strip()}
                except:
                    pass 
            
            return {"content": content}
            
    raise HTTPException(status_code=404, detail="File not found")

#Run Server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)