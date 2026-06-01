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
    # Allow local dev ports and the deployed Vercel domain. Use a regex for vercel subdomains.
    allow_origins=[
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:8000',
        'https://precision-diagnostics-xai.vercel.app'
    ],
    allow_origin_regex=r".*\.vercel\.app$",
    # Note: In production, lock this list to the exact origins you control.
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(predict.router)

@app.get('/')
async def root_health_check():
    '''Simple endpoint to verify the server is running.'''
    return {'status': 'online', 'message': 'Precision Diagnostics AI Engine is active.'}
