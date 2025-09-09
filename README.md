# BOOST Schema Validator Frontend

A web-based interface for testing and validating BOOST entity schemas in real-time.

## Features

- 🌲 **Entity Selection**: Choose from all 36 BOOST entities
- 📝 **JSON Editor**: Built-in editor with syntax highlighting
- ✅ **Real-time Validation**: Instant schema and business rule validation  
- 📊 **Example Loading**: Load example data for each entity
- 🔍 **Schema Viewing**: Inspect entity schemas in a modal
- 🎨 **Responsive Design**: Works on desktop and mobile

## Quick Start (Docker)

1. **Build and Run**
   ```bash
   cd boost-validator-frontend
   ./run.sh
   ```

2. **Open Browser**
   Visit: http://localhost:5000

3. **Stop Service**
   ```bash
   docker-compose down  # or 'docker compose down' for newer Docker
   ```

## Alternative: Local Development

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the Server**
   ```bash
   cd backend
   python app.py
   ```

## Usage

1. **Select Entity**: Choose an entity from the dropdown (e.g., "TraceableUnit")
2. **Load Example**: Click "Load Example" to populate with sample data
3. **Edit Data**: Modify the JSON in the editor
4. **Validate**: Click "Validate" to test against schema and business rules
5. **View Results**: See validation results with detailed error messages

## API Endpoints

- `GET /api/entities` - List available entities
- `GET /api/entity/{name}/schema` - Get entity schema
- `GET /api/entity/{name}/example` - Get example data
- `POST /api/validate` - Validate entity data

## File Structure

```
boost-validator-frontend/
├── backend/
│   └── app.py              # Flask API server
├── templates/
│   └── index.html          # Main HTML page
├── static/
│   ├── css/
│   │   └── style.css       # Styling
│   └── js/
│       └── app.js          # Frontend JavaScript
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

## Validation Features

### Schema Validation
- JSON Schema compliance checking
- Required field validation
- Data type validation
- Pattern matching (IDs, formats)

### Business Rules Validation  
- JsonLogic rule engine
- Complex conditional validation
- Cross-field validation
- BOOST-specific business logic

### Results Display
- ✅ Success indicators
- ❌ Detailed error messages  
- 📊 Validation breakdown (schema vs business rules)
- 🔍 Error location highlighting

## Example Entities

The frontend loads examples for all BOOST entities:
- **TraceableUnit**: Core tracking entity with biometric identification
- **Organization**: Business entities in supply chain
- **GeographicData**: Spatial location data
- **MaterialProcessing**: Processing operations
- **Transaction**: Commercial exchanges
- And 31+ more entities

## Development

To modify the validator:

1. **Backend Changes**: Edit `backend/app.py` for API modifications
2. **Frontend Changes**: Edit `templates/index.html` and `static/` files
3. **Styling**: Modify `static/css/style.css` for appearance changes
4. **JavaScript**: Edit `static/js/app.js` for functionality changes

## Notes

- The validator connects to the main BOOST schema directory at `../drafts/current/schema`
- All validation uses the official BOOST JSON schemas and business rules
- Results are displayed in real-time with detailed error reporting
- The interface is designed for both developers and non-technical users