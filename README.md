# BOOST Schema Validator

A web application for validating BOOST entity schemas with LCFS compliance tracking.

## Features

- **Entity Selection**: Choose from 36 BOOST entities with example data
- **Real-time Validation**: Instant JSON Schema validation with detailed error reporting
- **LCFS Compliance**: Dual status display showing LCFS (CARB) compliance vs BOOST schema validity
- **Data Gap Analysis**: Side-by-side comparison of AFP requirements vs BOOST enhancements
- **Multiple Views**: Field table, plain text summary, and raw JSON views

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173

## Build for Production

```bash
npm run build
```

Output goes to `dist/` folder - ready for static hosting.

## Project Structure

```
├── src/
│   ├── components/       # React components
│   ├── services/         # Schema loading & validation
│   ├── utils/            # Formatting & helper functions
│   └── types/            # TypeScript definitions
├── public/schemas/       # BOOST schemas (generated at build)
├── scripts/              # Build scripts
└── index.html            # Entry point
```

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + DaisyUI
- Ajv (JSON Schema validation)

## Schema Source

Schemas are loaded from the BOOST schema repository at build time. Set the `BOOST_SCHEMA_PATH` environment variable to customize the source location.

## License

See [LICENSE](LICENSE) and [BOOST_ATTRIBUTION.md](BOOST_ATTRIBUTION.md).
