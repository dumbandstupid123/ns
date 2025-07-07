# Housing Counselor Widget Integration Guide

The Housing Counselor is now available as a modular component that can be easily integrated into any application. Here are multiple integration options:

## 🚀 Quick Start

1. **Start the API service:**
   ```bash
   cd langchain-rag-tutorial
   python app_api.py
   ```
   This runs the API on port 8081 (configurable via PORT environment variable)

2. **View the demo widget:**
   Visit `http://localhost:8081/widget` to see the widget in action

## 📋 Integration Options

### 1. 🖼️ **Iframe Embedding** (Easiest)
Perfect for quickly adding to any website or app:

```html
<!-- Simple iframe embed -->
<iframe 
    src="http://localhost:8081/widget" 
    width="400" 
    height="600" 
    frameborder="0"
    style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
</iframe>
```

### 2. 🔌 **JavaScript API Integration**
For custom implementations with full control:

```javascript
class HousingCounselor {
    constructor(apiUrl = 'http://localhost:8081') {
        this.apiUrl = apiUrl;
        this.sessionId = null;
    }

    async sendMessage(query) {
        const response = await fetch(`${this.apiUrl}/api/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: query,
                session_id: this.sessionId
            })
        });
        
        const data = await response.json();
        this.sessionId = data.session_id;
        return data.response;
    }

    async resetConversation() {
        await fetch(`${this.apiUrl}/api/reset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: this.sessionId })
        });
        this.sessionId = null;
    }
}

// Usage
const counselor = new HousingCounselor();
const response = await counselor.sendMessage('I need veteran housing options');
console.log(response);
```

### 3. ⚛️ **React Component**
For React applications:

```jsx
import React, { useState, useRef, useEffect } from 'react';

const HousingCounselorWidget = ({ apiUrl = 'http://localhost:8081' }) => {
    const [messages, setMessages] = useState([
        { type: 'ai', content: "Hi! I'm Maria, your housing counselor. How can I help you today?" }
    ]);
    const [input, setInput] = useState('');
    const [sessionId, setSessionId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const sendMessage = async (messageText) => {
        if (!messageText.trim()) return;

        // Add user message
        setMessages(prev => [...prev, { type: 'user', content: messageText }]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch(`${apiUrl}/api/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: messageText,
                    session_id: sessionId
                })
            });

            const data = await response.json();
            setSessionId(data.session_id);
            setMessages(prev => [...prev, { type: 'ai', content: data.response }]);
        } catch (error) {
            setMessages(prev => [...prev, { 
                type: 'ai', 
                content: "I'm having technical difficulties. Can you tell me about your housing situation?" 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="housing-widget" style={{ width: '400px', height: '600px', border: '1px solid #ddd', borderRadius: '12px' }}>
            <div className="widget-header" style={{ background: '#0d6efd', color: 'white', padding: '1rem', textAlign: 'center' }}>
                <h4>🏠 Housing Counselor - Maria</h4>
            </div>
            
            <div className="messages" style={{ flex: 1, overflowY: 'auto', padding: '1rem', maxHeight: '400px' }}>
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.type}`} style={{ 
                        marginBottom: '1rem',
                        textAlign: msg.type === 'user' ? 'right' : 'left'
                    }}>
                        <div style={{
                            padding: '0.75rem',
                            borderRadius: '18px',
                            background: msg.type === 'user' ? '#0d6efd' : '#f8f9fa',
                            color: msg.type === 'user' ? 'white' : 'black',
                            display: 'inline-block',
                            maxWidth: '85%'
                        }}>
                            <strong>{msg.type === 'user' ? 'You' : 'Maria'}:</strong><br/>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && <div>Maria is thinking...</div>}
            </div>

            <div className="input-area" style={{ padding: '1rem', borderTop: '1px solid #ddd' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
                        placeholder="Tell me about your housing situation..."
                        style={{ flex: 1, padding: '0.5rem', borderRadius: '20px', border: '1px solid #ddd' }}
                    />
                    <button
                        onClick={() => sendMessage(input)}
                        style={{ padding: '0.5rem 1rem', borderRadius: '20px', background: '#0d6efd', color: 'white', border: 'none' }}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HousingCounselorWidget;
```

### 4. 🎯 **Vue.js Component**
For Vue applications:

```vue
<template>
  <div class="housing-widget">
    <div class="widget-header">
      <h4>🏠 Housing Counselor - Maria</h4>
    </div>
    
    <div class="messages" ref="messagesContainer">
      <div 
        v-for="(message, index) in messages" 
        :key="index"
        :class="['message', message.type + '-message']"
      >
        <div class="message-content">
          <strong>{{ message.type === 'user' ? 'You' : 'Maria' }}:</strong><br>
          {{ message.content }}
        </div>
      </div>
      <div v-if="isLoading" class="typing-indicator">Maria is thinking...</div>
    </div>

    <div class="input-area">
      <input
        v-model="input"
        @keyup.enter="sendMessage"
        placeholder="Tell me about your housing situation..."
        :disabled="isLoading"
      />
      <button @click="sendMessage" :disabled="isLoading">Send</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HousingCounselorWidget',
  props: {
    apiUrl: {
      type: String,
      default: 'http://localhost:8081'
    }
  },
  data() {
    return {
      messages: [
        { type: 'ai', content: "Hi! I'm Maria, your housing counselor. How can I help you today?" }
      ],
      input: '',
      sessionId: null,
      isLoading: false
    }
  },
  methods: {
    async sendMessage() {
      if (!this.input.trim()) return;

      this.messages.push({ type: 'user', content: this.input });
      const query = this.input;
      this.input = '';
      this.isLoading = true;

      try {
        const response = await fetch(`${this.apiUrl}/api/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: query,
            session_id: this.sessionId
          })
        });

        const data = await response.json();
        this.sessionId = data.session_id;
        this.messages.push({ type: 'ai', content: data.response });
      } catch (error) {
        this.messages.push({ 
          type: 'ai', 
          content: "I'm having technical difficulties. Can you tell me about your housing situation?" 
        });
      } finally {
        this.isLoading = false;
        this.$nextTick(() => {
          this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight;
        });
      }
    }
  }
}
</script>
```

### 5. 🐍 **Python Integration**
For Python applications (Flask, Django, FastAPI):

```python
import requests
import json

