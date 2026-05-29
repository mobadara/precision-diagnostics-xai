# **🫁 Precision Diagnostics: AI-Powered Chest X-Ray Analysis & Explainability Engine**

An end-to-end MLOps pipeline designed to analyze chest X-ray images for pediatric pneumonia detection with high clinical sensitivity. The system features a deep learning classification engine, an automated hyperparameter optimization suite, a **FastAPI** backend, and a **React** frontend dashboard. To assist clinical workflows, it integrates **Grad-CAM (Gradient-weighted Class Activation Mapping)** to visualize precisely where the model focuses its diagnostic attention.

---

## 🏗️ System Architecture & Model Workflow

The architecture is split into three decoupled components to maintain high performance, modularity, and easy software updates:

1. **The Core AI Brain:** A fine-tuned `DenseNet121` model trained with class-balanced cross-entropy loss and hyperparameter-tuned via **Optuna**.
2. **The Inference Backend (FastAPI):** Exposes a REST API (`/predict`) that automatically downloads optimized model weights from cloud storage on startup, processes incoming images, and generates explainability layers.
3. **The User Interface (React):** A clinical dashboard for uploading X-rays, viewing diagnosis metrics, and rendering interactive Grad-CAM heatmaps.

---

## 📦 Model Weights Storage (Large File Notice)

Deep Learning model binaries (`.pth` files) exceed standard Git tracking limits (>25MB). To follow MLOps best practices, **model weights are hosted externally** and are decoupled from the code repository. 

The baseline model weights (**v1.0.0**) can be retrieved through two separate cloud channels:

| Platform | Repository / Resource URL | Primary Use Case |
| :--- | :--- | :--- |
| **Hugging Face Hub** | [`mobadara/pneumonia-densenet121`](https://huggingface.co/mobadara/pneumonia-densenet121) | Production & Automated FastAPI Startup (Recommended) |
| **GitHub Releases** | [Precision Diagnostics v1.0.0 Release](https://github.com/mobadara/precision-diagnostics-xai/releases/tag/v1.0.0) | Manual Local Testing & Containment Backups |

### Model Metrics Snapshot (v1.0.0)
* **Architecture:** DenseNet121 with custom 2-class fully connected classification head.
* **Global Accuracy:** 86.4% on a fully unseen test dataset.
* **Pneumonia Recall (Sensitivity):** **94.6%** (Successfully flagged 369 out of 390 positive pathology samples). The training loss incorporates dynamic weights to minimize critical False Negatives.

---
