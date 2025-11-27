export default function Header() {
  return (
    <header className="mb-8 text-center py-8 px-6 rounded-xl shadow-lg" style={{ background: 'linear-gradient(135deg, #2d5a27 0%, #4a7c59 100%)' }}>
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
        BOOST Schema Validator
      </h1>
      <p className="text-lg text-white/90">
        Test and validate BOOST entity schemas with real-time feedback
      </p>
    </header>
  )
}