class HousingCounselorClient:
    def __init__(self, api_url="http://localhost:8081"):
        self.api_url = api_url
        self.session_id = None
    
    def send_message(self, query):
        """Send a message to the housing counselor"""
        response = requests.post(
            f"{self.api_url}/api/query",
            json={
                "query": query,
                "session_id": self.session_id
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            self.session_id = data.get("session_id")
            return data.get("response")
        else:
            return "Sorry, I'm having technical difficulties right now."
    
    def reset_conversation(self):
        """Reset the conversation"""
        if self.session_id:
            requests.post(
                f"{self.api_url}/api/reset",
                json={"session_id": self.session_id}
            )
        self.session_id = None

# Usage example
counselor = HousingCounselorClient()
response = counselor.send_message("I need emergency housing tonight")
print(response)
```

## 🎨 **Customization Options**

### Widget Styling
The widget can be customized via CSS:

```css
.housing-widget {
    --primary-color: #your-brand-color;
    --border-radius: 8px;
    --shadow: 0 2px 8px rgba(0,0,0,0.1);
    font-family: your-font-family;
}

.widget-header {
    background: var(--primary-color);
}
```

### Configuration Options
```javascript
const widget = new HousingWidget({
    apiBaseUrl: 'http://your-api-server.com',
    theme: 'light', // or 'dark'
    height: '500px',
    width: '350px',
    showQuickActions: true,
    placeholder: 'Your custom placeholder...'
});
```

## 🛠️ **Production Deployment**

### Environment Variables
```bash
PORT=8081                    # API port
OPENAI_API_KEY=your-key     # OpenAI API key
CHROMA_PATH=./chroma        # Vector database path
CORS_ORIGINS=*              # Allowed CORS origins
```

### Docker Deployment
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8081

CMD ["python", "app_api.py"]
```

### Nginx Configuration
```nginx
location /housing-api/ {
    proxy_pass http://localhost:8081/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## 📊 **Monitoring & Analytics**

The API provides built-in endpoints for monitoring:

- `GET /api/health` - Health check
- `GET /api/docs` - API documentation
- Session tracking and analytics available

## 🔒 **Security Considerations**

1. **API Key Management**: Store OpenAI API key securely
2. **CORS**: Configure CORS origins for production
3. **Rate Limiting**: Implement rate limiting for production
4. **Session Security**: Use secure session storage (Redis/DB)

## 🤝 **Support & Examples**

Need help? Check out:
- Demo widget: `http://localhost:8081/widget`
- API docs: `http://localhost:8081/api/docs`
- Health check: `http://localhost:8081/api/health`

The Housing Counselor widget is designed to be flexible and easy to integrate into any application while providing intelligent, contextual housing assistance. 