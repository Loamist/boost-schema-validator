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
    
    def get_entity_examples(self, entity_name: str) -> List[Dict[str, Any]]:
        """Load all available example files for an entity"""
        entity_dir = ''.join(['_' + c.lower() if c.isupper() and i > 0 else c.lower()
                             for i, c in enumerate(entity_name)])

        entity_path = self.schema_root / entity_dir
        examples = []

        if entity_path.exists():
            # Find all JSON files that aren't the schema
            for json_file in entity_path.glob("*.json"):
                if json_file.stem != "validation_schema":
                    with open(json_file, 'r') as f:
                        example_data = json.load(f)
                        examples.append({
                            "name": self._format_example_name(json_file.stem, entity_dir),
                            "filename": json_file.stem,
                            "data": example_data
                        })

        return examples

    def _format_example_name(self, filename: str, entity_prefix: str) -> str:
        """Format example filename to user-friendly name"""
        # Remove entity prefix
        name = filename.replace(f"{entity_prefix}_", "")

        # Special formatting for known suffixes
        name_map = {
            "example": "Standard Example",
            "carb_minimal": "CARB Minimal (Required Fields Only)",
            "afp_example": "AFP Submission Example",
            "marathon_q2_2025": "Marathon Q2 2025"
        }

        return name_map.get(name, name.replace('_', ' ').title())

    def get_entity_example(self, entity_name: str, example_name: str = None) -> Dict[str, Any]:
        """Load example data for an entity (supports specific example selection)"""
        entity_dir = ''.join(['_' + c.lower() if c.isupper() and i > 0 else c.lower()
                             for i, c in enumerate(entity_name)])

        # If specific example requested, load that
        if example_name:
            example_file = self.schema_root / entity_dir / f"{example_name}.json"
            if example_file.exists():
                with open(example_file, 'r') as f:
                    return json.load(f)

        # Otherwise load default example
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
    
    def _format_validation_error(self, error: jsonschema.ValidationError) -> Dict[str, Any]:
        """Format a jsonschema ValidationError into a user-friendly message with type"""
        # Extract the field path
        field_path = '.'.join(str(p) for p in error.absolute_path) if error.absolute_path else 'root'

        # Get the validation type
        validator = error.validator

        # Get the actual value that caused the error (if available)
        actual_value = error.instance if hasattr(error, 'instance') else None

        # Format the error message based on validator type
        if validator == 'required':
            # Extract the missing property name from the message
            missing_prop = error.message.replace("'", "").replace(" is a required property", "").strip()
            if field_path == 'root':
                message = f"Missing required field: '{missing_prop}'"
            else:
                message = f"Missing required field: '{missing_prop}' in {field_path}"
            return {
                "type": "required",
                "field": missing_prop,
                "message": message
            }

        elif validator == 'type':
            expected_type = error.validator_value
            if field_path == 'root':
                message = f"Invalid type: expected {expected_type}"
            else:
                message = f"Field '{field_path}': expected type {expected_type}"
            return {
                "type": "type",
                "field": field_path,
                "message": message,
                "expected": expected_type,
                "actual_value": actual_value
            }

        elif validator == 'enum':
            allowed_values = ', '.join(f"'{v}'" for v in error.validator_value)
            if field_path == 'root':
                message = f"Value must be one of: {allowed_values}"
            else:
                message = f"Field '{field_path}': value must be one of: {allowed_values}"
            return {
                "type": "enum",
                "field": field_path,
                "message": message,
                "allowed_values": error.validator_value,
                "actual_value": actual_value
            }

        elif validator == 'pattern':
            pattern = error.validator_value
            message = f"Field '{field_path}': value does not match required pattern '{pattern}'"
            return {
                "type": "pattern",
                "field": field_path,
                "message": message,
                "pattern": pattern,
                "actual_value": actual_value
            }

        elif validator in ['minLength', 'maxLength', 'minimum', 'maximum']:
            constraint_value = error.validator_value
            if validator == 'minLength':
                message = f"Field '{field_path}': must be at least {constraint_value} characters long"
            elif validator == 'maxLength':
                message = f"Field '{field_path}': must be at most {constraint_value} characters long"
            elif validator == 'minimum':
                message = f"Field '{field_path}': value must be at least {constraint_value}"
            else:  # maximum
                message = f"Field '{field_path}': value must be at most {constraint_value}"

            return {
                "type": "constraint",
                "field": field_path,
                "message": message,
                "constraint": validator,
                "value": constraint_value
            }

        elif validator == 'format':
            expected_format = error.validator_value
            message = f"Field '{field_path}': must be a valid {expected_format}"
            return {
                "type": "format",
                "field": field_path,
                "message": message,
                "expected_format": expected_format
            }

        else:
            # For other validators, use the original message but without the schema dump
            # Just extract the first line which usually contains the actual error
            message_lines = error.message.split('\n')
            clean_message = message_lines[0] if message_lines else error.message
            if field_path == 'root':
                message = f"{clean_message}"
            else:
                message = f"Field '{field_path}': {clean_message}"

            return {
                "type": "other",
                "field": field_path if field_path != 'root' else None,
                "message": message
            }

    def validate_entity(self, entity_name: str, test_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate test data against entity schema"""
        try:
            schema = self.load_entity_schema(entity_name)

            # Create a validator instance to collect ALL errors (not just the first one)
            validator_class = jsonschema.Draft7Validator
            validator = validator_class(schema)

            # Collect all validation errors
            validation_errors = list(validator.iter_errors(test_data))

            if validation_errors:
                # Format all errors and group by type
                all_errors = []
                errors_by_type = {
                    "required": [],
                    "format": [],
                    "pattern": [],
                    "enum": [],
                    "type": [],
                    "constraint": [],
                    "other": []
                }

                for error in validation_errors:
                    formatted_error = self._format_validation_error(error)
                    all_errors.append(formatted_error)

                    # Group by type
                    error_type = formatted_error.get("type", "other")
                    if error_type in errors_by_type:
                        errors_by_type[error_type].append(formatted_error)
                    else:
                        errors_by_type["other"].append(formatted_error)

                return {
                    "valid": False,
                    "schema_valid": False,
                    "business_rules_valid": False,
                    "errors": all_errors,
                    "errors_by_type": errors_by_type,
                    "message": "Schema validation failed"
                }

            # If schema validation passed, check business rules
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
if os.path.exists("/app/schema"):
    SCHEMA_ROOT = "/app/schema"
elif os.path.exists("../BOOST/schema"):
    SCHEMA_ROOT = "../BOOST/schema"
else:
    SCHEMA_ROOT = "../schema"
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

@app.route('/api/entity/<entity_name>/examples')
def get_entity_examples_list(entity_name):
    """Get list of available examples for a specific entity"""
    try:
        examples = validator.get_entity_examples(entity_name)
        return jsonify(examples)
    except Exception as e:
        return jsonify({"error": str(e)}), 404

@app.route('/api/entity/<entity_name>/example')
@app.route('/api/entity/<entity_name>/example/<example_name>')
def get_entity_example_route(entity_name, example_name=None):
    """Get example data for a specific entity (optionally by example name)"""
    try:
        example = validator.get_entity_example(entity_name, example_name)
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
    port = int(os.environ.get('PORT', 5001))
    print("🚀 Starting BOOST Schema Validation Web Interface")
    print(f"Schema root: {SCHEMA_ROOT}")
    print(f"Visit: http://localhost:{port}")
    app.run(debug=True, host='0.0.0.0', port=port)