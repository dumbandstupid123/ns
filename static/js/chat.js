// Chat functionality
class HousingChatApp {
    constructor() {
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.chatMessages = document.getElementById('chatMessages');
        this.loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
        
        this.initEventListeners();
        this.scrollToBottom();
    }

    initEventListeners() {
        // Send button click
        this.sendButton.addEventListener('click', () => {
            this.sendMessage();
        });

        // Enter key press
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Example question buttons
        document.querySelectorAll('.example-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const question = btn.getAttribute('data-question');
                this.messageInput.value = question;
                this.sendMessage();
            });
        });

        // Reset conversation button
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetConversation();
        });

        // Auto-resize input
        this.messageInput.addEventListener('input', (e) => {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
        });
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        
        if (!message) {
            this.showError('Please enter a message');
            return;
        }

        // Disable input while processing
        this.setInputState(false);
        
        // Add user message to chat
        this.addMessage(message, 'user');
        
        // Clear input
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';

        // Show loading
        this.showTypingIndicator();

        try {
            // Send request to API
            const response = await fetch('/api/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: message })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Remove typing indicator
            this.removeTypingIndicator();
            
            // Add AI response
            this.addMessage(data.response, 'ai', data.sources);

        } catch (error) {
            console.error('Error:', error);
            this.removeTypingIndicator();
            this.addMessage(
                'Sorry, I encountered an error while processing your request. Please try again or check your connection.',
                'ai',
                [],
                true
            );
        } finally {
            // Re-enable input
            this.setInputState(true);
            this.messageInput.focus();
        }
    }

    addMessage(content, type, sources = [], isError = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        if (isError) {
            messageContent.classList.add('error-message');
        }

        if (type === 'user') {
            messageContent.innerHTML = `<strong>You:</strong><br>${this.escapeHtml(content)}`;
        } else {
            messageContent.innerHTML = `<strong>Maria (Housing Counselor):</strong><br>${this.formatResponse(content)}`;
            
            // Add sources if available
            if (sources && sources.length > 0) {
                const sourcesDiv = document.createElement('div');
                sourcesDiv.className = 'sources';
                sourcesDiv.innerHTML = `
                    <h6><i class="fas fa-bookmark"></i> Sources:</h6>
                    ${sources.map(source => `<div class="source-item">${this.escapeHtml(source)}</div>`).join('')}
                `;
                messageContent.appendChild(sourcesDiv);
            }
        }

        messageDiv.appendChild(messageContent);
        this.chatMessages.appendChild(messageDiv);
        
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-content">
                <strong>Maria (Housing Counselor):</strong><br>
                <span class="loading-dots">Thinking about your situation</span>
            </div>
        `;
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }

    async resetConversation() {
        try {
            // Show loading
            this.setInputState(false);
            
            // Clear chat messages
            this.chatMessages.innerHTML = '';
            
            // Call reset API
            const response = await fetch('/api/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Add Maria's fresh greeting
            this.addMessage(data.response, 'ai', data.sources);

        } catch (error) {
            console.error('Error resetting conversation:', error);
            this.addMessage(
                "Hi! I'm Maria, your housing counselor. I'm here to help you find the perfect housing solution for your situation. What brings you here today?",
                'ai',
                [],
                false
            );
        } finally {
            // Re-enable input
            this.setInputState(true);
            this.messageInput.focus();
        }
    }

    removeTypingIndicator() {
        const typingIndicator = this.chatMessages.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    setInputState(enabled) {
        this.messageInput.disabled = !enabled;
        this.sendButton.disabled = !enabled;
        
        if (enabled) {
            this.sendButton.innerHTML = '<i class="fas fa-paper-plane"></i> Send';
        } else {
            this.sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        }
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatResponse(text) {
        // Convert line breaks to HTML
        text = this.escapeHtml(text);
        text = text.replace(/\n/g, '<br>');
        
        // Make phone numbers clickable
        text = text.replace(/(\d{3}-\d{3}-\d{4})/g, '<a href="tel:$1">$1</a>');
        
        // Make email addresses clickable
        text = text.replace(/([\w\.-]+@[\w\.-]+\.\w+)/g, '<a href="mailto:$1">$1</a>');
        
        return text;
    }

    showError(message) {
        // You can implement a toast notification here
        alert(message);
    }
}

// Initialize the chat app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new HousingChatApp();
});

// Add some utility functions for better UX
document.addEventListener('DOMContentLoaded', () => {
    // Add smooth animations to example buttons
    const exampleBtns = document.querySelectorAll('.example-btn');
    exampleBtns.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.classList.add('pulse');
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.classList.remove('pulse');
        });
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + / to focus input
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            document.getElementById('messageInput').focus();
        }
    });

    // Add connection status indicator
    window.addEventListener('online', () => {
        console.log('Connection restored');
    });

    window.addEventListener('offline', () => {
        console.log('Connection lost');
        // You could show a notification here
    });
});

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HousingChatApp;
} 