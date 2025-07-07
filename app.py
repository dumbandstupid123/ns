from flask import Flask, render_template, request, jsonify, session
import os
import uuid
from dotenv import load_dotenv
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.secret_key = 'housing_assistant_secret_key_2024'

CHROMA_PATH = "chroma"

# Store conversation sessions
conversation_sessions = {}

# Client storage - add some sample clients
clients = [
    {
        "id": 1,
        "name": "Test Client",
        "firstName": "Test",
        "lastName": "Client",
        "contact": "test@email.com",
        "housing_need": "Emergency shelter",
        "notes": "Test client for development",
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00"
    },
    {
        "id": 2,
        "name": "Maria Rodriguez",
        "firstName": "Maria",
        "lastName": "Rodriguez",
        "contact": "maria@email.com",
        "housing_need": "Family housing",
        "notes": "Single mother with 2 children, urgent eviction case",
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00"
    },
    {
        "id": 3,
        "name": "Robert Johnson",
        "firstName": "Robert",
        "lastName": "Johnson",
        "contact": "robert@email.com",
        "housing_need": "Veterans housing",
        "notes": "Homeless veteran with PTSD, emergency assistance needed",
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00"
    },
    {
        "id": 4,
        "name": "Sarah Williams",
        "firstName": "Sarah",
        "lastName": "Williams",
        "contact": "sarah@email.com",
        "housing_need": "Safe housing",
        "notes": "22-year-old with infant, fleeing domestic violence, currently doubling-up",
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00"
    },
    {
        "id": 5,
        "name": "James Thompson",
        "firstName": "James",
        "lastName": "Thompson",
        "contact": "james@email.com",
        "housing_need": "Senior housing",
        "notes": "Senior citizen, at-risk due to medical bills",
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00"
    }
]

SYSTEM_PROMPT = """
You are Maria, an expert Housing Counselor with 15 years of experience helping people find housing in Houston. You are compassionate, knowledgeable, and always ask the right questions to understand someone's unique situation.

YOUR MISSION: Help each person find the BEST housing resource for their specific needs, not just list options.

YOUR APPROACH:
1. LISTEN & UNDERSTAND: Ask clarifying questions to understand their situation
2. ANALYZE: Consider their demographics, needs, urgency, and circumstances  
3. RECOMMEND: Suggest the 1-2 BEST options that match their situation
4. GUIDE: Provide clear next steps and prepare them for the process

KEY QUESTIONS TO ASK (when relevant):
- Are you a veteran?
- Do you have children/family with you?
- Are you pregnant or a new mother?
- Do you have any immediate medical needs?
- Are you fleeing domestic violence?
- Do you have any income or ability to pay fees?
- Do you have valid ID?
- Have you been turned away from other places?
- How urgent is your housing need (tonight, this week, etc.)?
- Any substance abuse history or mental health needs?

AVAILABLE HOUSING RESOURCES:
{context}

CONVERSATION HISTORY:
{chat_history}

CURRENT MESSAGE: {question}

RESPOND AS MARIA:
- If this is their first message, introduce yourself warmly and ask 2-3 key questions
- If they've shared info, ask follow-up questions to understand their situation better
- Once you understand their needs, recommend the 1-2 BEST resources (not all of them)
- Always be encouraging and provide clear next steps
- If they ask about something not in your database, acknowledge and suggest alternatives
"""

def get_session_id():
    """Get or create session ID"""
    if 'session_id' not in session:
        session['session_id'] = str(uuid.uuid4())
    return session['session_id']

def get_conversation_history(session_id):
    """Get conversation history for session"""
    if session_id not in conversation_sessions:
        conversation_sessions[session_id] = []
    return conversation_sessions[session_id]

def add_to_conversation(session_id, user_message, ai_response):
    """Add messages to conversation history"""
    if session_id not in conversation_sessions:
        conversation_sessions[session_id] = []
    
    conversation_sessions[session_id].append(f"User: {user_message}")
    conversation_sessions[session_id].append(f"Maria: {ai_response}")
    
    # Keep only last 10 messages to prevent context overflow
    if len(conversation_sessions[session_id]) > 10:
        conversation_sessions[session_id] = conversation_sessions[session_id][-10:]

