from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Union
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import numpy as np
import os
from dotenv import load_dotenv
import requests
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import torch

# Download NLTK data
nltk.download('punkt')
nltk.download('stopwords')

# Load environment variables
load_dotenv()

# Initialize the sentence transformer model
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

app = FastAPI(title="Image Search Recommendation Engine")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Unsplash API configuration
UNSPLASH_ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY")
if not UNSPLASH_ACCESS_KEY:
    raise ValueError("UNSPLASH_ACCESS_KEY not found in environment variables")

UNSPLASH_API_URL = "https://api.unsplash.com"

class SearchQuery(BaseModel):
    query: str
    search_type: str  # "images" or "collections"

class ImageUrls(BaseModel):
    raw: str
    full: str
    regular: str
    small: str
    thumb: str

class UserProfile(BaseModel):
    id: str
    username: str
    name: str
    portfolio_url: Optional[str]
    profile_image: Dict[str, str]
    links: Dict[str, str]

class Image(BaseModel):
    id: str
    created_at: str
    width: int
    height: int
    color: str
    likes: int
    description: Optional[str]
    alt_description: Optional[str]
    urls: ImageUrls
    user: UserProfile
    tags: List[Dict[str, str]] = []

class Collection(BaseModel):
    id: str
    title: str
    description: Optional[str]
    total_photos: int
    private: bool
    tags: List[Dict[str, str]] = []
    preview_photos: List[Dict[str, Dict[str, str]]] = []
    user: UserProfile

def get_semantic_similarity(query: str, items: List[Union[Image, Collection]]) -> List[float]:
    """Calculate semantic similarity between query and items using BERT embeddings."""
    # Get query embedding
    query_embedding = model.encode([query], convert_to_tensor=True)
    
    # Get item embeddings
    item_texts = []
    for item in items:
        if isinstance(item, Image):
            text = " ".join(filter(None, [
                item.description,
                item.alt_description,
                *[tag["title"] for tag in item.tags]
            ]))
        else:
            text = " ".join(filter(None, [
                item.title,
                item.description,
                *[tag["title"] for tag in item.tags]
            ]))
        item_texts.append(text if text.strip() else "no description available")
    
    item_embeddings = model.encode(item_texts, convert_to_tensor=True)
    
    # Calculate cosine similarities
    similarities = cosine_similarity(
        query_embedding.cpu().numpy(),
        item_embeddings.cpu().numpy()
    )[0]
    
    return similarities.tolist()

def search_unsplash_images(query: str, per_page: int = 100) -> List[Image]:
    """Search images on Unsplash API."""
    headers = {
        "Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}"
    }
    
    response = requests.get(
        f"{UNSPLASH_API_URL}/search/photos",
        headers=headers,
        params={
            "query": query,
            "per_page": per_page,
            "content_filter": "high"
        }
    )
    
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Failed to fetch images from Unsplash")
    
    data = response.json()
    return [Image(**result) for result in data["results"]]

def search_unsplash_collections(query: str, per_page: int = 20) -> List[Collection]:
    """Search collections on Unsplash API."""
    headers = {
        "Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}"
    }
    
    response = requests.get(
        f"{UNSPLASH_API_URL}/search/collections",
        headers=headers,
        params={
            "query": query,
            "per_page": per_page
        }
    )
    
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Failed to fetch collections from Unsplash")
    
    data = response.json()
    return [Collection(**result) for result in data["results"]]

@app.post("/api/search/images")
async def search_images(query: SearchQuery) -> List[Image]:
    """Search for images based on natural language query using semantic search."""
    if query.search_type != "images":
        raise HTTPException(status_code=400, detail="Invalid search type for image search")
    
    try:
        # Get images from Unsplash
        images = search_unsplash_images(query.query)
        
        # Calculate semantic similarities
        similarities = get_semantic_similarity(query.query, images)
        
        # Sort images by similarity score
        scored_images = list(zip(images, similarities))
        sorted_images = sorted(scored_images, key=lambda x: x[1], reverse=True)
        
        return [image for image, _ in sorted_images]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/search/collections")
async def search_collections(query: SearchQuery) -> List[Collection]:
    """Search for collections based on natural language query using semantic search."""
    if query.search_type != "collections":
        raise HTTPException(status_code=400, detail="Invalid search type for collection search")
    
    try:
        # Get collections from Unsplash
        collections = search_unsplash_collections(query.query)
        
        # Calculate semantic similarities
        similarities = get_semantic_similarity(query.query, collections)
        
        # Sort collections by similarity score
        scored_collections = list(zip(collections, similarities))
        sorted_collections = sorted(scored_collections, key=lambda x: x[1], reverse=True)
        
        return [collection for collection, _ in sorted_collections]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/images/{image_id}")
async def get_image(image_id: str) -> Image:
    """Get image details by ID."""
    headers = {
        "Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}"
    }
    
    response = requests.get(
        f"{UNSPLASH_API_URL}/photos/{image_id}",
        headers=headers
    )
    
    if response.status_code == 404:
        raise HTTPException(status_code=404, detail="Image not found")
    elif response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Failed to fetch image from Unsplash")
    
    result = response.json()
    return Image(**result)

@app.get("/api/collections/{collection_id}")
async def get_collection(collection_id: str) -> Collection:
    """Get collection details by ID."""
    headers = {
        "Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}"
    }
    
    response = requests.get(
        f"{UNSPLASH_API_URL}/collections/{collection_id}",
        headers=headers
    )
    
    if response.status_code == 404:
        raise HTTPException(status_code=404, detail="Collection not found")
    elif response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Failed to fetch collection from Unsplash")
    
    result = response.json()
    return Collection(**result) 