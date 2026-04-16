export function LogoConsultoSec({ className = "w-9 h-9" }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Fondo azul */}
      <circle cx="50" cy="50" r="50" fill="#003087"/>
      
      {/* Silueta Búho - Líneas finas */}
      <path d="M30 35 L50 48 L70 35 L75 60 L50 75 L25 60 Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round"/>
      <circle cx="42" cy="45" r="3" fill="white"/>
      <circle cx="58" cy="45" r="3" fill="white"/>
      
      {/* Círculo de auditoría */}
      <circle cx="50" cy="65" r="10" stroke="white" strokeWidth="2.5"/>
      <path d="M46 65 L49 68 L55 61" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}