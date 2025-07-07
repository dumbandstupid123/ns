from flask import Flask, request, jsonify, render_template_string, render_template
from flask_cors import CORS
import os
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_chroma import Chroma
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate
import uuid
from datetime import datetime, timedelta

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
CHROMA_PATH = "chroma"
PORT = int(os.environ.get('PORT', 8081))

# Email Configuration (you'll need to set these)
GMAIL_USER = os.environ.get('GMAIL_USER', '')  # Your Gmail address
GMAIL_PASSWORD = os.environ.get('GMAIL_APP_PASSWORD', '')  # Your Gmail App Password

# Session storage (in production, use Redis or database)
sessions = {}
SESSION_TIMEOUT = timedelta(hours=2)

# Client storage (in production, use database)
clients = [
    {
        "id": 1,
        "name": "John Smith",
        "contact": "john.smith@email.com",
        "housing_need": "Emergency shelter",
        "notes": "Veteran seeking immediate housing assistance",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    },
    {
        "id": 2,
        "name": "Maria Garcia",
        "contact": "maria.g@email.com",
        "housing_need": "Family housing",
        "notes": "Single mother with 2 children, needs 2-bedroom apartment",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    },
    {
        "id": 3,
        "name": "Robert Wilson",
        "contact": "rwilson@email.com",
        "housing_need": "Senior housing",
        "notes": "Senior citizen looking for affordable housing near medical facilities",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
]

def send_referral_email(to_email, subject, body, from_name="Housing Counselor"):
    """Send referral email via Gmail SMTP"""
    try:
        if not GMAIL_USER or not GMAIL_PASSWORD:
            return {"success": False, "error": "Email not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD environment variables."}
        
        # Create message
        msg = MIMEMultipart()
        msg['From'] = f"{from_name} <{GMAIL_USER}>"
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Add body
        msg.attach(MIMEText(body, 'plain'))
        
        # Gmail SMTP configuration
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()  # Enable encryption
        server.login(GMAIL_USER, GMAIL_PASSWORD)
        
        # Send email
        text = msg.as_string()
        server.sendmail(GMAIL_USER, to_email, text)
        server.quit()
        
        return {"success": True, "message": f"Email sent successfully to {to_email}"}
        
    except Exception as e:
        return {"success": False, "error": f"Failed to send email: {str(e)}"}

def clean_expired_sessions():
    """Remove expired sessions"""
    current_time = datetime.now()
    expired_sessions = [
        session_id for session_id, data in sessions.items()
        if current_time - data['last_activity'] > SESSION_TIMEOUT
    ]
    for session_id in expired_sessions:
        del sessions[session_id]

def get_or_create_session(session_id=None):
    """Get existing session or create new one"""
    clean_expired_sessions()
    
    if not session_id or session_id not in sessions:
        session_id = str(uuid.uuid4())
        sessions[session_id] = {
            'messages': [],  # Store conversation history as list of messages
            'last_activity': datetime.now(),
            'created_at': datetime.now()
        }
    else:
        sessions[session_id]['last_activity'] = datetime.now()
    
    return session_id, sessions[session_id]

def extract_context_keywords(query_text, conversation_history):
    """Enhanced context keyword extraction with broader coverage"""
    keywords = set()
    
    # Extract from current query
    query_lower = query_text.lower()
    
    # Veteran/Military patterns
    veteran_terms = ['veteran', 'military', 'va ', 'army', 'navy', 'marine', 'air force', 'coast guard', 'service member', 'deployed', 'ptsd', 'disability', 'gi bill']
    if any(term in query_lower for term in veteran_terms):
        keywords.add('veteran')
    
    # Women/Gender patterns
    women_terms = ['woman', 'women', 'female', 'pregnant', 'mother', 'mom', 'maternal', 'expecting', 'prenatal', 'postpartum']
    if any(term in query_lower for term in women_terms):
        keywords.add('women')
    
    # Family patterns
    family_terms = ['family', 'children', 'kid', 'child', 'baby', 'infant', 'toddler', 'teen', 'teenager', 'son', 'daughter', 'parent', 'single parent']
    if any(term in query_lower for term in family_terms):
        keywords.add('family')
    
    # Emergency patterns
    emergency_terms = ['emergency', 'tonight', 'urgent', 'immediate', 'now', 'asap', 'today', 'crisis', 'homeless', 'evicted', 'kicked out', 'nowhere to go']
    if any(term in query_lower for term in emergency_terms):
        keywords.add('emergency')
    
    # Domestic violence patterns
    dv_terms = ['abuse', 'domestic violence', 'safety', 'flee', 'escape', 'dangerous', 'violent', 'threats', 'restraining order', 'safe house']
    if any(term in query_lower for term in dv_terms):
        keywords.add('abuse')
    
    # Senior patterns
    senior_terms = ['senior', 'elderly', 'older adult', 'retirement', 'medicare', 'social security', '55+', '62+', '65+', 'fixed income']
    if any(term in query_lower for term in senior_terms):
        keywords.add('senior')
    
    # Youth patterns
    youth_terms = ['young', 'youth', '18-24', 'college', 'student', 'aging out', 'foster care', 'transition age']
    if any(term in query_lower for term in youth_terms):
        keywords.add('youth')
    
    # Disability patterns
    disability_terms = ['disabled', 'disability', 'wheelchair', 'accessible', 'ada', 'mental health', 'psychiatric', 'chronic illness']
    if any(term in query_lower for term in disability_terms):
        keywords.add('disabled')
    
    # Substance abuse patterns
    substance_terms = ['addiction', 'substance', 'alcohol', 'drugs', 'recovery', 'rehab', 'treatment', 'sober', 'clean']
    if any(term in query_lower for term in substance_terms):
        keywords.add('substance-abuse')
    
    # Housing situation patterns
    housing_terms = ['homeless', 'shelter', 'couch surfing', 'doubling up', 'eviction', 'foreclosure', 'unsafe housing', 'overcrowded']
    if any(term in query_lower for term in housing_terms):
        keywords.add('housing-crisis')
    
    # Financial patterns
    financial_terms = ['poor', 'broke', 'no money', 'unemployed', 'benefits', 'snap', 'food stamps', 'medicaid', 'low income']
    if any(term in query_lower for term in financial_terms):
        keywords.add('low-income')
    
    # Extract from conversation history with same patterns
    for message in conversation_history[-8:]:  # Increased to 8 messages for better context
        if isinstance(message, dict) and 'content' in message:
            content = message['content'].lower()
        elif hasattr(message, 'content'):
            content = message.content.lower()
        else:
            continue
        
        # Apply same pattern matching to conversation history
        if any(term in content for term in veteran_terms):
            keywords.add('veteran')
        if any(term in content for term in women_terms):
            keywords.add('women')
        if any(term in content for term in family_terms):
            keywords.add('family')
        if any(term in content for term in emergency_terms):
            keywords.add('emergency')
        if any(term in content for term in dv_terms):
            keywords.add('abuse')
        if any(term in content for term in senior_terms):
            keywords.add('senior')
        if any(term in content for term in youth_terms):
            keywords.add('youth')
        if any(term in content for term in disability_terms):
            keywords.add('disabled')
        if any(term in content for term in substance_terms):
            keywords.add('substance-abuse')
        if any(term in content for term in housing_terms):
            keywords.add('housing-crisis')
        if any(term in content for term in financial_terms):
            keywords.add('low-income')
    
    return keywords

def create_context_aware_query(original_query, keywords):
    """Create an enhanced context-aware query with weighted terms"""
    if not keywords:
        return original_query
    
    # Enhanced context terms with more comprehensive coverage
    context_terms = []
    
    if 'veteran' in keywords:
        context_terms.extend(['veteran', 'military', 'VA', 'VASH', 'veterans affairs', 'service member', 'army', 'navy'])
    if 'women' in keywords:
        context_terms.extend(['women', 'female', 'pregnant', 'maternal', 'mothers', 'prenatal', 'gender-specific'])
    if 'family' in keywords:
        context_terms.extend(['family', 'children', 'kids', 'parent', 'household', 'dependents', 'childcare'])
    if 'emergency' in keywords:
        context_terms.extend(['emergency', 'immediate', 'urgent', 'crisis', 'tonight', 'shelter', 'homeless'])
    if 'abuse' in keywords:
        context_terms.extend(['domestic violence', 'abuse', 'safety', 'confidential', 'secure', 'protection'])
    if 'senior' in keywords:
        context_terms.extend(['senior', 'elderly', 'older adult', 'age-restricted', '55+', 'medicare', 'retirement'])
    if 'youth' in keywords:
        context_terms.extend(['youth', 'young adult', '18-24', 'transitional', 'student', 'college'])
    if 'disabled' in keywords:
        context_terms.extend(['disability', 'accessible', 'ADA', 'accommodation', 'mental health', 'physical'])
    if 'substance-abuse' in keywords:
        context_terms.extend(['substance abuse', 'addiction', 'recovery', 'treatment', 'rehabilitation', 'sober'])
    if 'housing-crisis' in keywords:
        context_terms.extend(['homeless', 'eviction', 'foreclosure', 'housing crisis', 'temporary', 'transitional'])
    if 'low-income' in keywords:
        context_terms.extend(['low income', 'financial assistance', 'affordable', 'subsidized', 'voucher', 'benefits'])
    
    # Create weighted query with original query having highest priority
    enhanced_query = f"{original_query} housing assistance {' '.join(context_terms[:12])}"  # Limit to 12 terms to avoid overwhelming
    return enhanced_query

def get_housing_response(query_text, session_id=None):
    """Get response from housing counselor system"""
    try:
        # Initialize embeddings and vector store
        embeddings = OpenAIEmbeddings(openai_api_key=OPENAI_API_KEY)
        db = Chroma(persist_directory=CHROMA_PATH, embedding_function=embeddings)
        
        # Get or create session
        session_id, session_data = get_or_create_session(session_id)
        conversation_history = session_data['messages']
        
        # Extract context keywords
        keywords = extract_context_keywords(query_text, conversation_history)
        
        # Create context-aware query for retrieval
        enhanced_query = create_context_aware_query(query_text, keywords)
        
        # Multi-strategy search for better accuracy
        all_relevant_docs = []
        
        # Strategy 1: Enhanced query search
        enhanced_docs = db.similarity_search_with_relevance_scores(enhanced_query, k=6)
        for doc, score in enhanced_docs:
            if score > 0.25:  # Slightly higher threshold for enhanced query
                all_relevant_docs.append((doc, score, 'enhanced'))
        
        # Strategy 2: Original query search (for comparison)
        original_docs = db.similarity_search_with_relevance_scores(query_text, k=4)
        for doc, score in original_docs:
            if score > 0.3:  # Higher threshold for original query
                # Check if doc already exists in results
                if not any(existing_doc.page_content == doc.page_content for existing_doc, _, _ in all_relevant_docs):
                    all_relevant_docs.append((doc, score, 'original'))
        
        # Strategy 3: Keyword-based search if we have strong keywords
        if keywords:
            keyword_query = ' '.join(keywords) + ' housing'
            keyword_docs = db.similarity_search_with_relevance_scores(keyword_query, k=4)
            for doc, score in keyword_docs:
                if score > 0.2:  # Lower threshold for keyword search
                    if not any(existing_doc.page_content == doc.page_content for existing_doc, _, _ in all_relevant_docs):
                        all_relevant_docs.append((doc, score, 'keyword'))
        
        # Sort by relevance score (highest first)
        all_relevant_docs.sort(key=lambda x: x[1], reverse=True)
        
        # Take top 4 most relevant documents
        top_docs = all_relevant_docs[:4]
        
        if not top_docs:
            # Fallback: very broad search
            fallback_docs = db.similarity_search_with_relevance_scores("housing assistance help", k=3)
            top_docs = [(doc, score, 'fallback') for doc, score in fallback_docs if score > 0.1]
        
        # Create enriched context with metadata
        context_parts = []
        for i, (doc, score, strategy) in enumerate(top_docs):
            context_parts.append(f"Resource {i+1} (relevance: {score:.2f}):\n{doc.page_content}")
        
        context = "\n\n".join(context_parts)
        
        # Initialize the language model
        llm = ChatOpenAI(
            model_name="gpt-3.5-turbo",
            temperature=0.8,
            openai_api_key=OPENAI_API_KEY,
            streaming=False
        )
        
        # Build conversation history for context
        conversation_context = ""
        if conversation_history:
            recent_messages = conversation_history[-4:]  # Last 4 messages for context
            for msg in recent_messages:
                if msg['role'] == 'user':
                    conversation_context += f"User: {msg['content']}\n"
                else:
                    conversation_context += f"Maria: {msg['content']}\n"
        
        # Enhanced system prompt for housing counselor with better accuracy guidance
        system_prompt = f"""You are Maria, a warm and caring Housing Counselor with 15 years of experience helping people find housing in Houston. You have a natural talent for making people feel heard and understood, while also being highly knowledgeable about housing resources.

YOUR PERSONALITY:
- Warm and approachable - you make people feel comfortable sharing their situation
- Patient and understanding - you know housing challenges can be stressful
- Professional but conversational - you use clear language, not technical jargon
- Proactive in asking questions - you gather important details naturally
- Focused on practical next steps - you always provide clear actions people can take

HOW YOU HELP:
1. Start by acknowledging their situation with genuine empathy
2. Ask gentle follow-up questions if you need more information
3. Share specific housing resources that match their needs
4. Explain things clearly and check if they understand
5. Offer to help with next steps or additional questions

WHEN HELPING SOMEONE:
1. Listen carefully to their immediate needs
2. Consider their specific situation: {', '.join(keywords) if keywords else 'needs more information'}
3. Match them with resources that:
   - Specifically serve their demographic (veteran, family, senior, etc.)
   - Meet their immediate housing needs
   - Have clear eligibility requirements they meet
4. Always include:
   - Resource name and description
   - Contact information
   - Basic eligibility requirements
   - Next steps they can take

CONVERSATION STYLE:
- Use warm, encouraging language
- Break information into digestible pieces
- Ask questions naturally, like you're having a conversation
- Show you understand their situation
- Be honest if you need more information

AVAILABLE RESOURCES TO RECOMMEND:
{context}

CONVERSATION HISTORY:
{conversation_context}

Remember: You're here to be a supportive guide through their housing journey. Focus on understanding their situation first, then provide clear, actionable help. If you're not sure about something, it's okay to say so and suggest they verify details directly. If no perfect matches exist, acknowledge that and suggest contacting 211 or the Houston Housing Authority for more options."""

        # Create the prompt template
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{query}")
        ])
        
        # Create the chain
        chain = prompt | llm
        
        # Get response
        result = chain.invoke({"query": query_text})
        response_text = result.content
        
        # Add messages to conversation history
        conversation_history.append({"role": "user", "content": query_text})
        conversation_history.append({"role": "assistant", "content": response_text})
        
        # Keep only last 20 messages to prevent memory overflow
        if len(conversation_history) > 20:
            conversation_history = conversation_history[-20:]
        
        return {
            "response": response_text,
            "session_id": session_id,
            "status": "success"
        }
        
    except Exception as e:
        print(f"Error in get_housing_response: {str(e)}")
        fallback_response = "I'm here to help with your housing needs! Could you tell me a bit more about your situation? For example, are you a veteran, do you have family with you, or is this an emergency situation? This will help me find the best resources for you."
        
        return {
            "response": fallback_response,
            "session_id": session_id or str(uuid.uuid4()),
            "status": "fallback"
        }

