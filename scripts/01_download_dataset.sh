#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting dataset download pipeline..."

# Resolve the absolute path of the project root and dataset directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DATASET_DIR="$PROJECT_ROOT/dataset"

# Ensure the dataset directory exists
mkdir -p "$DATASET_DIR"

# Install Kaggle CLI if it is not already installed
if ! command -v kaggle &> /dev/null; then
    echo "📦 Installing Kaggle CLI..."
    pip install -q kaggle
fi

# Ensure the environment variable is set
if [ -z "$KAGGLE_API_TOKEN" ]; then
    echo "❌ ERROR: KAGGLE_API_TOKEN is not set."
    echo "Please run: export KAGGLE_API_TOKEN='your_token_here' before running this script."
    exit 1
fi

# Download and unzip
echo "📥 Downloading Chest X-Ray dataset from Kaggle..."
kaggle datasets download -d paultimothymooney/chest-xray-pneumonia -p "$DATASET_DIR"

echo "🗜️ Unzipping dataset..."
unzip -q "$DATASET_DIR/chest-xray-pneumonia.zip" -d "$DATASET_DIR"

echo "🧹 Cleaning up zip archive..."
rm "$DATASET_DIR/chest-xray-pneumonia.zip"

echo "✅ Dataset successfully downloaded and extracted to: $DATASET_DIR"
