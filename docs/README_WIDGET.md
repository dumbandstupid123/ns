# 🏠 Housing Counselor Widget - Integration Ready

The Housing Counselor is now a **modular, embeddable widget** that can be integrated into any application or platform! 

## 🚀 Quick Start

### Option 1: Complete Platform Demo
```bash
python start_platform.py
```
This launches:
- Housing Counselor API (port 8081)
- Demo Platform (port 8082) 
- Opens browser automatically

### Option 2: API Only
```bash
python app_api.py
```
Then visit `http://localhost:8081/widget` for the standalone widget.

## 📱 What You Get

### 🎯 **Demo Platform** (`http://localhost:8082`)
A complete community services platform showing how the Housing Counselor integrates as one component among multiple services:

- **Housing Counselor** (✅ Active) - Click to open Maria's chat widget
- **Legal Aid** (Coming Soon) 
- **Healthcare Navigator** (Coming Soon)
- **Employment Center** (Coming Soon)
- **Benefits Navigator** (Coming Soon)
- **Crisis Support** (✅ Active)

### 🤖 **Standalone Widget** (`http://localhost:8081/widget`)
The housing counselor as a standalone embeddable widget with:
- Modern chat interface
- Conversation memory
- Quick action buttons
- Mobile responsive design

### 🔌 **REST API** (`http://localhost:8081/api/`)
- `POST /api/query` - Send messages to Maria
- `POST /api/reset` - Reset conversation
- `GET /api/health` - Health check
- `GET /api/docs` - Full API documentation

## 🛠️ Integration Examples

### 1. Simple Iframe Embed
```html
<iframe 
    src="http://localhost:8081/widget" 
    width="400" 
    height="600"
    style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
</iframe>
```

### 2. Modal Integration (Like Demo Platform)
```javascript
function openHousingWidget() {
    // Create modal
    const modal = document.createElement('div');
    modal.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                    background: rgba(0,0,0,0.5); z-index: 1000; display: flex; 
                    align-items: center; justify-content: center;">
            <iframe src="http://localhost:8081/widget" 
                    width="400" height="600" 
                    style="border: none; border-radius: 12px; background: white;">
            </iframe>
        </div>
    `;
    document.body.appendChild(modal);
}
```

### 3. React Component
```jsx
const HousingCounselor = () => {
    return (
        <iframe 
            src="http://localhost:8081/widget"
            style={{ width: '400px', height: '600px', border: 'none' }}
        />
    );
};
```

### 4. API Integration
```javascript
// Send message to housing counselor
const response = await fetch('http://localhost:8081/api/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        query: 'I need emergency housing tonight',
        session_id: 'optional-session-id'
    })
});

const data = await response.json();
console.log(data.response); // Maria's response
```

## 🎨 Customization Options

The widget can be styled and configured:

### CSS Variables
```css
.housing-widget {
    --primary-color: #your-brand-color;
    --border-radius: 8px;
    --shadow: 0 2px 8px rgba(0,0,0,0.1);
}
```

### URL Parameters
```
http://localhost:8081/widget?theme=dark&compact=true
```

### API Configuration
```javascript
const widget = new HousingWidget({
    apiUrl: 'http://your-domain.com:8081',
    theme: 'light',
    height: '500px'
});
```

## 🏗️ Architecture

```
┌─────────────────────┐    ┌─────────────────────┐
│   Your App/Site     │    │  Community Platform │
│                     │    │                     │
│  ┌───────────────┐  │    │  ┌─────────────────┤
│  │ Housing Widget│  │    │  │ Housing Service │
│  │    (iframe)   │  │    │  │    (modal)      │
│  └───────────────┘  │    │  └─────────────────┤
│                     │    │  │ Other Services  │
└─────────────────────┘    │  └─────────────────┤
                           └─────────────────────┘
            │                         │
            └─────────────────────────┘
                        │
                ┌───────────────────┐
                │ Housing API       │
                │ (Port 8081)       │
                │                   │
                │ • Chat endpoint   │
                │ • Session mgmt    │
                │ • Vector search   │
                │ • GPT-4o-mini     │
                └───────────────────┘
```

## 📊 Features

- **🧠 Intelligent**: GPT-4o-mini powered with RAG for accurate housing info
- **💬 Conversational**: Maintains context and asks follow-up questions  
- **🎯 Targeted**: Provides 1-2 specific recommendations, not overwhelming lists
- **📱 Responsive**: Works on desktop, tablet, and mobile
- **🔒 Secure**: Session-based conversations with no data persistence
- **⚡ Fast**: Optimized embeddings and vector search
- **🔌 Embeddable**: Multiple integration options for any platform

## 🚀 Production Deployment

### Docker
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8081
CMD ["python", "app_api.py"]
```

### Environment Variables
```bash
OPENAI_API_KEY=your-key-here
PORT=8081
CHROMA_PATH=./chroma
```

## 📁 File Structure

```
langchain-rag-tutorial/
├── app_api.py              # Main API server
├── widget.html             # Standalone widget page
├── demo_app.html           # Community platform demo
├── start_platform.py       # Easy launcher script
├── integration_examples.md # Detailed integration guide
├── README_WIDGET.md        # This file
├── app.py                  # Original full-page version
├── chroma/                 # Vector database
└── data/books/housing.md   # Housing resource data
```

## 🤝 Support

- **Widget Demo**: `http://localhost:8081/widget`
- **API Docs**: `http://localhost:8081/api/docs`  
- **Health Check**: `http://localhost:8081/api/health`
- **Integration Guide**: See `integration_examples.md`

---

**The Housing Counselor is now ready to be embedded anywhere!** 🎉

Whether you're building a community services website, adding housing assistance to an existing platform, or creating a mobile app - the widget integrates seamlessly while providing intelligent, personalized housing guidance. 