from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import json
import os
from typing import Dict, Any
import logging
from pathlib import Path
from datetime import datetime
from rag_resource_matcher import RAGResourceMatcher

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get the directory where the script is located
SCRIPT_DIR = Path(__file__).parent.absolute()
CLIENTS_FILE = SCRIPT_DIR / 'clients.json'

# Initialize RAG Resource Matcher
try:
    rag_matcher = RAGResourceMatcher()
    logger.info("RAG Resource Matcher initialized successfully")
except Exception as e:
    logger.error(f"FATAL: Failed to initialize RAG Resource Matcher: {e}")
    raise  # Re-raise the exception to stop the server from starting

def load_clients():
    """Load clients from JSON file."""
    try:
        if CLIENTS_FILE.exists():
            with open(CLIENTS_FILE, 'r') as f:
                return json.load(f)
        return {'clients': [], 'next_id': 1}
    except Exception as e:
        logger.error(f"Error loading clients: {e}")
        return {'clients': [], 'next_id': 1}

def save_clients(clients_data):
    """Save clients to JSON file."""
    try:
        with open(CLIENTS_FILE, 'w') as f:
            json.dump(clients_data, f, indent=2)
        return True
    except Exception as e:
        logger.error(f"Error saving clients: {e}")
        return False

def ensure_structure_exists(data: Dict[str, Any], path: str) -> None:
    """Ensure all intermediate dictionaries exist in the path."""
    parts = path.split('.')
    current = data
    for part in parts[:-1]:  # Don't process the last part as it will be the value we want to set
        if part not in current or not isinstance(current[part], dict):
            current[part] = {}
        current = current[part]

