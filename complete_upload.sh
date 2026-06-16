#!/bin/bash

cd ~/ultimatecareerguide

echo "🚀 Ultimate Career Guide - School Data Upload"
echo "=============================================="

# Install packages
echo "📦 Installing required packages..."
pip3 install --user --quiet supabase pandas openpyxl

# Check if upload script exists
if [ ! -f "upload_schools.py" ]; then
    echo "❌ upload_schools.py not found!"
    echo "Creating template..."
    cat > upload_schools.py << 'PYEND'
import pandas as pd
from supabase import create_client
from pathlib import Path

# Update these with your Supabase credentials
SUPABASE_URL = "https://YOUR_PROJECT.supabase.co"
SUPABASE_KEY = "YOUR_SERVICE_ROLE_KEY"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def upload_files():
    excel_dir = Path("excel_files")
    if not excel_dir.exists():
        print(f"❌ Create '{excel_dir}' folder and add your Excel files")
        return
    
    files = list(excel_dir.glob("*.xlsx"))
    if not files:
        print(f"❌ No .xlsx files found in {excel_dir}")
        return
    
    for file_path in files:
        print(f"\n📖 Processing: {file_path.name}")
        df = pd.read_excel(file_path)
        records = df.to_dict('records')
        
        for i in range(0, len(records), 100):
            batch = records[i:i+100]
            supabase.table('rsa_schools').upsert(batch, on_conflict='nat_emis').execute()
            print(f"  ✅ Uploaded batch {i//100 + 1}/{(len(records)+99)//100}")
        
        print(f"  ✅ Completed {file_path.name}")
    
    print("\n🎉 All files uploaded!")

if __name__ == "__main__":
    upload_files()
PYEND
    echo "✅ Template created. Edit upload_schools.py with your Supabase credentials"
    exit 1
fi

# Run the upload
echo "🚀 Starting upload..."
python3 upload_schools.py
