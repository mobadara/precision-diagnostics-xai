import os
import io
import torch
import torch.nn as nn
import torchvision.transforms as transforms
from torchvision import models, transforms
from PIL import Image
from huggingface_hub import hf_hub_download
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image_targets import ClassifierOutputTarget
from pytorch_grad_cam.utils.image import show_cam_on_image
import numpy as np
import cv2
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


# Define model architecture
def get_densenet_model() -> nn.Module:
    """
    Returns a DenseNet-121 model modified for binary classification.
    
    The model is initialized without pre-trained weights and the classifier is replaced with a custom architecture suitable for binary classification.
    
    Returns:
        nn.Module: A modified DenseNet-121 model for binary classification.
    """
    model = models.densenet121(weights=None)
    num_features = model.classifier.in_features
    
    model.classifier = nn.Sequential(
        nn.Linear(num_features, 265),
        nn.ReLU(),
        nn.Dropout(0.3),
        nn.Linear(265, 2)
    )
    return model

DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
logging.info(f'Using device: {DEVICE}')


# Fetch weights from Hugging Face Hub
try:
    logging.info('Downloading fine-tuned weights from Hugging Face Hub...')
    weights_path = hf_hub_download(repo_id='mobadara/pneumonia-densenet121',
                                filename='densenet_pneumonia_finetuned.pth')
    model = get_densenet_model()
    model.load_state_dict(torch.load(weights_path, map_location=DEVICE))
    model.to(DEVICE)
    model.eval()
    logging.info('Model loaded successfully and evaluation context initialized.')
except Exception as e:
    logging.error(f'Error loading model: {e}')
    model = None  # Ensure model is defined even if loading fails  
    raise RuntimeError(f'Failed to load model: {e}')


# Image processing transformation pipeline
transform_pipeline = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def run_diagnostic_inference(image_bytes: bytes) -> dict:
    """
    uns an image buffer through the DenseNet pipeline, generates diagnostic probabilities,
    and constructs a visual Grad-CAM interpretability overlay.
    
    Args:
        image_bytes (bytes): The input image in bytes format.
        
    Returns:
        dict: A dictionary containing the predicted class, confidence score, and the Grad-CAM overlay image in bytes format.
    """
    if model is None:
        raise RuntimeError('Model is not loaded. Cannot perform inference.') 
    
    # Open image from raw stream byte and convert to standard RGB format
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    # Generate tensor batch for PyTorch model execution
    tensor_img = transform_pipeline(image).unsqueeze(0).to(DEVICE)
    # Perform class inference
    with torch.no_grad():
        outputs = model(tensor_img)
        probabilities = torch.softmax(outputs, dim=1).cpu().numpy()[0]
        
        # Class 0: Normal  |  Class 1: Pneumonia
        normal_prob = float(probabilities[0])
        pneumonia_prob = float(probabilities[1])
        
    prediction_class = 'Pneumonia' if pneumonia_prob > normal_prob else 'Normal'
    confidence_score = max(normal_prob, pneumonia_prob)
    
    logging.info(f'Inference completed: Predicted class - {prediction_class}, Confidence score - {confidence_score:.4f}')
    
    # Execute Grad-CAM calculation
    # Target the last dense block layer of DenseNet-121 for tracking applications
    
    target_layers = [model.features.denseblock4.denselayer16]
    # Prepare standard float array of the image for overlay mapping
    rgb_img_np = np.array(image.resize((224, 224)), dtype=np.float32) / 255.0
    
    cam = GradCAM(model=model, target_layers=target_layers)
    
    # Target the predicted class index specifically to see its activation layout
    target_category = 1 if prediction_class == "Pneumonia" else 0
    targets = [ClassifierOutputTarget(target_category)]
    
    # Compute visual grayscale activation map
    grayscale_cam = cam(input_tensor=tensor_img, targets=targets)[0, :]
    
    # Blend the grayscale map into a colored heatmap directly onto our structural input image
    cam_image_overlay = show_cam_on_image(rgb_img_np, grayscale_cam, use_rgb=True)
    
    # Step C: Encode Heatmap into binary buffer for Cloudinary output conversion
    # Convert RGB array back to standard BGR image array layout for OpenCV conversion
    cam_image_bgr = cv2.cvtColor((cam_image_overlay * 255).astype(np.uint8), cv2.COLOR_RGB2BGR)
    _, buffer = cv2.imencode('.jpg', cam_image_bgr)
    heatmap_bytes = buffer.tobytes()
    
    return {
        'prediction': prediction_class,
        'confidence': confidence_score,
        'probabilities': {'Normal': normal_prob, 'Pneumonia': pneumonia_prob},
        'heatmap_bytes': heatmap_bytes
    }
