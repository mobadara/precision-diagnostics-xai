from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone

# Import our custom modules
from .database import upload_image_to_cloud, diagnostic_records
from .ml_model import run_diagnostic_inference
from .routers import predict

# Initialize the FastAPI application
app = FastAPI(
    title='Precision Diagnostics API',
    version='1.0.0',
    description='AI-powered pediatric pneumonia detection backend.'
)

# Configure CORS so the React frontend can communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*.vercel.app', 'localhost:3000'],  # Note: Restrict this to 'localhost:3000' or your domain in production
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(predict.router)

@app.get('/')
async def root_health_check():
    '''Simple endpoint to verify the server is running.'''
    return {'status': 'online', 'message': 'Precision Diagnostics AI Engine is active.'}
