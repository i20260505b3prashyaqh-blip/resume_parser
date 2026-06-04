import chromadb

client = chromadb.PersistentClient(path="./resume_db")

collection = client.get_or_create_collection(
    name="candidates"
)

print("ChromaDB Connected Successfully!")