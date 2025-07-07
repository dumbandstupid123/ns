from flask import Flask, request, jsonify
from flask_cors import CORS
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import logging
import json
import os
from prompts import SYSTEM_PROMPT

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AssistantFnc:
    def __init__(self):
        self.system_prompt = SYSTEM_PROMPT
        self.conversation_history = []

    def get_response(self, user_input):
        # Add user input to conversation history
        self.conversation_history.append({"role": "user", "content": user_input})
        
        # For now, return a simple response
        response = "I am your AI assistant. I understand you said: " + user_input
        
        # Add assistant response to conversation history
        self.conversation_history.append({"role": "assistant", "content": response})
        
        return response

app = Flask(__name__)
CORS(app)

# Email configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = "sr185@rice.edu"
SENDER_PASSWORD = "keyk oada jsyv huuc"
RECIPIENT_EMAIL = "hk80@rice.edu"

# File to store client data
CLIENTS_FILE = 'clients.json'

def load_clients():
    if os.path.exists(CLIENTS_FILE):
        with open(CLIENTS_FILE, 'r') as f:
            return json.load(f)
    return {'clients': [], 'next_id': 1}

def save_clients(data):
    with open(CLIENTS_FILE, 'w') as f:
        json.dump(data, f, indent=2)

@app.route('/api/test', methods=['GET'])
def test_route():
    return jsonify({"message": "Backend server is running"}), 200

@app.route('/api/send-referral', methods=['POST'])
def send_referral():
    try:
        data = request.json
        logger.info(f"Received referral request: {data}")
        
        resource_name = data.get('resourceName')
        resource_type = data.get('resourceType')
        resource_details = data.get('resourceDetails')
        sender_email = data.get('senderEmail')

        # Validate required fields
        if not all([resource_name, resource_type, resource_details, sender_email]):
            return jsonify({"error": "Missing required fields"}), 400

        # Create email message
        msg = MIMEMultipart()
        msg['From'] = SENDER_EMAIL
        msg['To'] = RECIPIENT_EMAIL
        msg['Subject'] = f"New Resource Referral: {resource_name}"

        # Email body
        body = f"""
        New Resource Referral

        Resource: {resource_name}
        Type: {resource_type}
        Details: {resource_details}

        Referred by: {sender_email}
        Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        """

        msg.attach(MIMEText(body, 'plain'))

        # Send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            logger.info("Connecting to SMTP server...")
            server.starttls()
            logger.info("Logging into SMTP server...")
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            logger.info("Sending email...")
            server.send_message(msg)
            logger.info("Email sent successfully")

        return jsonify({"message": "Referral sent successfully"}), 200

    except smtplib.SMTPAuthenticationError as e:
        logger.error(f"SMTP Authentication Error: {str(e)}")
        return jsonify({"error": "Email authentication failed. Please check credentials."}), 401
    except Exception as e:
        logger.error(f"Error sending referral: {str(e)}")
        return jsonify({"error": f"Failed to send referral: {str(e)}"}), 500

@app.route('/api/add-client', methods=['POST'])
def add_client():
    try:
        data = request.json
        logger.info("Received new client data")

        # Load existing clients
        clients_data = load_clients()
        
        # Add new client with ID and timestamp
        new_client = {
            'id': clients_data['next_id'],
            'dateAdded': datetime.now().isoformat(),
            **data
        }
        
        clients_data['clients'].append(new_client)
        clients_data['next_id'] += 1
        
        # Save updated clients data
        save_clients(clients_data)
        
        return jsonify({"message": "Client added successfully", "client": new_client}), 200
    
    except Exception as e:
        logger.error(f"Error adding client: {str(e)}")
        return jsonify({"error": f"Failed to add client: {str(e)}"}), 500

@app.route('/api/recent-clients', methods=['GET'])
def get_recent_clients():
    try:
        # Load clients data
        clients_data = load_clients()
        
        # Sort clients by date added (most recent first)
        sorted_clients = sorted(
            clients_data['clients'],
            key=lambda x: x['dateAdded'],
            reverse=True
        )
        
        # Return only the 20 most recent clients
        recent_clients = sorted_clients[:20]
        
        return jsonify({"clients": recent_clients}), 200
    
    except Exception as e:
        logger.error(f"Error fetching recent clients: {str(e)}")
        return jsonify({"error": f"Failed to fetch recent clients: {str(e)}"}), 500

if __name__ == '__main__':
    logger.info("Starting Flask server...")
    app.run(host='0.0.0.0', port=8000)