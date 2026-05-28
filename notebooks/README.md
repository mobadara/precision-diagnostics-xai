# 📓 **Notebooks Directory**
![Google Colab](https://img.shields.io/badge/Google_Colab-F9AB00?style=for-the-badge&logo=googlecolab&color=525252)


This directory contains the core machine learning experiments, including Exploratory Data Analysis (EDA) and the PyTorch DenseNet121 fine-tuning pipeline.

**⚠️ Prerequisite:** Before executing these notebooks, you must download the 2GB Kaggle Chest X-Ray dataset into the project workspace. Because we use Google Colab for GPU training, follow the instructions below to ingest the data directly into your active Colab session.

---

## 🔑 **Step 1: Obtain Your Kaggle API Token**

To download the dataset programmatically, you need a personal Kaggle authentication token:
1. Log in to your account at [Kaggle.com](https://www.kaggle.com/).
2. Click your **Profile Picture** in the top right corner and select **Settings**.
3. Scroll down to the **API** section.
4. Click **Create New Token**. 
5. Copy the generated token string (it will look something like `KGAT_...`). Treat this string like a password.

---

## 📥 **Step 2: Ingest Data**
### a. Via Colab Terminal (Single Command)**

Google Colab now provides free terminal access. You can download, extract, and clean up the entire dataset by copying and pasting a single chained command.

1. On the far left sidebar of your Colab interface, click the **Terminal icon** (`>_`).
2. Copy the following block of code.
3. **Replace `"your_actual_token_here"`** with your real Kaggle token.
4. Paste it into the Colab terminal and press Enter:

```bash
export KAGGLE_API_TOKEN="your_actual_token_here" && pip install -q kaggle && mkdir -p ../dataset && kaggle datasets download -d paultimothymooney/chest-xray-pneumonia -p ../dataset && unzip -q ../dataset/chest-xray-pneumonia.zip -d ../dataset && rm ../dataset/chest-xray-pneumonia.zip && echo "✅ Dataset successfully downloaded and extracted!"
```
### b. Local Shell (e.g. Ubuntu)
Run the following command from the project's root directory.
```bash
chmod +x scripts/01_download_dataset.sh
./scripts/01_download_dataset.sh
```
