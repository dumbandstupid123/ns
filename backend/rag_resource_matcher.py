import os
import json
import logging
from pathlib import Path
from dotenv import load_dotenv
from typing import List, Dict, Any

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_core.documents import Document
from langchain_core.prompts import PromptTemplate

# --- Configuration ---
load_dotenv()
SCRIPT_DIR = Path(__file__).parent.absolute()
RESOURCES_FILE = SCRIPT_DIR / 'structured_resources.json'
# --- End Configuration ---

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class RAGResourceMatcher:
    def __init__(self):
        # 1. Initialize OpenAI and Embedding Models
        if not os.environ.get("OPENAI_API_KEY"):
            raise ValueError("OPENAI_API_KEY environment variable is required.")
        
        self.llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
        self.embeddings = OpenAIEmbeddings(model="text-embedding-3-large")

        # 2. Load data, create documents, and build the in-memory vector store
        try:
            self._load_and_index_resources()
            logging.info("RAG Resource Matcher initialized successfully")
        except Exception as e:
            logging.error(f"Failed to initialize RAG Resource Matcher: {e}", exc_info=True)
            self.vector_store = None # Ensure it's None if initialization fails

    def _load_and_index_resources(self):
        """Loads resource data from JSON and builds an in-memory FAISS vector store."""
        logging.info("Loading resources from JSON and building vector store...")
        if not RESOURCES_FILE.exists():
            raise FileNotFoundError(f"Resources file not found at {RESOURCES_FILE}")

        with open(RESOURCES_FILE, 'r') as f:
            resources_data = json.load(f)

        # Create LangChain Documents from the structured data
        all_docs = []
        for resource in resources_data:
            # Build comprehensive full_text from the resource fields
            text_parts = []
            
            # Basic information
            if resource.get('organization'):
                text_parts.append(f"Organization: {resource['organization']}")
            if resource.get('program_type'):
                text_parts.append(f"Program: {resource['program_type']}")
            if resource.get('services'):
                text_parts.append(f"Services: {resource['services']}")
            if resource.get('target_population'):
                text_parts.append(f"Target Population: {resource['target_population']}")
            if resource.get('eligibility'):
                text_parts.append(f"Eligibility: {resource['eligibility']}")
            if resource.get('key_features'):
                text_parts.append(f"Key Features: {resource['key_features']}")
            if resource.get('contact'):
                text_parts.append(f"Contact: {resource['contact']}")
            
            # Category-specific information
            category = resource.get('category', 'housing')
            if category == 'food':
                # Add food-specific fields
                if resource.get('food_services_type'):
                    text_parts.append(f"Food Services: {resource['food_services_type']}")
                if resource.get('income_requirements'):
                    text_parts.append(f"Income Requirements: {resource['income_requirements']}")
                if resource.get('documentation_required'):
                    text_parts.append(f"Documentation: {resource['documentation_required']}")
                if resource.get('walk_ins_accepted'):
                    text_parts.append(f"Walk-ins: {resource['walk_ins_accepted']}")
                if resource.get('advance_booking_required'):
                    text_parts.append(f"Advance Booking: {resource['advance_booking_required']}")
                    
            elif category == 'transportation':
                # Add transportation-specific fields
                if resource.get('transportation_type'):
                    text_parts.append(f"Transportation Type: {resource['transportation_type']}")
                if resource.get('service_area'):
                    text_parts.append(f"Service Area: {resource['service_area']}")
                if resource.get('booking_method'):
                    text_parts.append(f"Booking Method: {resource['booking_method']}")
                if resource.get('advance_booking_required'):
                    text_parts.append(f"Advance Booking: {resource['advance_booking_required']}")
                    
            elif category == 'housing':
                # Add housing-specific fields
                if resource.get('housing_type'):
                    text_parts.append(f"Housing Type: {resource['housing_type']}")
                if resource.get('capacity'):
                    text_parts.append(f"Capacity: {resource['capacity']}")
                if resource.get('cost'):
                    text_parts.append(f"Cost: {resource['cost']}")
                if resource.get('availability'):
                    text_parts.append(f"Availability: {resource['availability']}")
            
            # Common detailed fields
            if resource.get('age_group'):
                text_parts.append(f"Age Group: {resource['age_group']}")
            if resource.get('immigration_status'):
                text_parts.append(f"Immigration Status: {resource['immigration_status']}")
            if resource.get('criminal_history'):
                text_parts.append(f"Criminal History: {resource['criminal_history']}")
            if resource.get('ada_accessible'):
                text_parts.append(f"ADA Accessible: {resource['ada_accessible']}")
            if resource.get('accepts_clients_without_id'):
                text_parts.append(f"Accepts Without ID: {resource['accepts_clients_without_id']}")
            if resource.get('hours'):
                text_parts.append(f"Hours: {resource['hours']}")
            if resource.get('location'):
                text_parts.append(f"Location: {resource['location']}")
            
            full_text = ". ".join(text_parts)
            
            # Create comprehensive metadata from the resource
            metadata = {
                'resource_name': resource.get('resource_name', resource.get('program_type', 'Unknown Program')),
                'organization': resource.get('organization', 'Unknown Organization'),
                'contact': resource.get('contact', ''),
                'target_population': resource.get('target_population', ''),
                'eligibility': resource.get('eligibility', ''),
                'services': resource.get('services', ''),
                'id': resource.get('id', ''),
                'category': category,
                'age_group': resource.get('age_group', ''),
                'location': resource.get('location', ''),
                'hours': resource.get('hours', ''),
                'key_features': resource.get('key_features', ''),
                'immigration_status': resource.get('immigration_status', ''),
                'accepts_clients_without_id': resource.get('accepts_clients_without_id', ''),
                'advance_booking_required': resource.get('advance_booking_required', ''),
                'ada_accessible': resource.get('ada_accessible', '')
            }
            
            doc = Document(page_content=full_text, metadata=metadata)
            all_docs.append(doc)

        if not all_docs:
            logging.warning("No documents were created from the resources file.")
            self.vector_store = None
            return

        # Split documents for better retrieval accuracy
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
        split_docs = text_splitter.split_documents(all_docs)

        # Create the in-memory vector store using FAISS
        logging.info(f"Creating FAISS index from {len(split_docs)} document chunks...")
        self.vector_store = FAISS.from_documents(split_docs, self.embeddings)
        logging.info("In-memory vector store created successfully.")

    def get_recommendations(self, client_data: Dict[str, Any], resource_type: str) -> Dict[str, Any]:
        """
        Enhanced RAG workflow with category filtering for housing, food, and transportation:
        1. Build a query from client data.
        2. Retrieve relevant documents using vector similarity search.
        3. Filter results by resource category (housing/food/transportation).
        4. Use the LLM to generate a summary of the filtered documents.
        """
        if not self.vector_store:
            logging.error("RAG Resource Matcher not initialized. Cannot get recommendations.")
            return {
                "llm_summary": "Error: The resource matching system is not available.",
                "retrieved_recommendations": [],
                "client_question": ""
            }
            
        question = self._build_client_question(client_data, resource_type)

        # Retrieve more documents initially to allow for filtering
        retrieved_docs = self.vector_store.similarity_search(question, k=25)
        
        # Filter documents by category
        filtered_docs = self._filter_by_category(retrieved_docs, resource_type)
        
        # Take top 5 after filtering
        final_docs = filtered_docs[:5]
        
        # Prepare recommendations for the final output
        final_recommendations = [doc.metadata for doc in final_docs]

        # Generate the final summary using the LLM
        recommendation_reason = self._generate_llm_summary(question, final_docs, resource_type)
        
        return {
            "recommendation_reason": recommendation_reason,
            "retrieved_recommendations": final_recommendations,
            "client_question": question
        }

    def _filter_by_category(self, documents: List[Document], resource_type: str) -> List[Document]:
        """Filter documents by resource category with enhanced keyword matching."""
        if resource_type not in ['food', 'housing', 'transportation']:
            return documents
            
        filtered = []
        for doc in documents:
            # Primary filter: check if the document has category metadata
            if 'category' in doc.metadata:
                if doc.metadata['category'] == resource_type:
                    filtered.append(doc)
            else:
                # Fallback: check content for category indicators
                content = doc.page_content.lower()
                if resource_type == 'food':
                    food_keywords = ['food', 'meal', 'pantry', 'nutrition', 'grocery', 'hunger', 'feeding', 'csfp', 'snap', 'tefap']
                    if any(keyword in content for keyword in food_keywords):
                        filtered.append(doc)
                elif resource_type == 'housing':
                    housing_keywords = ['housing', 'shelter', 'bed', 'room', 'apartment', 'home', 'residence', 'accommodation', 'lodging']
                    if any(keyword in content for keyword in housing_keywords):
                        filtered.append(doc)
                elif resource_type == 'transportation':
                    transport_keywords = ['transportation', 'transport', 'ride', 'bus', 'taxi', 'medical transport', 'mobility', 'travel', 'transit']
                    if any(keyword in content for keyword in transport_keywords):
                        filtered.append(doc)
        
        return filtered

    def _build_client_question(self, client_data: Dict[str, Any], resource_type: str) -> str:
        """Builds a detailed question string from client data for vector search."""
        parts = [f"Find {resource_type} resources for a client."]
        
        # Extract age from dateOfBirth if available
        age = None
        if 'dateOfBirth' in client_data and client_data['dateOfBirth']:
            try:
                from datetime import datetime
                dob = datetime.strptime(client_data['dateOfBirth'], '%Y-%m-%d')
                age = (datetime.now() - dob).days // 365
            except (ValueError, TypeError):
                pass # Ignore if format is wrong

        if age:
            parts.append(f"The client's age is {age}.")
        if client_data.get('gender'):
            parts.append(f"Gender: {client_data['gender']}.")
        if client_data.get('family_status'):
            parts.append(f"Family status: {client_data['family_status']}.")
        if client_data.get('employment_status'):
            parts.append(f"Employment: {client_data['employment_status']}.")
        if client_data.get('income_level'):
            parts.append(f"Income level: ${client_data['income_level']}.")
        if client_data.get('is_veteran'):
            parts.append(f"Veteran status: {'Yes' if client_data['is_veteran'] else 'No'}.")
        if client_data.get('has_disability'):
            parts.append(f"Has disability: {'Yes' if client_data['has_disability'] else 'No'}.")
        
        # Add specific needs based on resource type
        if resource_type == 'food':
            parts.append("Looking for food assistance, meals, pantries, or nutrition programs.")
        elif resource_type == 'housing':
            parts.append("Looking for housing assistance, shelter, or accommodation.")
        elif resource_type == 'transportation':
            parts.append("Looking for transportation assistance, rides, or mobility services.")
        
        # Use the detailed notes for context
        if client_data.get('notes'):
            parts.append(f"Client background and needs: {client_data['notes']}")
        
        # Add needs array if available
        if client_data.get('needs') and isinstance(client_data['needs'], list):
            parts.append(f"Specific needs: {', '.join(client_data['needs'])}")
            
        return " ".join(parts)

    def _generate_llm_summary(self, question: str, documents: List[Document], resource_type: str) -> str:
        """Uses the LLM to generate a helpful summary of the top recommended resources."""
        if not documents:
            return f"No matching {resource_type} resources were found for this client."

        # Extract metadata and page content for the prompt
        context = "\n\n---\n\n".join([
            f"Resource: {doc.metadata.get('resource_name', 'N/A')}\n"
            f"Organization: {doc.metadata.get('organization', 'N/A')}\n"
            f"Contact: {doc.metadata.get('contact', 'N/A')}\n"
            f"Target Population: {doc.metadata.get('target_population', 'N/A')}\n"
            f"Details: {doc.page_content}"
            for doc in documents
        ])

        resource_type_context = {
            'food': "food assistance, meals, pantries, or nutrition programs",
            'housing': "housing assistance, shelter, or accommodation services",
            'transportation': "transportation assistance, rides, or mobility services"
        }

        prompt = PromptTemplate.from_template(
            "You are a helpful case manager assistant. Based on the client's need for {resource_type_desc} "
            "and the provided resources, write a single, personalized sentence explaining why these resources "
            "are being recommended for this client. Address the social worker/case manager, not the client directly. "
            "Focus on how these resources match the client's specific situation and needs.\n\n"
            "Client's Need: {question}\n\n"
            "Available {resource_type} Resources:\n{context}\n\n"
            "Recommendation for Social Worker:"
        )
        
        chain = prompt | self.llm
        response = chain.invoke({
            "question": question, 
            "context": context,
            "resource_type": resource_type,
            "resource_type_desc": resource_type_context.get(resource_type, f"{resource_type} services")
        })
        return response.content if hasattr(response, 'content') else str(response)

# Helper to calculate age, in case it's needed elsewhere
from datetime import datetime

def _calculate_age(birth_date_str: str) -> int:
    """Calculates age from a 'YYYY-MM-DD' string."""
    if not birth_date_str:
        return 0
    try:
        birth_date = datetime.strptime(birth_date_str, '%Y-%m-%d')
        return (datetime.now() - birth_date).days // 365
    except (ValueError, TypeError):
        return 0 