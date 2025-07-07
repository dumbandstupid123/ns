from __future__ import annotations
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    RunContext,
    WorkerOptions,
    cli,
    function_tool
)
from livekit.plugins import openai, silero
from api import AssistantFnc
from prompts import WELCOME_MESSAGE, INSTRUCTIONS
import os
from livekit import api

# LiveKit configuration
LIVEKIT_URL = "wss://momos-ikbxpsxu.livekit.cloud"
LIVEKIT_API_KEY = "APIS4DNmLbLUxHf"
LIVEKIT_API_SECRET = "nbQGUQgTnpEa4SUI8VaBHLOsn1Qq4ozLWAdrspLVVDH"

# OpenAI configuration
if "OPENAI_API_KEY" not in os.environ:
    raise ValueError("Please set the OPENAI_API_KEY environment variable")

class SocialWorkerAssistant(Agent):
    def __init__(self, assistant_fnc: AssistantFnc) -> None:
        super().__init__(
            instructions=INSTRUCTIONS
        )
        self.assistant_fnc = assistant_fnc
        
    @function_tool()
    async def lookup_client(self, context: RunContext, client_id: str) -> dict:
        """Look up a client by their ID number.
        
        Args:
            client_id: The client ID to look up
        """
        return await self.assistant_fnc.lookup_client(client_id)
        
    @function_tool()
    async def get_case_history(self, context: RunContext) -> dict:
        """Get the case history for the current client."""
        return await self.assistant_fnc.get_case_history()
        
    @function_tool()
    async def get_available_resources(self, context: RunContext) -> dict:
        """Get information about available resources and programs in Houston."""
        return await self.assistant_fnc.get_available_resources()

async def entrypoint(ctx: JobContext):
    await ctx.connect()
    
    assistant_fnc = AssistantFnc()
    agent = SocialWorkerAssistant(assistant_fnc)
    
    session = AgentSession(
        vad=silero.VAD.load(),
        stt=openai.STT(model="whisper-1"),
        llm=openai.LLM(model="gpt-4"),
        tts=openai.TTS(voice="shimmer"),
    )

    await session.start(
        agent=agent,
        room=ctx.room
    )
    
    await session.generate_reply(
        instructions="Greet the user with the following message: " + WELCOME_MESSAGE
    )

if __name__ == "__main__":
    # Set up the worker options with the correct URL format
    api_url = LIVEKIT_URL.replace("wss://", "https://")
    ws_url = f"{LIVEKIT_URL}/agent"  # Add /agent to the WebSocket URL
    
    options = WorkerOptions(
        entrypoint_fnc=entrypoint,
        ws_url=ws_url,
        api_key=LIVEKIT_API_KEY,
        api_secret=LIVEKIT_API_SECRET
    )
    print(f"Starting agent with WebSocket URL: {ws_url}")
    print(f"API URL: {api_url}")
    cli.run_app(options)