import os
import shutil
import chromadb
from dotenv import load_dotenv
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, StorageContext, Settings
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.embeddings.google_genai import GoogleGenAIEmbedding
from llama_index.llms.google_genai import GoogleGenAI

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    raise ValueError("API Key Google tidak ditemukan.")

Settings.llm = GoogleGenAI(
    model="models/gemini-2.5-flash",
    api_key=GOOGLE_API_KEY
)

Settings.embed_model = GoogleGenAIEmbedding(
    model_name="models/gemini-embedding-001",
    api_key=GOOGLE_API_KEY
)

def ingest_data():
    db_path = "/app/chroma_db"
    data_path = "./data"

    if os.path.exists(db_path):
        shutil.rmtree(db_path)
    
    os.makedirs(db_path, exist_ok=True)

    db = chromadb.PersistentClient(path=db_path)
    chroma_collection = db.get_or_create_collection("askh_knowledge")
    vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
    storage_context = StorageContext.from_defaults(vector_store=vector_store)

    if not os.path.exists(data_path):
        return

    documents = SimpleDirectoryReader(data_path, recursive=True).load_data()
    
    if len(documents) == 0:
        return

    VectorStoreIndex.from_documents(
        documents, 
        storage_context=storage_context,
        show_progress=True
    )

if __name__ == "__main__":
    ingest_data()