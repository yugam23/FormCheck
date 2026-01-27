from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI()


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "FormCheck API"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            # In a real scenario we parse the json:
            # message = json.loads(data)
            # frame_data = message.get("payload")

            # Simple confirmation including data length
            await websocket.send_text(f"Processed frame: {len(data)} bytes")
    except WebSocketDisconnect:
        print("Client disconnected")
