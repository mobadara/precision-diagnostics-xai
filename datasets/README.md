# 📂 Dataset Directory

This directory serves as the local storage for the **Kaggle Chest X-Ray (Pneumonia) Dataset**. 

To keep the repository lightweight and Git history clean, the raw image files are **not** committed to version control. Instead, the dataset is downloaded programmatically via our automated data ingestion pipeline.

## 🚀 How to Download the Data

Do not manually download or extract the data. Use the provided bash script to ensure the data is formatted and placed correctly for the PyTorch training notebooks.

### Prerequisites
You must have your Kaggle API Token configured. You can either set it as a Colab Secret or export it to your local terminal:
```bash
export KAGGLE_API_TOKEN="your_token_here"
```
### Execution

From the root of the project, grant execution permissions and run the download script:
Bash

```bash
chmod +x scripts/01_download_dataset.sh
./scripts/01_download_dataset.sh
```

### 📁 Post-Download Structure

Once the script completes, this directory will automatically populate with the following structure:
Plaintext

```text
dataset/
├── chest_xray_data/
│   ├── train/          # Training images (NORMAL & PNEUMONIA)
│   ├── val/            # Validation images
│   └── test/           # Testing images
└── README.md
```

⚠️ Important: Ensure that dataset/chest_xray_data/ is included in your project's .gitignore file to prevent pushing large image files to GitHub.


### The Quick Git Fix
Since we just mentioned it in the README, take five seconds right now to make sure your `.gitignore` file at the root of your project has this line in it:

```text
dataset/chest_xray_data/
```
