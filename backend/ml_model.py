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

    
    