@app.route('/api/query', methods=['POST'])
def api_query():
    """API endpoint for housing queries"""
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        session_id = data.get('session_id')
        
        if not query:
            return jsonify({
                "error": "Query is required",
                "status": "error"
            }), 400
        
        result = get_housing_response(query, session_id)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            "error": f"Internal server error: {str(e)}",
            "status": "error"
        }), 500

@app.route('/api/reset', methods=['POST'])
def api_reset():
    """Reset conversation session"""
    try:
        data = request.get_json() or {}
        session_id = data.get('session_id')
        
        if session_id and session_id in sessions:
            # Clear the conversation history
            sessions[session_id]['messages'] = []
            sessions[session_id]['last_activity'] = datetime.now()
        
        return jsonify({
            "message": "Session reset successfully",
            "status": "success"
        })
        
    except Exception as e:
        return jsonify({
            "error": f"Error resetting session: {str(e)}",
            "status": "error"
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Housing Counselor API",
        "active_sessions": len(sessions),
        "timestamp": datetime.now().isoformat()
    })

@app.route('/widget', methods=['GET'])
def widget_demo():
    """Serve the widget demo page"""
    try:
        with open('widget.html', 'r') as f:
            widget_html = f.read()
        
        # Replace the API base URL with current server
        widget_html = widget_html.replace(
            'http://localhost:8080',
            f'http://localhost:{PORT}'
        )
        
        return render_template_string(widget_html)
    except Exception as e:
        return f"Error loading widget: {str(e)}", 500

