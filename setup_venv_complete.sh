#!/bin/bash

echo "🚀 Setting up Python Virtual Environment"
echo "========================================"

# Install python3-venv if not present
if ! dpkg -l | grep -q python3.12-venv; then
    echo "📦 Installing python3-venv..."
    sudo apt update
    sudo apt install -y python3.12-venv
fi

# Navigate to project
cd ~/ultimatecareerguide

# Remove old venv if exists
if [ -d "venv" ]; then
    echo "🗑️  Removing old virtual environment..."
    rm -rf venv
fi

# Create new virtual environment
echo "📦 Creating virtual environment..."
python3.12 -m venv venv

# Activate virtual environment
echo "🔓 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install packages
echo "📥 Installing required packages..."
pip install supabase pandas openpyxl

# Verify installation
echo "✅ Verifying installations..."
python -c "import supabase; import pandas; import openpyxl; print('All packages installed successfully!')"

echo ""
echo "🎉 Setup complete!"
echo "📝 Virtual environment is now active"
echo ""
echo "To run your upload script:"
echo "  python upload_schools.py"
echo ""
echo "To deactivate when done:"
echo "  deactivate"