def smart_housing_counselor(query_text, session_id):
    """Intelligent housing counselor that understands context and provides personalized help"""
    try:
        # Get conversation history
        chat_history = get_conversation_history(session_id)
        chat_history_text = "\n".join(chat_history) if chat_history else "This is the start of the conversation."
        
        # Prepare the housing database
        embedding_function = OpenAIEmbeddings()
        db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embedding_function)

        # Smart context retrieval - get broader context for better recommendations
        search_terms = [query_text]
        
        # Add context-aware search terms based on conversation history
        context_keywords = []
        full_conversation = " ".join(chat_history) + " " + query_text
        
        if "veteran" in full_conversation.lower():
            context_keywords.append("veterans")
        if any(word in full_conversation.lower() for word in ["woman", "female", "mother", "pregnant"]):
            context_keywords.append("women")
        if any(word in full_conversation.lower() for word in ["family", "children", "kids", "baby"]):
            context_keywords.append("family")
        if any(word in full_conversation.lower() for word in ["emergency", "urgent", "tonight", "immediate"]):
            context_keywords.append("emergency")
        if any(word in full_conversation.lower() for word in ["abuse", "domestic", "violence"]):
            context_keywords.append("abuse")
        
        # Search with multiple terms for comprehensive context
        all_results = []
        for term in search_terms + context_keywords:
            results = db.similarity_search_with_relevance_scores(term, k=4)
            all_results.extend(results)
        
        # Also get general housing information
        general_results = db.similarity_search_with_relevance_scores("housing shelter resources", k=6)
        all_results.extend(general_results)
        
        # Remove duplicates and sort by relevance
        seen_content = set()
        unique_results = []
        for doc, score in all_results:
            content_key = doc.page_content[:100]  # Use first 100 chars as key
            if content_key not in seen_content:
                seen_content.add(content_key)
                unique_results.append((doc, score))
        
        # Sort by relevance and take top results
        unique_results.sort(key=lambda x: x[1], reverse=True)
        best_results = unique_results[:8]  # Get comprehensive context
        
        # Prepare context - include ALL available housing resources for smart recommendations
        context_text = "\n\n---\n\n".join([doc.page_content for doc, _score in best_results])
        
        # Create the intelligent prompt
        prompt_template = ChatPromptTemplate.from_template(SYSTEM_PROMPT)
        prompt = prompt_template.format(
            context=context_text,
            chat_history=chat_history_text,
            question=query_text
        )

        # Generate intelligent response
        model = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)  # Use GPT-4 for better reasoning
        response_text = model.invoke(prompt)

        # Extract sources
        sources = list(set([doc.metadata.get("source", "Unknown") for doc, _score in best_results]))
        
        # Add to conversation history
        add_to_conversation(session_id, query_text, response_text.content)
        
        return {
            "response": response_text.content,
            "sources": sources,
            "context": context_text
        }
    
    except Exception as e:
        return {
            "response": f"I'm sorry, I'm having a technical issue right now. But don't worry - I'm here to help you find housing! Can you tell me a bit about your situation? Are you looking for emergency shelter, or longer-term housing? Are you a veteran, or do you have family with you?",
            "sources": []
        }

@app.route('/')
def index():
    """Serve the main dashboard interface"""
    return render_template('demo_app.html')

@app.route('/chat')
def chat():
    """Serve the chat interface"""
    return render_template('chat.html')

@app.route('/all-resources')
def all_resources():
    """Serve the all resources page"""
    return render_template('all-resources.html')

@app.route('/resource-finder')
def resource_finder():
    """Serve the resource finder interface"""
    return render_template('resource-finder.html')

@app.route('/api/clients', methods=['GET'])
def get_clients():
    """Get all clients"""
    return jsonify({
        "clients": clients,
        "count": len(clients),
        "status": "success"
    })

@app.route('/api/clients', methods=['POST'])
def add_client():
    """Add a new client"""
    try:
        data = request.get_json()
        
        # Create new client
        client = {
            "id": len(clients) + 1,
            "name": data.get('name', ''),
            "firstName": data.get('firstName', data.get('name', '').split(' ')[0] if data.get('name', '') else ''),
            "lastName": data.get('lastName', ' '.join(data.get('name', '').split(' ')[1:]) if data.get('name', '') else ''),
            "contact": data.get('contact', ''),
            "housing_need": data.get('housing_need', ''),
            "notes": data.get('notes', ''),
            "created_at": "2024-01-01T00:00:00",
            "updated_at": "2024-01-01T00:00:00"
        }
        
        # Validate required fields
        if not client['name'] or not client['housing_need']:
            return jsonify({
                "error": "Name and housing need are required",
                "status": "error"
            }), 400
        
        clients.append(client)
        
        return jsonify({
            "client": client,
            "message": f"Client {client['name']} added successfully",
            "status": "success"
        })
        
    except Exception as e:
        return jsonify({
            "error": f"Error adding client: {str(e)}",
            "status": "error"
        }), 500

@app.route('/api/query', methods=['POST'])
def api_query():
    """API endpoint for intelligent housing counselor"""
    data = request.get_json()
    query = data.get('query', '').strip()
    
    if not query:
        return jsonify({
            "response": "Hi! I'm Maria, your housing counselor. I'm here to help you find the best housing resources for your specific situation. To get started, could you tell me a bit about what kind of housing assistance you're looking for?",
            "sources": []
        })
    
    # Get session ID for conversation tracking
    session_id = get_session_id()
    
    # Use intelligent housing counselor
    result = smart_housing_counselor(query, session_id)
    return jsonify(result)

@app.route('/api/reset', methods=['POST'])
def reset_conversation():
    """Reset the conversation for a fresh start"""
    session_id = get_session_id()
    if session_id in conversation_sessions:
        del conversation_sessions[session_id]
    
    # Create new session
    session['session_id'] = str(uuid.uuid4())
    
    return jsonify({
        "response": "Great! I'm Maria, your housing counselor. I'm here to help you find the perfect housing solution for your situation. Let's start fresh - what brings you here today? Are you looking for emergency shelter, transitional housing, or longer-term housing assistance?",
        "sources": []
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "Housing RAG API is running"})

if __name__ == '__main__':
    # Ensure OpenAI API key is set
    if not os.getenv('OPENAI_API_KEY'):
        print("Warning: OPENAI_API_KEY environment variable not set")
    
    print("🏠 Housing Resources Chat App Starting...")
    print("📱 Access the app at: http://localhost:8080")
    print("🔧 API Health Check: http://localhost:8080/api/health")
    print("💬 Start chatting about housing resources!")
    
    app.run(debug=True, host='0.0.0.0', port=8080) 