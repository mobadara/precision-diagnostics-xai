from fastapi import APIRouter, File, UploadFile, HTTPException
from ..schema import PredictionResponse, DiagnosticRecordSchema
from ..database import upload_image_to_cloud, diagnostic_records
from ..ml_model import run_diagnostic_inference

# Create the router instance
router = APIRouter(
    prefix='/api/v1',
    tags=['Diagnostics']
)

# Enforce strict typing on the response using response_model
@router.post('/predict', response_model=PredictionResponse)
async def predict_xray(file: UploadFile = File(...)):
    '''
    Analyzes an uploaded X-ray, uploads to Cloudinary, saves to MongoDB, 
    and returns strictly typed results.
    '''
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail='Invalid file format. Please upload an image.')

    try:
        image_bytes = await file.read()
        ai_result = run_diagnostic_inference(image_bytes)

        original_url = upload_image_to_cloud(image_bytes, folder_name='raw_xrays')
        heatmap_url = upload_image_to_cloud(ai_result['heatmap_bytes'], folder_name='heatmaps')

        # Use Pydantic to validate the data before saving to MongoDB
        record = DiagnosticRecordSchema(
            original_image_url=original_url,
            heatmap_image_url=heatmap_url,
            prediction=ai_result['prediction'],
            confidence_score=ai_result['confidence'],
            probabilities=ai_result['probabilities']
        )

        # model_dump() converts the Pydantic model safely to a dictionary for MongoDB
        result = await diagnostic_records.insert_one(record.model_dump())

        # Return a dictionary that strictly matches PredictionResponse
        return {
            'status': 'success',
            'record_id': str(result.inserted_id),
            'prediction': ai_result['prediction'],
            'confidence': ai_result['confidence'],
            'heatmap_url': heatmap_url,
            'original_url': original_url
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Inference pipeline failed: {str(e)}')
    
    
@router.put('/override/{record_id}')
async def submit_physician_override(record_id: str, override_data: OverrideRequest):
    '''
    Updates a specific diagnostic record with the physician's feedback.
    '''
    try:
        # Update the MongoDB document matching the ID
        update_result = await diagnostic_records.update_one(
            {'_id': ObjectId(record_id)},
            {'$set': {
                'physician_override': override_data.physician_override,
                'override_notes': override_data.notes
            }}
        )

        if update_result.modified_count == 0:
            raise HTTPException(status_code=404, detail='Diagnostic record not found.')

        return {'status': 'success', 'message': 'Feedback recorded. A/B metrics updated.'}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Database update failed: {str(e)}')