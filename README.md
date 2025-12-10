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
├── schema/               # BOOST schemas (fetched from GitHub)
├── public/schemas/       # Processed schemas (generated at build)
├── scripts/              # Build scripts
└── index.html            # Entry point
```

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + DaisyUI
- Ajv (JSON Schema validation)

## Schema Management

The `schema/` directory contains a local copy of the BOOST schemas from [carbondirect/BOOST](https://github.com/carbondirect/BOOST). This copy is committed to the repository so no external dependencies are required at build time.

### Updating Schemas

To fetch the latest schemas from GitHub:

```bash
npm run fetch-schema
```

This downloads schemas from `carbondirect/BOOST` (branch: main, path: `drafts/current/schema`) and saves them to `./schema/`.

To update and rebuild in one step:

```bash
npm run update-schema
```

### How It Works

1. `npm run fetch-schema` - Downloads schemas from GitHub → `./schema/`
2. `npm run prepare-schemas` - Processes `./schema/` → `./public/schemas/` (runs automatically on dev/build)
3. The app loads schemas from `./public/schemas/` at runtime

## License

See [LICENSE](LICENSE) and [BOOST_ATTRIBUTION.md](BOOST_ATTRIBUTION.md).
