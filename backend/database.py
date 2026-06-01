import os
import cloudinary
import cloudinary.uploader
import cloudinary.api
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import logging


# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logging.info('Environment variables loaded successfully.')

# MongoDB configuration
MONGODB_URI = os.getenv('MONGODB_URI')
DB_NAME = os.getenv('DATABASE_NAME')

# Cloudinary Configuration
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET'),
    secure=True
)

def upload_image_to_cloud(file_byte: bytes, folder_name: str='xrays') -> str:
    """
    Uploads an image to Cloudinary and returns the URL of the uploaded image.

    Args:
        file_byte (bytes): The byte content of the image to be uploaded.
        folder_name (str): The folder in Cloudinary where the image will be stored.

    Returns:
        str: The URL of the uploaded image.
        
    Raises:
        Exception: If there is an error during the upload process.
        
    """
    try:
        logging.info('Uploading image to Cloudinary...')
        response = cloudinary.uploader.upload(file_byte,
                                        folder=f'precision_diagnostics/{folder_name}')
        logging.info('Image uploaded successfully.')
        return response.get('secure_url')
    except Exception as e:
        logging.error(f'Error uploading image: {e}')
        raise e
    
    
    
# Initialize MongoDB client
try:
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[DB_NAME]
    logging.info('Connected to MongoDB successfully.')
except Exception as e:
    logging.error(f'Error connecting to MongoDB: {e}')
    raise e

diagnostic_records = db['records']