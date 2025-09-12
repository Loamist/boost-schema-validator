#!/usr/bin/env python3
"""
BOOST Schema Validation Web API
Flask backend for testing BOOST entity schemas through a web interface
"""

import json
import jsonschema
import os
import re
from pathlib import Path
from typing import Dict, List, Any, Tuple, Optional
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
# import json_logic  # Temporarily disabled - will implement business rules later

app = Flask(__name__, template_folder='../templates', static_folder='../static')
CORS(app)

class BOOSTWebValidator:
    def __init__(self, schema_root: str):
        self.schema_root = Path(schema_root)
        
    def get_available_entities(self) -> List[str]:
        """Get list of available entity schemas"""
        entities = []
        if self.schema_root.exists():
            for item in self.schema_root.iterdir():
                if item.is_dir() and (item / "validation_schema.json").exists():
                    # Convert directory name to entity name (traceable_unit -> TraceableUnit)
                    entity_name = ''.join(word.capitalize() for word in item.name.split('_'))
                    entities.append(entity_name)
        return sorted(entities)
    
    def load_entity_schema(self, entity_name: str) -> Dict[str, Any]:
        """Load JSON schema for a specific entity"""
        # Convert entity name to directory format
        entity_dir = ''.join(['_' + c.lower() if c.isupper() and i > 0 else c.lower() 
                             for i, c in enumerate(entity_name)])
        
        schema_file = self.schema_root / entity_dir / "validation_schema.json"
        
        if not schema_file.exists():
            raise FileNotFoundError(f"Schema file not found: {schema_file}")
            
        with open(schema_file, 'r') as f:
            schema_data = json.load(f)
            return schema_data.get('schema', schema_data)
    
    def get_entity_example(self, entity_name: str) -> Dict[str, Any]:
        """Load example data for an entity"""
        entity_dir = ''.join(['_' + c.lower() if c.isupper() and i > 0 else c.lower() 
                             for i, c in enumerate(entity_name)])
        
        example_file = self.schema_root / entity_dir / f"{entity_dir}_example.json"
        
        if example_file.exists():
            with open(example_file, 'r') as f:
                return json.load(f)
        return {}
    
    def get_entity_dictionary(self, entity_name: str) -> Dict[str, Any]:
        """Load and parse entity dictionary file"""
        entity_dir = ''.join(['_' + c.lower() if c.isupper() and i > 0 else c.lower() 
                             for i, c in enumerate(entity_name)])
        
        dictionary_file = self.schema_root / entity_dir / f"{entity_dir}_dictionary.md"
        
        if not dictionary_file.exists():
            return {"error": f"Dictionary file not found: {dictionary_file}"}
        
        try:
            with open(dictionary_file, 'r', encoding='utf-8') as f:
                content = f.read()
                return self._parse_dictionary_markdown(content)
        except Exception as e:
            return {"error": f"Error reading dictionary: {str(e)}"}
    
    def _parse_dictionary_markdown(self, content: str) -> Dict[str, Any]:
        """Parse dictionary markdown into structured data"""
        lines = content.split('\n')
        
        # Extract entity overview
        overview = ""
        in_overview = False
        
        # Dictionary to store field information
        fields = {}
        in_table = False
        table_headers = []
        
        for i, line in enumerate(lines):
            # Extract overview section
            if line.strip() == "### Overview":
                in_overview = True
                continue
            elif line.startswith("###") and in_overview:
                in_overview = False
            elif in_overview and line.strip():
                overview += line.strip() + " "
            
            # Parse field table
            if "<table class=\"data\">" in line:
                in_table = True
                continue
            elif "</table>" in line:
                in_table = False
                continue
                
            if in_table and line.strip().startswith("<th>"):
                # Extract table headers
                header_match = re.findall(r'<th>([^<]+)', line)
                table_headers.extend(header_match)
                
            elif in_table and line.strip().startswith("<tr>"):
                # Start of a field row
                field_data = []
                j = i + 1
                while j < len(lines) and not lines[j].strip().startswith("</tr>"):
                    if lines[j].strip().startswith("<td>"):
                        # Extract cell content, handle both simple and complex content
                        cell_match = re.search(r'<td>([^<]+)', lines[j])
                        if cell_match:
                            cell_content = cell_match.group(1).strip()
                            # Remove markdown backticks from field names
                            cell_content = cell_content.replace('`', '')
                            field_data.append(cell_content)
                    j += 1
                
                # Store field information if we have enough data
                if len(field_data) >= 4:
                    field_name = field_data[0]
                    field_type = field_data[1]
                    is_required = field_data[2].lower() in ['yes', 'required', 'true']
                    description = field_data[3]
                    examples = field_data[4] if len(field_data) > 4 else ""
                    
                    fields[field_name] = {
                        "type": field_type,
                        "required": is_required,
                        "description": description,
                        "examples": examples
                    }
        
        return {
            "overview": overview.strip(),
            "fields": fields
        }
    
    def validate_entity(self, entity_name: str, test_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate test data against entity schema"""
        try:
            schema = self.load_entity_schema(entity_name)
            
            # Validate against JSON schema
            jsonschema.validate(test_data, schema)
            
            # Business rules validation (temporarily simplified)
            business_rules_valid = True
            business_errors = []
            
            # TODO: Implement json-logic business rules validation
            # For now, we'll do basic validation checks
            schema_file = self.schema_root / ''.join(['_' + c.lower() if c.isupper() and i > 0 else c.lower() 
                                                   for i, c in enumerate(entity_name)]) / "validation_schema.json"
            
            try:
                with open(schema_file, 'r') as f:
                    full_schema = json.load(f)
                    rules = full_schema.get('rules')
                    
                    if rules:
                        # Simple validation: check if required fields are present and not empty
                        required_fields = schema.get('required', [])
                        for field in required_fields:
                            if field not in test_data or test_data[field] is None or test_data[field] == "":
                                business_rules_valid = False
                                business_errors.append(f"Required field '{field}' is missing or empty")
                        
                        # Additional basic checks can be added here
                        business_errors.append("Note: Advanced business rule validation temporarily disabled")
            except Exception as e:
                business_errors.append(f"Business rule check error: {str(e)}")
            
            return {
                "valid": True,
                "schema_valid": True,
                "business_rules_valid": business_rules_valid,
                "errors": business_errors,
                "message": "Validation successful" if business_rules_valid else "Schema valid but business rules failed"
            }
            
        except jsonschema.ValidationError as e:
            return {
                "valid": False,
                "schema_valid": False,
                "business_rules_valid": False,
                "errors": [str(e)],
                "message": "Schema validation failed"
            }
        except FileNotFoundError as e:
            return {
                "valid": False,
                "schema_valid": False,
                "business_rules_valid": False,
                "errors": [f"Schema not found: {str(e)}"],
                "message": "Schema file not found"
            }
        except Exception as e:
            return {
                "valid": False,
                "schema_valid": False,
                "business_rules_valid": False,
                "errors": [f"Validation error: {str(e)}"],
                "message": "Validation error"
            }

# Initialize validator with schema path
# Check if running in Docker (schema mounted at /app/schema)
SCHEMA_ROOT = "/app/schema" if os.path.exists("/app/schema") else "../schema"
validator = BOOSTWebValidator(SCHEMA_ROOT)

@app.route('/')
def index():
    """Main page"""
    return render_template('index.html')

@app.route('/api/entities')
def get_entities():
    """Get list of available entities"""
    try:
        entities = validator.get_available_entities()
        return jsonify({"entities": entities})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/entity/<entity_name>/schema')
def get_entity_schema(entity_name):
    """Get schema for a specific entity"""
    try:
        schema = validator.load_entity_schema(entity_name)
        return jsonify(schema)
    except Exception as e:
        return jsonify({"error": str(e)}), 404

@app.route('/api/entity/<entity_name>/example')
def get_entity_example(entity_name):
    """Get example data for a specific entity"""
    try:
        example = validator.get_entity_example(entity_name)
        return jsonify(example)
    except Exception as e:
        return jsonify({"error": str(e)}), 404

@app.route('/api/entity/<entity_name>/dictionary')
def get_entity_dictionary(entity_name):
    """Get dictionary data for a specific entity"""
    try:
        dictionary = validator.get_entity_dictionary(entity_name)
        return jsonify(dictionary)
    except Exception as e:
        return jsonify({"error": str(e)}), 404

@app.route('/api/validate', methods=['POST'])
def validate_entity():
    """Validate entity data"""
    try:
        data = request.get_json()
        entity_name = data.get('entity_name')
        test_data = data.get('test_data')
        
        if not entity_name or not test_data:
            return jsonify({"error": "Missing entity_name or test_data"}), 400
        
        result = validator.validate_entity(entity_name, test_data)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting BOOST Schema Validation Web Interface")
    print(f"Schema root: {SCHEMA_ROOT}")
    print("Visit: http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)