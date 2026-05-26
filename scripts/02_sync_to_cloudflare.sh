#!/bin/bash
set -e

echo "☁️ Starting Cloudflare R2 sync pipeline..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DATASET_DIR="$PROJECT_ROOT/dataset"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Installing via pip..."
    pip install -q awscli
fi

# Ensure required cloud environment variables are set
if [ -z "$R2_ACCOUNT_ID" ] || [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "❌ ERROR: Missing Cloudflare R2 credentials."
    echo "Ensure R2_ACCOUNT_ID, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY are exported."
    exit 1
fi

BUCKET_NAME="medical-scans"
ENDPOINT_URL="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"

echo "🔄 Syncing local dataset to Cloudflare R2 bucket: $BUCKET_NAME..."

# Execute the S3 sync command targeting the custom Cloudflare endpoint
aws s3 sync "$DATASET_DIR/" "s3://$BUCKET_NAME/chest_xray_data/" \
    --endpoint-url "$ENDPOINT_URL" \
    --region auto

echo "✅ Sync complete! Data is now securely backed up in Cloudflare R2."
