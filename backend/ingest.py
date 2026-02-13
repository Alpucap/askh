import os
import shutil
import chromadb
from dotenv import load_dotenv

from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, StorageContext, Settings
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.embeddings.google_genai import GoogleGenAIEmbedding
from llama_index.llms.google_genai import GoogleGenAI

#Load Env
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    raise ValueError("API Key Google tidak ditemukan. Cek file .env kamu!")

#Config Models
Settings.llm = GoogleGenAI(
    model="models/gemini-2.5-flash",
    api_key=GOOGLE_API_KEY
)

Settings.embed_model = GoogleGenAIEmbedding(
    model_name="models/gemini-embedding-001",
    api_key=GOOGLE_API_KEY
)

def ingest_data():
    print("Memulai proses ingestion data...")

    #Clean Old DB
    if os.path.exists("./chroma_db"):
        print("🧹 Menghapus database lama agar bersih...")
        shutil.rmtree("./chroma_db") 

    #Setup ChromaDB Baru
    db = chromadb.PersistentClient(path="./chroma_db")
    chroma_collection = db.get_or_create_collection("askh_knowledge")
    vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
    storage_context = StorageContext.from_defaults(vector_store=vector_store)

    #Read Data
    print("Membaca folder ./data (termasuk sub-folder)...")
    documents = SimpleDirectoryReader("./data", recursive=True).load_data()
    
    print(f"Ditemukan {len(documents)} bagian dokumen.")

    if len(documents) == 0:
        print("TIDAK ADA FILE YANG DIBACA! Pastikan ada file .md di folder data.")
        return

    #Create Index
    print("Sedang melatih AI (Embedding)...")
    VectorStoreIndex.from_documents(
        documents, 
        storage_context=storage_context,
        show_progress=True
    )

    print("Ingestion Selesai! Database tersimpan di ./chroma_db")

if __name__ == "__main__":
    ingest_data()