@app.route('/chat', methods=['GET'])
def fullscreen_chat():
    """Serve the fullscreen chat interface"""
    return render_template('chat.html')

@app.route('/resource-finder', methods=['GET'])
def resource_finder():
    """Serve the fullscreen resource finder interface"""
    return render_template('resource-finder.html')

@app.route('/', methods=['GET'])
def home():
    """Serve the main demo platform"""
    try:
        with open('demo_app.html', 'r') as f:
            demo_html = f.read()
        return render_template_string(demo_html)
    except Exception as e:
        return f"Error loading demo platform: {str(e)}", 500

@app.route('/all-resources', methods=['GET'])
def all_resources():
    """Serve the all resources directory"""
    return render_template('all-resources.html')

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
        
        # Create new client with simplified fields
        client = {
            "id": len(clients) + 1,  # Simple ID generation
            "name": data.get('name', ''),
            "contact": data.get('contact', ''),
            "housing_need": data.get('housing_need', ''),
            "notes": data.get('notes', ''),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
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

@app.route('/api/clients/<int:client_id>', methods=['GET'])
def get_client(client_id):
    """Get a specific client"""
    client = next((c for c in clients if c['id'] == client_id), None)
    
    if not client:
        return jsonify({
            "error": "Client not found",
            "status": "error"
        }), 404
    
    return jsonify({
        "client": client,
        "status": "success"
    })

@app.route('/api/clients/<int:client_id>', methods=['PUT'])
def update_client(client_id):
    """Update a client"""
    try:
        client = next((c for c in clients if c['id'] == client_id), None)
        
        if not client:
            return jsonify({
                "error": "Client not found",
                "status": "error"
            }), 404
        
        data = request.get_json()
        
        # Update fields
        for key, value in data.items():
            if key != 'id':  # Don't allow ID changes
                client[key] = value
        
        return jsonify({
            "client": client,
            "message": "Client updated successfully",
            "status": "success"
        })
        
    except Exception as e:
        return jsonify({
            "error": f"Error updating client: {str(e)}",
            "status": "error"
        }), 500

@app.route('/api/send-referral', methods=['POST'])
def send_referral():
    """Send a referral email"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['client_id', 'resource_name', 'to_email', 'social_worker_name', 'social_worker_email']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    "error": f"Field '{field}' is required",
                    "status": "error"
                }), 400
        
        # Get client
        client = next((c for c in clients if c['id'] == data['client_id']), None)
        if not client:
            return jsonify({
                "error": "Client not found",
                "status": "error"
            }), 404
        
        # Create email content
        # Split full name into first and last
        name_parts = client['name'].split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        subject = f"Referral: {first_name} {last_name} - {data['resource_name']}"
        
        body = f"""Dear {data.get('resource_organization', 'Service Provider')},

I would like to refer my client for your services:

CLIENT INFORMATION:
- Name: {client['name']}
- Contact: {client['contact']}
- Housing Need: {client['housing_need']}
- Notes: {client['notes']}

REFERRAL DETAILS:
- Service: {data['resource_name']}
- Category: {data.get('resource_category', 'Housing Services')}
- Date of Referral: {datetime.now().strftime('%B %d, %Y')}

ADDITIONAL NOTES:
{data.get('notes', 'No additional notes provided')}

SOCIAL WORKER INFORMATION:
- Name: {data['social_worker_name']}
- Email: {data['social_worker_email']}
- Organization: Houston Housing Counselor

Please contact the client or myself to proceed with this referral. Thank you for your services to our community.

Best regards,
{data['social_worker_name']}
Houston Housing Counselor
{data['social_worker_email']}
"""
        
        # Send email
        email_result = send_referral_email(
            to_email=data['to_email'],
            subject=subject,
            body=body,
            from_name=data['social_worker_name']
        )
        
        if email_result['success']:
            # Log the referral to the client
            if 'referrals' not in client:
                client['referrals'] = []
            
            client['referrals'].append({
                'date': datetime.now().isoformat(),
                'resource_name': data['resource_name'],
                'to_email': data['to_email'],
                'social_worker': data['social_worker_name'],
                'notes': data.get('notes', ''),
                'status': 'sent'
            })
            
            return jsonify({
                "message": f"Referral sent successfully to {data['to_email']}",
                "status": "success",
                "referral_id": len(client['referrals'])
            })
        else:
            return jsonify({
                "error": email_result['error'],
                "status": "error"
            }), 500
            
    except Exception as e:
        return jsonify({
            "error": f"Error sending referral: {str(e)}",
            "status": "error"
        }), 500

@app.route('/api/docs', methods=['GET'])
def api_docs():
    """API documentation"""
    docs = {
        "service": "Housing Counselor API",
        "version": "1.0.0",
        "endpoints": {
            "POST /api/query": {
                "description": "Send a housing-related query to Maria, the housing counselor",
                "body": {
                    "query": "string (required) - The user's question or statement",
                    "session_id": "string (optional) - Session ID for conversation continuity"
                },
                "response": {
                    "response": "string - Maria's response",
                    "session_id": "string - Session ID for future requests",
                    "status": "string - 'success' or 'fallback'"
                }
            },
            "POST /api/reset": {
                "description": "Reset a conversation session",
                "body": {
                    "session_id": "string (optional) - Session ID to reset"
                },
                "response": {
                    "message": "string - Success message",
                    "status": "string - 'success'"
                }
            },
            "GET /api/health": {
                "description": "Health check endpoint",
                "response": {
                    "status": "string - 'healthy'",
                    "service": "string - Service name",
                    "active_sessions": "number - Number of active sessions",
                    "timestamp": "string - Current timestamp"
                }
            },
            "GET /widget": {
                "description": "Demo page showing the embeddable widget"
            }
        },
        "integration_examples": {
            "iframe": f'<iframe src="http://localhost:{PORT}/widget" width="400" height="600" frameborder="0"></iframe>',
            "javascript": {
                "basic_query": """
fetch('http://localhost:""" + str(PORT) + """/api/query', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        query: 'I need emergency housing tonight',
        session_id: 'optional-session-id'
    })
})
.then(response => response.json())
.then(data => console.log(data.response));
"""
            }
        }
    }
    
    return jsonify(docs)

if __name__ == '__main__':
    print(f"🏠 Housing Counselor API starting on port {PORT}")
    print(f"📋 API Documentation: http://localhost:{PORT}/api/docs")
    print(f"🔧 Widget Demo: http://localhost:{PORT}/widget")
    print(f"💬 Fullscreen Chat: http://localhost:{PORT}/chat")
    print(f"🔍 Resource Finder: http://localhost:{PORT}/resource-finder")
    print(f"📁 All Resources: http://localhost:{PORT}/all-resources")
    print(f"💚 Health Check: http://localhost:{PORT}/api/health")
    print(f"🔗 CORS enabled for cross-origin requests")
    
    app.run(debug=True, host='0.0.0.0', port=PORT) 