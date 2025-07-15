import os
import json
import logging
from pathlib import Path
from typing import List, Dict, Any
import chromadb
from chromadb.config import Settings
from openai import OpenAI

# --- Configuration ---
SCRIPT_DIR = Path(__file__).parent.absolute()
RESOURCES_FILE = SCRIPT_DIR / 'structured_resources.json'
# --- End Configuration ---

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class SimpleRAGResourceMatcher:
    def __init__(self):
        # 1. Initialize OpenAI
        openai_key = os.environ.get("OPENAI_API_KEY") or os.environ.get("OPEN_API_KEY")
        if not openai_key:
            raise ValueError("OPENAI_API_KEY or OPEN_API_KEY environment variable is required.")
        
        self.client = OpenAI(api_key=openai_key)
        
        # 2. Initialize ChromaDB
        try:
            self.chroma_client = chromadb.Client(Settings(anonymized_telemetry=False))
            self.collection = self.chroma_client.create_collection(
                name="resources",
                get_or_create=True
            )
            self._load_resources()
            logging.info("Simple RAG Resource Matcher initialized successfully")
        except Exception as e:
            logging.error(f"Failed to initialize Simple RAG Resource Matcher: {e}")
            raise
    
    def _load_resources(self):
        """Load resources into ChromaDB"""
        logging.info("Loading resources into ChromaDB...")
        
        with open(RESOURCES_FILE, 'r') as f:
            resources = json.load(f)
        
        documents = []
        metadatas = []
        ids = []
        
        for i, resource in enumerate(resources):
            # Create searchable text
            text = f"""
            Resource: {resource.get('resource_name', 'Unknown')}
            Organization: {resource.get('organization', 'Unknown')}
            Category: {resource.get('category', 'Unknown')}
            Services: {resource.get('services', 'Unknown')}
            Target Population: {resource.get('target_population', 'Unknown')}
            Eligibility: {resource.get('eligibility', 'Unknown')}
            Location: {resource.get('location', 'Unknown')}
            Hours: {resource.get('hours', 'Unknown')}
            Contact: {resource.get('contact', 'Unknown')}
            """.strip()
            
            documents.append(text)
            metadatas.append(resource)
            ids.append(f"resource_{i}")
        
        # Add to ChromaDB
        self.collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
        
        logging.info(f"Loaded {len(documents)} resources into ChromaDB")
    
    def get_recommendations(self, client_data: Dict[str, Any], resource_type: str = "housing") -> Dict[str, Any]:
        """Get resource recommendations for a client"""
        try:
            # Create search query from client data
            query = f"I need {resource_type} resources for a client with these needs: {client_data}"
            
            # Search ChromaDB
            results = self.collection.query(
                query_texts=[str(query)],
                n_results=5
            )
            
            # Format results
            recommendations = []
            if results['documents'] and results['documents'][0]:
                for i, doc in enumerate(results['documents'][0]):
                    metadata = results['metadatas'][0][i]
                    recommendations.append({
                        'resource_name': metadata.get('resource_name', 'Unknown'),
                        'organization': metadata.get('organization', 'Unknown'),
                        'contact': metadata.get('contact', 'N/A'),
                        'services': metadata.get('services', 'N/A'),
                        'category': metadata.get('category', resource_type),
                        'location': metadata.get('location', 'Not specified'),
                        'hours': metadata.get('hours', 'Not specified'),
                        'eligibility': metadata.get('eligibility', 'Not specified'),
                        'target_population': metadata.get('target_population', 'Not specified')
                    })
            
            # Generate summary with OpenAI
            summary = self._generate_summary(client_data, recommendations, resource_type)
            
            return {
                "llm_summary": summary,
                "retrieved_recommendations": recommendations,
                "client_question": f"Find {resource_type} resources for a client."
            }
            
        except Exception as e:
            logging.error(f"Error getting recommendations: {e}")
            return {
                "llm_summary": f"Error: {str(e)}",
                "retrieved_recommendations": [],
                "client_question": ""
            }
    
    def _generate_summary(self, client_data: Dict[str, Any], recommendations: List[Dict], resource_type: str) -> str:
        """Generate a summary using OpenAI"""
        try:
            if not recommendations:
                return "No matching resources found for this client."
            
            # Create prompt
            prompt = f"""
            Based on the client data: {client_data}
            And these {resource_type} resources: {recommendations[:3]}
            
            Provide a helpful summary recommending the best resource and explain why it's suitable.
            Keep it concise and professional.
            """
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a helpful social worker assistant."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=300,
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logging.error(f"Error generating summary: {e}")
            return f"Found {len(recommendations)} matching resources. Please review the list below." 