import os
from livekit import api
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS
from livekit.api import LiveKitAPI, ListRoomsRequest
import uuid
import uvicorn
from asgiref.wsgi import WsgiToAsgi
import asyncio

# LiveKit configuration
LIVEKIT_URL = "wss://momos-ikbxpsxu.livekit.cloud"
LIVEKIT_API_KEY = "APIS4DNmLbLUxHf"
LIVEKIT_API_SECRET = "nbQGUQgTnpEa4SUI8VaBHLOsn1Qq4ozLWAdrspLVVDH"

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
asgi_app = WsgiToAsgi(app)

async def generate_room_name():
    try:
        name = "room-" + str(uuid.uuid4())[:8]
        api_client = LiveKitAPI(
            url=LIVEKIT_URL,
            api_key=LIVEKIT_API_KEY,
            api_secret=LIVEKIT_API_SECRET
        )
        rooms = await api_client.room.list_rooms(ListRoomsRequest())
        await api_client.aclose()
        existing_rooms = [room.name for room in rooms.rooms]
        while name in existing_rooms:
            name = "room-" + str(uuid.uuid4())[:8]
        return name
    except Exception as e:
        print(f"Error generating room name: {e}")
        return "room-" + str(uuid.uuid4())[:8]

@app.route("/api/get")
async def get_token():
    try:
        name = request.args.get("name", "anonymous")
        room = await generate_room_name()
        
        token = api.AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
        token.with_identity(name)
        token.with_name(name)
        token.with_grants(api.VideoGrants(
            room_join=True,
            room=room,
            can_publish=True,
            can_subscribe=True
        ))
        
        jwt_token = token.to_jwt()
        print(f"Generated token for {name} in room {room}")
        
        return jsonify({
            "token": jwt_token,
            "room": room
        })
    except Exception as e:
        print(f"Error generating token: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("Starting server on port 5001...")
    uvicorn.run(asgi_app, host="0.0.0.0", port=5001)