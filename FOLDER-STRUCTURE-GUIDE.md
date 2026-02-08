# Hacker News Scraper - Folder Structure Guide

## Exact Folder Structure for GitHub

When uploading to GitHub, recreate this exact structure:

```
hacker-news-lead-scraper/           (repository root)
│
├── .actor/
│   └── actor.json                  (Apify metadata)
│
├── src/
│   ├── __init__.py                 (Python package marker)
│   └── main.py                     (Main scraper code)
│
├── Dockerfile                      (Tells Apify how to build)
├── requirements.txt                (Python dependencies)
├── INPUT_SCHEMA.json              (Input configuration UI)
└── README.md                       (Documentation)
```

## File Descriptions

### Core Files (Required)

**src/main.py**
- Main scraper logic
- HN API integration
- Founder detection
- Pain point extraction
- ~300 lines of Python code

**Dockerfile**
- Tells Apify how to build the actor
- Installs Python 3.11
- Installs dependencies
- Runs main.py

**requirements.txt**
- Python package dependencies
- apify==1.6.3 (Apify SDK)
- requests==2.31.0 (HTTP library)

**INPUT_SCHEMA.json**
- Defines input fields in Apify UI
- Search queries
- Search type
- Max results
- Days back

**.actor/actor.json**
- Apify actor metadata
- Name, description, version
- Links to other files

### Documentation (Optional but Recommended)

**README.md**
- Usage instructions
- Setup guide
- Examples
- Troubleshooting

**src/__init__.py**
- Empty file (or minimal)
- Makes src/ a Python package
- Required for Python imports

## How to Upload to GitHub

### Method 1: Web Interface (Easiest)

1. Download all 7 files from the links above
2. Go to your GitHub repository
3. Click "Add file" → "Upload files"
4. Drag all 7 files maintaining folder structure
   - Create `.actor` folder, upload `actor.json` into it
   - Create `src` folder, upload `main.py` and `__init__.py` into it
   - Upload root files: Dockerfile, requirements.txt, INPUT_SCHEMA.json, README.md

### Method 2: GitHub Desktop (Medium)

1. Download GitHub Desktop
2. Clone your repository
3. Copy all 7 files into the local folder (maintaining structure)
4. Commit and push

### Method 3: Command Line (Advanced)

```bash
# Clone your repo
git clone https://github.com/YOUR_USERNAME/hacker-news-lead-scraper.git
cd hacker-news-lead-scraper

# Create folder structure
mkdir -p .actor src

# Copy files (from wherever you downloaded them)
cp /path/to/downloads/actor.json .actor/
cp /path/to/downloads/main.py src/
cp /path/to/downloads/__init__.py src/
cp /path/to/downloads/Dockerfile .
cp /path/to/downloads/requirements.txt .
cp /path/to/downloads/INPUT_SCHEMA.json .
cp /path/to/downloads/README.md .

# Commit and push
git add .
git commit -m "Initial commit - Hacker News lead scraper"
git push origin main
```

## Verification Checklist

After uploading, your GitHub repository should show:

```
✅ .actor/actor.json
✅ src/main.py
✅ src/__init__.py
✅ Dockerfile
✅ requirements.txt
✅ INPUT_SCHEMA.json
✅ README.md
```

**Total: 7 files in 3 locations (root, .actor/, src/)**

If all 7 are present, you're ready to connect to Apify!

## Common Upload Mistakes

❌ **Wrong folder structure**
- Don't put everything in one folder
- Don't create extra nested folders
- Must match the structure exactly

❌ **Missing files**
- All 7 files are required
- Apify won't build without them

❌ **Wrong file names**
- Names are case-sensitive
- `main.py` not `Main.py`
- `Dockerfile` not `dockerfile`

❌ **Files in wrong location**
- `actor.json` must be in `.actor/` folder
- `main.py` must be in `src/` folder

## Quick Test

After uploading to GitHub, check:

1. Can you see all 7 files in GitHub web interface?
2. Does the folder structure match the diagram above?
3. Can you click on each file and see its contents?

If yes to all → Ready to deploy to Apify!

## Next Step

Once uploaded to GitHub correctly:
→ Go to Step 3 in HN-SETUP-GUIDE.md
→ Create Apify account and connect to GitHub
