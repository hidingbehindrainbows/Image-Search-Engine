# Image Search Recommendation Engine

A natural language search recommendation engine for images and collections using the Unsplash API. Users can describe what they're looking for in natural language, and the system will return the most relevant images or collections based on label and description matching.

## Features

- Natural language search for images and collections
- Toggle between image search (100 results) and collection search (20 results)
- Results ranked by convergence score (overlap between search terms and image metadata)
- Modern web interface with responsive design
- Integration with Unsplash API
- Image metadata display (photographer, date, likes, etc.)
- Collection previews and statistics

## Prerequisites

- Python 3.11 or newer
- Node.js 16 or newer
- npm or yarn
- Unsplash API key (get one at https://unsplash.com/developers)

## Project Structure

```
.
├── backend/           # FastAPI backend
│   ├── app/          # Application code
│   ├── tests/        # Test files
│   └── requirements.txt
├── frontend/         # React frontend
│   ├── public/       # Static files
│   ├── src/          # Source code
│   └── package.json
├── .gitignore
├── .env              # Environment variables
└── README.md
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <https://github.com/hidingbehindrainbows/Image-Search-Engine.git>
```

### 2. Backend Setup

a. Create and activate a Python virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

b. Install dependencies:
```bash
pip install -r requirements.txt
```

c. Create a .env file in the backend directory:
```bash
echo "UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here" > .env
```
Replace `your_unsplash_access_key_here` with your actual Unsplash API key.

d. Download NLTK data (in Python shell):
```python
import nltk
nltk.download('punkt')
nltk.download('stopwords')
```

### 3. Frontend Setup

a. Install dependencies:
```bash
cd frontend
npm install
```

### 4. Running the Application

1. Start the backend server (from the backend directory):
```bash
uvicorn app.main:app --reload
```
The API will be available at http://localhost:8000

2. Start the frontend development server (from the frontend directory):
```bash
npm start
```
The application will be available at http://localhost:3000

## API Endpoints

- `POST /api/search/images` - Search for images
  - Request body: `{ "query": "search terms", "search_type": "images" }`
  - Returns up to 100 images sorted by relevance

- `POST /api/search/collections` - Search for collections
  - Request body: `{ "query": "search terms", "search_type": "collections" }`
  - Returns up to 20 collections sorted by relevance

- `GET /api/images/{id}` - Get image details
- `GET /api/collections/{id}` - Get collection details

## How It Works

The search algorithm uses a combination of:
1. Unsplash API search for initial results
2. Text preprocessing (tokenization, stop word removal)
3. Jaccard similarity scoring between query and image metadata
4. Custom ranking based on metadata overlap

## Development

### Backend Development

- FastAPI for the REST API
- NLTK for text processing
- Pydantic for data validation
- Python-dotenv for environment variables

### Frontend Development

- React for UI components
- Material-UI for styling
- Axios for API requests
- React Router for navigation

## Troubleshooting

1. If you get ModuleNotFoundError:
   ```bash
   pip install --upgrade pip setuptools wheel
   pip install -r requirements.txt
   ```

2. If Unsplash API key is not found:
   - Make sure you have created the .env file in the backend directory
   - Verify the API key is correct
   - Restart the backend server

3. If frontend can't connect to backend:
   - Verify the backend is running on http://localhost:8000
   - Check for CORS issues in the browser console
   - Verify API_BASE_URL in frontend code

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Environment Setup

### Backend Environment Variables
1. Create a `.env` file in the `backend` directory:
```bash
cd backend
touch .env
```

2. Add your Unsplash API key to the `.env` file:
```bash
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```

To get an Unsplash API key:
1. Go to https://unsplash.com/developers
2. Sign up for a developer account
3. Create a new application
4. Copy your Access Key
5. Paste it in the `.env` file

⚠️ IMPORTANT:
- Never commit your `.env` file to git (it's already in .gitignore)
- Keep your API keys private
- If you accidentally commit your API key, invalidate it immediately and generate a new one 