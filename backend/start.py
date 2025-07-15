#!/usr/bin/env python3
"""
Railway startup script for NextStep backend
"""
import os
import sys
import time
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def check_environment():
    """Check if required environment variables are set"""
    # Check for OpenAI API key (either name)
    openai_key = os.environ.get("OPENAI_API_KEY") or os.environ.get("OPEN_API_KEY")
    if not openai_key:
        logger.error("Missing OpenAI API key. Please set OPENAI_API_KEY or OPEN_API_KEY environment variable")
        return False
    
    # Set the standard name for consistency
    os.environ["OPENAI_API_KEY"] = openai_key
    
    logger.info("All required environment variables are set")
    return True

def main():
    """Main startup function"""
    logger.info("Starting NextStep backend...")
    
    # Check environment
    if not check_environment():
        logger.error("Environment check failed")
        sys.exit(1)
    
    # Set port
    port = int(os.environ.get("PORT", 5001))
    logger.info(f"Starting server on port {port}")
    
    # Import and run the server
    try:
        from server import app
        import uvicorn
        
        # Start the server
        uvicorn.run(
            app, 
            host="0.0.0.0", 
            port=port,
            log_level="info"
        )
        
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 