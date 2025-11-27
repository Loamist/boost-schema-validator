export default function Footer() {
  return (
    <footer className="mt-12 pb-8">
      <div className="divider"></div>
      <div className="text-center space-y-3 text-sm">
        <p className="font-semibold text-primary">
          <strong>BOOST (Biomass Open Origin Standard for Tracking)</strong> - Schema Validation Tool
        </p>
        <p className="text-base-content/70">
          Built using schemas from the{' '}
          <a href="https://github.com/carbondirect/BOOST" target="_blank" rel="noopener noreferrer" className="link link-primary">
            BOOST Standard
          </a>{' '}
          by the{' '}
          <a href="https://www.w3.org/community/boost-01/" target="_blank" rel="noopener noreferrer" className="link link-primary">
            W3C BOOST Community Group
          </a>{' '}
          | Licensed under{' '}
          <a href="https://www.w3.org/copyright/software-license/" target="_blank" rel="noopener noreferrer" className="link link-primary">
            W3C Software License
          </a>
        </p>
        <p className="text-base-content/50 italic text-xs">
          Standalone validation tool - not the official BOOST repository
        </p>
      </div>
    </footer>
  )
}
