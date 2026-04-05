import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-primary text-white/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-3">GobiernoCR</h3>
            <p className="text-sm">
              Plataforma de transparencia del Estado costarricense. Datos
              abiertos, actualizados y accesibles para todos los ciudadanos.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Secciones</h3>
            <ul className="space-y-1 text-sm">
              <li><Link href="/gobierno" className="hover:text-white transition-colors">Estructura del Gobierno</Link></li>
              <li><Link href="/presupuesto" className="hover:text-white transition-colors">Presupuesto</Link></li>
              <li><Link href="/asamblea" className="hover:text-white transition-colors">Asamblea Legislativa</Link></li>
              <li><Link href="/contrataciones" className="hover:text-white transition-colors">Contrataciones</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Fuentes de Datos</h3>
            <ul className="space-y-1 text-sm">
              <li><a href="https://datosabiertos.gob.go.cr" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Portal de Datos Abiertos</a></li>
              <li><a href="https://www.cgr.go.cr" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Contraloría General</a></li>
              <li><a href="https://www.bccr.fi.cr" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Banco Central</a></li>
              <li><a href="https://www.hacienda.go.cr" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Ministerio de Hacienda</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/20 mt-8 pt-6 text-center text-sm">
          <p>Proyecto de código abierto — Los datos provienen de fuentes gubernamentales oficiales</p>
        </div>
      </div>
    </footer>
  );
}