def validate_client_data(client_data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate and clean client data before saving."""
    # First, ensure the base structure exists
    base_structure = {
        'presentingConcerns': {},
        'socialHistory': {
            'incomeSources': {},
            'healthInsurance': {}
        },
        'consent': {}
    }
    
    # Merge the base structure with client_data
    for key, value in base_structure.items():
        if key not in client_data or not isinstance(client_data[key], dict):
            client_data[key] = value
        elif isinstance(value, dict):
            for sub_key, sub_value in value.items():
                if sub_key not in client_data[key] or not isinstance(client_data[key][sub_key], dict):
                    client_data[key][sub_key] = sub_value

    # Validate required fields
    required_fields = ['firstName', 'lastName', 'dateOfBirth', 'phoneNumber']
    for field in required_fields:
        if not client_data.get(field):
            raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
    
    # Add metadata
    client_data['createdAt'] = datetime.now().isoformat()
    client_data['lastUpdated'] = datetime.now().isoformat()
    
    # Define boolean fields with their default values
    bool_fields = {
        'interpreterNeeded': False,
        'presentingConcerns.housingInstability': False,
        'presentingConcerns.foodInsecurity': False,
        'presentingConcerns.unemployment': False,
        'presentingConcerns.domesticViolence': False,
        'presentingConcerns.mentalHealth': False,
        'presentingConcerns.substanceUse': False,
        'presentingConcerns.childWelfare': False,
        'presentingConcerns.legalIssues': False,
        'presentingConcerns.immigrationSupport': False,
        'presentingConcerns.medicalNeeds': False,
        'presentingConcerns.transportationNeeds': False,
        'presentingConcerns.other': False,
        'socialHistory.incomeSources.employment': False,
        'socialHistory.incomeSources.ssiSsdi': False,
        'socialHistory.incomeSources.tanf': False,
        'socialHistory.incomeSources.none': False,
        'socialHistory.healthInsurance.medicaid': False,
        'socialHistory.healthInsurance.medicare': False,
        'socialHistory.healthInsurance.private': False,
        'socialHistory.healthInsurance.none': False,
        'consent.understoodConfidentiality': False,
        'consent.consentToServices': False
    }
    
    # Process each boolean field
    for field_path, default_value in bool_fields.items():
        parts = field_path.split('.')
        
        # Navigate to the parent dictionary
        current = client_data
        for part in parts[:-1]:
            if part not in current or not isinstance(current[part], dict):
                current[part] = {}
            current = current[part]
        
        # Set the boolean value
        last_part = parts[-1]
        try:
            # Try to get the value from the input data using the same path navigation
            value = client_data
            for part in parts[:-1]:
                value = value.get(part, {})
            value = value.get(parts[-1], default_value)
            
            # Set the processed boolean value
            current[last_part] = bool(value)
        except (AttributeError, TypeError):
            # If any error occurs during the process, set the default value
            current[last_part] = default_value
    
    return client_data

@app.post('/api/add-client')
async def add_client(client_data: Dict[str, Any]):
    """Add a new client."""
    try:
        # Validate and clean the client data
        client_data = validate_client_data(client_data)
        
        # Load existing clients
        clients_data = load_clients()
        
        # Assign an ID to the new client
        client_data['id'] = clients_data['next_id']
        clients_data['next_id'] += 1
        
        # Add the new client to the list
        clients_data['clients'].append(client_data)
        
        # Save the updated clients data
        if save_clients(clients_data):
            return {"message": "Client added successfully", "client": client_data}
        else:
            raise HTTPException(status_code=500, detail="Failed to save client data")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error adding client: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/api/recent-clients')
async def get_recent_clients():
    """Get all clients."""
    try:
        clients_data = load_clients()
        return {"clients": clients_data['clients']}
    except Exception as e:
        logger.error(f"Error getting recent clients: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete('/api/clients/{client_id}')
async def delete_client(client_id: int):
    """Delete a client by ID."""
    try:
        # Load existing clients
        clients_data = load_clients()
        
        # Find the client to delete
        client_to_delete = None
        for i, client in enumerate(clients_data['clients']):
            if client['id'] == client_id:
                client_to_delete = clients_data['clients'].pop(i)
                break
        
        if not client_to_delete:
            raise HTTPException(status_code=404, detail="Client not found")
        
        # Save the updated clients data
        if save_clients(clients_data):
            return {"message": "Client deleted successfully", "deleted_client": client_to_delete}
        else:
            raise HTTPException(status_code=500, detail="Failed to save client data")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error deleting client: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def load_resources():
    """Load resources from JSON file."""
    try:
        resources_file = SCRIPT_DIR / 'structured_resources.json'
        if resources_file.exists():
            with open(resources_file, 'r') as f:
                resources_data = json.load(f)
                # structured_resources.json is an array, not an object with "resources" key
                if isinstance(resources_data, list):
                    return {"resources": resources_data}
                return resources_data
        return {'resources': []}
    except Exception as e:
        logger.error(f"Error loading resources: {e}")
        return {'resources': []}

def save_resources(resources_data):
    """Save resources to JSON file."""
    try:
        resources_file = SCRIPT_DIR / 'structured_resources.json'
        # Extract the resources array if it's wrapped in an object
        if isinstance(resources_data, dict) and 'resources' in resources_data:
            resources_array = resources_data['resources']
        else:
            resources_array = resources_data
        
        with open(resources_file, 'w') as f:
            json.dump(resources_array, f, indent=2)
        return True
    except Exception as e:
        logger.error(f"Error saving resources: {e}")
        return False

@app.get('/api/resources')
async def get_resources():
    """Get all resources."""
    try:
        resources_data = load_resources()
        
        # Add resource_name field to each resource for frontend compatibility
        for resource in resources_data.get('resources', []):
            if 'resource_name' not in resource:
                resource['resource_name'] = resource.get('program_type', 'Unknown Program')
        
        return resources_data
    except Exception as e:
        logger.error(f"Error getting resources: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put('/api/resources/{resource_name}')
async def update_resource(resource_name: str, resource_data: Dict[str, Any]):
    """Update a resource by name."""
    try:
        # Load existing resources
        resources_data = load_resources()
        
        # Find the resource to update
        resource_updated = False
        for i, resource in enumerate(resources_data['resources']):
            if resource['name'] == resource_name:
                # Update the resource with new data
                resources_data['resources'][i] = resource_data
                resource_updated = True
                break
        
        if not resource_updated:
            raise HTTPException(status_code=404, detail="Resource not found")
        
        # Save the updated resources data
        if save_resources(resources_data):
            return {"message": "Resource updated successfully", "resource": resource_data}
        else:
            raise HTTPException(status_code=500, detail="Failed to save resource data")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error updating resource: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/api/send-referral')
async def send_referral(referral_data: Dict[str, Any]):
    """Send a referral email (mock implementation)."""
    try:
        # Mock referral sending - in a real implementation, this would send an email
        logger.info(f"Sending referral for resource: {referral_data.get('resourceName')}")
        logger.info(f"Recipient: {referral_data.get('recipientEmail')}")
        logger.info(f"Sender: {referral_data.get('senderEmail')}")
        
        # Simulate some processing time
        import time
        time.sleep(0.5)
        
        # Return success response
        return {
            "message": "Referral sent successfully",
            "referral_id": f"ref_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "status": "sent"
        }
    except Exception as e:
        logger.error(f"Error sending referral: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/api/match-resources')
async def match_resources(request_data: Dict[str, Any]):
    """Match resources to client using RAG pipeline."""
    try:
        if not rag_matcher:
            raise HTTPException(status_code=500, detail="RAG Resource Matcher not initialized")
        
        client_data = request_data.get('client_data', {})
        resource_type = request_data.get('resource_type', 'housing')
        
        if not client_data:
            raise HTTPException(status_code=400, detail="Client data is required")
        
        # Get RAG recommendations
        recommendations = rag_matcher.get_recommendations(client_data, resource_type)
        
        return {
            "message": "Resources matched successfully",
            "recommendations": recommendations,
            "client_data": client_data,
            "resource_type": resource_type
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error matching resources: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/api/chat-followup')
async def chat_followup(request_data: Dict[str, Any]):
    """Handle follow-up chat questions about resource recommendations."""
    try:
        if not rag_matcher:
            raise HTTPException(status_code=500, detail="RAG Resource Matcher not initialized")
        
        message = request_data.get('message', '')
        client_data = request_data.get('client_data', {})
        resource_type = request_data.get('resource_type', 'housing')
        current_recommendations = request_data.get('current_recommendations', [])
        chat_history = request_data.get('chat_history', [])
        
        if not message:
            raise HTTPException(status_code=400, detail="Message is required")
        
        # Build context for the AI response
        context_parts = []
        context_parts.append(f"Client: {client_data.get('firstName', 'Unknown')} {client_data.get('lastName', 'Unknown')}")
        context_parts.append(f"Resource Type: {resource_type}")
        
        if current_recommendations:
            context_parts.append("Current Recommendations:")
            for i, rec in enumerate(current_recommendations[:3], 1):  # Limit to top 3
                context_parts.append(f"{i}. {rec.get('organization', 'Unknown')} - {rec.get('resource_name', 'Unknown')}")
        
        # Add recent chat history for context
        if chat_history:
            context_parts.append("Recent conversation:")
            for msg in chat_history[-4:]:  # Last 4 messages
                if msg.get('type') == 'user':
                    context_parts.append(f"Social Worker: {msg.get('content', '')}")
                elif msg.get('type') == 'ai':
                    context_parts.append(f"AI: {msg.get('content', '')}")
        
        context = "\n".join(context_parts)
        
        # Use the LLM to generate a response
        from langchain_core.prompts import PromptTemplate
        
        prompt = PromptTemplate.from_template(
            "You are a helpful AI assistant for social workers. You have access to information about "
            "housing and food resources, and you're helping a social worker with follow-up questions "
            "about resource recommendations.\n\n"
            "Context:\n{context}\n\n"
            "Social Worker's Question: {question}\n\n"
            "Provide a helpful, specific response based on the context. If you need more information "
            "that isn't available in the context, say so clearly. Keep your response concise but informative."
        )
        
        chain = prompt | rag_matcher.llm
        response = chain.invoke({"context": context, "question": message})
        
        ai_response = response.content if hasattr(response, 'content') else str(response)
        
        return {
            "response": ai_response,
            "message": "Response generated successfully"
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error in chat followup: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/api/clients/{client_id}/add-resource')
async def add_resource_to_client(client_id: int, resource_data: Dict[str, Any]):
    """Add a resource to a client's portfolio."""
    try:
        # Load existing clients
        clients_data = load_clients()
        
        # Find the client
        client = None
        for c in clients_data['clients']:
            if c['id'] == client_id:
                client = c
                break
        
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        
        # Initialize resources array if it doesn't exist
        if 'resources' not in client:
            client['resources'] = []
        
        # Create resource entry with status tracking
        resource_entry = {
            'resource_id': resource_data.get('id'),
            'resource_name': resource_data.get('resource_name'),
            'organization': resource_data.get('organization'),
            'program_type': resource_data.get('program_type'),
            'contact': resource_data.get('contact'),
            'services': resource_data.get('services'),
            'category': resource_data.get('category', 'housing'),
            'status': 'pending',  # Default status
            'added_date': datetime.now().isoformat(),
            'last_updated': datetime.now().isoformat(),
            'notes': resource_data.get('notes', ''),
            'ai_reasoning': resource_data.get('ai_reasoning', '')
        }
        
        # Check if resource already exists for this client
        existing_resource = None
        for r in client['resources']:
            if r['resource_id'] == resource_entry['resource_id']:
                existing_resource = r
                break
        
        if existing_resource:
            return {
                "message": "Resource already exists for this client",
                "resource": existing_resource
            }
        
        # Add the resource to client's portfolio
        client['resources'].append(resource_entry)
        client['lastUpdated'] = datetime.now().isoformat()
        
        # Save the updated clients data
        if save_clients(clients_data):
            return {
                "message": "Resource added to client successfully",
                "resource": resource_entry
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to save client data")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error adding resource to client: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put('/api/clients/{client_id}/resources/{resource_id}/status')
async def update_resource_status(client_id: int, resource_id: str, status_data: Dict[str, Any]):
    """Update the status of a resource for a client."""
    try:
        # Load existing clients
        clients_data = load_clients()
        
        # Find the client
        client = None
        for c in clients_data['clients']:
            if c['id'] == client_id:
                client = c
                break
        
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        
        if 'resources' not in client:
            raise HTTPException(status_code=404, detail="Client has no resources")
        
        # Find the resource
        resource = None
        for r in client['resources']:
            if r['resource_id'] == resource_id:
                resource = r
                break
        
        if not resource:
            raise HTTPException(status_code=404, detail="Resource not found for this client")
        
        # Update the resource status
        new_status = status_data.get('status')
        valid_statuses = ['pending', 'contacted', 'in_progress', 'completed', 'declined', 'not_eligible']
        
        if new_status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
        
        resource['status'] = new_status
        resource['last_updated'] = datetime.now().isoformat()
        
        # Add notes if provided
        if status_data.get('notes'):
            resource['notes'] = status_data.get('notes')
        
        client['lastUpdated'] = datetime.now().isoformat()
        
        # Save the updated clients data
        if save_clients(clients_data):
            return {
                "message": "Resource status updated successfully",
                "resource": resource
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to save client data")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error updating resource status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/api/clients/{client_id}/resources')
async def get_client_resources(client_id: int):
    """Get all resources for a specific client."""
    try:
        # Load existing clients
        clients_data = load_clients()
        
        # Find the client
        client = None
        for c in clients_data['clients']:
            if c['id'] == client_id:
                client = c
                break
        
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        
        resources = client.get('resources', [])
        
        return {
            "client_id": client_id,
            "client_name": f"{client.get('firstName', '')} {client.get('lastName', '')}",
            "resources": resources
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error getting client resources: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/api/dashboard/resource-status')
async def get_dashboard_resource_status():
    """Get recent resource status updates for dashboard."""
    try:
        # Load existing clients
        clients_data = load_clients()
        
        # Collect all client resources with their statuses
        client_resources = []
        for client in clients_data['clients']:
            if 'resources' in client and client['resources']:
                for resource in client['resources']:
                    client_resources.append({
                        'client_id': client['id'],
                        'client_name': f"{client.get('firstName', '')} {client.get('lastName', '')}",
                        'resource_name': resource.get('resource_name', ''),
                        'organization': resource.get('organization', ''),
                        'status': resource.get('status', 'pending'),
                        'added_date': resource.get('added_date', ''),
                        'last_updated': resource.get('last_updated', ''),
                        'category': resource.get('category', 'housing')
                    })
        
        # Sort by last_updated (most recent first)
        client_resources.sort(key=lambda x: x.get('last_updated', ''), reverse=True)
        
        # Return the most recent 10 for dashboard
        return {
            "recent_resources": client_resources[:10],
            "total_count": len(client_resources)
        }
        
    except Exception as e:
        logger.error(f"Error getting dashboard resource status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/api/chat/help')
async def help_chatbot(request_data: Dict[str, Any]):
    """Help chatbot endpoint for platform assistance."""
    try:
        message = request_data.get('message', '')
        context = request_data.get('context', 'help_chatbot')
        
        if not message:
            raise HTTPException(status_code=400, detail="Message is required")
        
        # Create a comprehensive system prompt for the help chatbot
        system_prompt = """You are the NextStep Assistant, a helpful chatbot for the NextStep platform - a resource management system for social workers and case managers. Your role is to help users understand and navigate the platform effectively.

PLATFORM FEATURES:
1. Resource Matcher - AI-powered tool that matches clients with appropriate resources based on their needs
2. Resource Center - Browse resources by category (Housing, Food, Transportation)
3. Client Management - Add, view, and manage client profiles
4. Dashboard - Overview of activities and quick actions

AVAILABLE RESOURCE CATEGORIES:
- Housing Resources: Emergency shelters, transitional housing, permanent supportive housing
- Food Resources: Food pantries, meal programs, nutrition assistance, SNAP benefits
- Transportation Services: Free rides, public transit, medical transportation, ADA services

HOW TO USE THE PLATFORM:
1. Add clients with their basic information and needs
2. Use Resource Matcher to find appropriate resources for specific clients
3. Browse resources by category in the Resource Center
4. Track client progress and resource assignments

COMMON TASKS:
- Adding a new client: Go to "Add Client" and fill in the form
- Finding resources: Use "Resource Matcher" for AI recommendations or "Resource Center" to browse
- Viewing client details: Go to "All Clients" to see client profiles and assigned resources

Answer questions clearly and concisely. If you don't know something specific about the platform, acknowledge it and suggest alternative ways to get help. Be friendly and professional."""

        # Use the existing LLM from the RAG matcher
        from langchain_openai import ChatOpenAI
        from langchain_core.messages import HumanMessage, SystemMessage
        
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=message)
        ]
        
        response = llm.invoke(messages)
        
        return {
            "response": response.content,
            "context": context
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error in help chatbot: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/api/voice-assistant')
async def voice_assistant(request_data: Dict[str, Any]):
    """Advanced voice assistant endpoint with comprehensive platform knowledge."""
    try:
        message = request_data.get('message', '')
        context = request_data.get('context', 'voice_assistant')
        conversation_history = request_data.get('conversation_history', [])
        
        if not message:
            raise HTTPException(status_code=400, detail="Message is required")
        
        # Load current resources for context
        resources_data = load_resources()
        total_resources = len(resources_data.get('resources', []))
        
        # Load clients for context
        clients_data = load_clients()
        total_clients = len(clients_data.get('clients', []))
        
        # Enhanced system prompt with current platform data
        system_prompt = f"""You are Sarah, the NextStep AI assistant. You're a helpful, friendly female voice assistant for social workers. You have complete knowledge of the NextStep platform and can help with everything.

PLATFORM STATUS: {total_resources} resources, {total_clients} clients

WHAT YOU CAN DO:
• Find any resource (housing, food, transportation, healthcare, etc.)
• Add/manage clients and their information
• Fill out forms and applications
• Provide translations
• Navigate the platform
• Handle emergencies
• Match clients to resources
• Send referrals
• Track client progress

RESPONSE STYLE:
- Keep responses to 2-3 sentences MAX
- Be direct and helpful
- Sound natural and conversational
- Let the social worker guide the conversation
- Ask ONE clarifying question if needed
- Give specific next steps

PLATFORM FEATURES YOU KNOW:
• Dashboard - overview and quick actions
• Resource Matcher - AI matching tool
• Resource Center - browse by category
• Client Management - add/view/edit clients
• All 118 resources in the system
• Referral system
• Case tracking
• Form assistance

Always be concise, helpful, and sound like a real person having a conversation."""

        # Use the existing LLM from the RAG matcher
        from langchain_openai import ChatOpenAI
        from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
        
        llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.8)
        
        # Build conversation context
        messages = [SystemMessage(content=system_prompt)]
        
        # Add recent conversation history
        for msg in conversation_history[-5:]:  # Last 5 messages for context
            if msg.get('type') == 'user':
                messages.append(HumanMessage(content=msg.get('text', '')))
            elif msg.get('type') == 'assistant':
                messages.append(AIMessage(content=msg.get('text', '')))
        
        # Add current message
        messages.append(HumanMessage(content=message))
        
        # Create the chat completion
        response = llm.invoke(messages)
        
        return {
            "response": response.content,
            "context": context
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error in voice assistant: {e}")
        raise HTTPException(status_code=500, detail="I'm having trouble processing your request right now. Please try again or contact support if the issue persists.")

@app.post('/api/translate')
async def translate_text(request_data: Dict[str, Any]):
    """Translate text to the specified language."""
    try:
        text = request_data.get('text', '')
        target_language = request_data.get('target_language', 'Spanish')
        
        if not text:
            raise HTTPException(status_code=400, detail="Text is required")
        
        # Use OpenAI for translation
        from openai import OpenAI
        client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system", 
                    "content": f"You are a professional translator. Translate the following text to {target_language}. Maintain the original meaning and tone. Only return the translated text, nothing else."
                },
                {"role": "user", "content": text}
            ],
            temperature=0.3
        )
        
        translated_text = response.choices[0].message.content.strip()
        
        return {
            "original": text,
            "translated": translated_text,
            "target_language": target_language,
            "success": True
        }
        
    except Exception as e:
        logger.error(f"Error in translation: {e}")
        raise HTTPException(status_code=500, detail="Failed to translate text")

@app.post('/api/text-to-speech')
async def text_to_speech(request_data: Dict[str, Any]):
    """Convert text to speech using OpenAI's advanced TTS API."""
    try:
        from openai import OpenAI
        import base64
        import io
        
        # Initialize OpenAI client
        client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        
        text = request_data.get('text', '')
        voice = request_data.get('voice', 'nova')  # nova is a great female voice
        
        if not text:
            raise HTTPException(status_code=400, detail="Text is required")
        
        # Generate speech using OpenAI TTS
        response = client.audio.speech.create(
            model="tts-1",  # Use tts-1 for faster response, tts-1-hd for higher quality
            voice=voice,    # Options: alloy, echo, fable, onyx, nova, shimmer
            input=text,
            response_format="mp3"
        )
        
        # Convert to base64 for frontend
        audio_data = response.content
        audio_base64 = base64.b64encode(audio_data).decode('utf-8')
        
        return {
            "audio_data": audio_base64,
            "format": "mp3"
        }
        
    except Exception as e:
        logger.error(f"Error in text-to-speech: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate speech")

@app.get('/api/get')
async def get_livekit_token(name: str):
    """Generate a LiveKit token for the given user name."""
    try:
        from livekit import api
        import os
        
        # LiveKit configuration - same as agent.py
        livekit_url = os.environ.get("LIVEKIT_URL", "wss://launch-65q9o9la.livekit.cloud")
        livekit_api_key = os.environ.get("LIVEKIT_API_KEY", "APIBAfXa36Hgo2j")
        livekit_api_secret = os.environ.get("LIVEKIT_API_SECRET", "hLSaGpDgyKProcV263Ddvl3ceWemIXa0qKI91sAiAgL")
        
        # Generate a unique room name for this session
        import uuid
        room_name = f"support-room-{uuid.uuid4().hex[:8]}"
        
        # Create access token
        token = (
            api.AccessToken(livekit_api_key, livekit_api_secret)
            .with_identity(name)
            .with_name(name)
            .with_grants(
                api.VideoGrants(
                    room_join=True,
                    room=room_name,
                    can_publish=True,
                    can_subscribe=True,
                )
            )
        ).to_jwt()
        
        return {
            "token": token,
            "room": room_name,
            "url": livekit_url
        }
        
    except Exception as e:
        logger.error(f"Error generating LiveKit token: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/health')
async def health_check():
    """Health check endpoint for deployment platforms."""
    try:
        # Basic health check
        health_status = {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "rag_matcher_initialized": rag_matcher is not None
        }
        
        # If RAG matcher is not initialized, still return healthy but with warning
        if rag_matcher is None:
            health_status["status"] = "starting"
            health_status["warning"] = "RAG matcher still initializing"
            
        return health_status
        
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5001))
    print(f"Starting server on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)