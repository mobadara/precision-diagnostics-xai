---
title: Precision Diagnostics API
emoji: 🫁
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 8000
pinned: false
license: apache-2.0
---

# 🫁 Precision Diagnostics Backend (FastAPI)

This Space hosts the FastAPI inference engine for the Precision Diagnostics AI system. 

It handles:
1. Receiving Chest X-Rays from the frontend dashboard.
2. Running inference via a fine-tuned DenseNet121 architecture.
3. Generating Grad-CAM explainability heatmaps.
4. Interfacing with MongoDB and Cloudinary.

## Infrastructure
This Space is built using a custom `Dockerfile` running Python 3.11-slim and Uvicorn.