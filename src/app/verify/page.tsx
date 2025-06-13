import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Importa el componente cliente desactivando SSR
const VerifyClient = dynamic(() => import('./VerifyClient'), { ssr: false });

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Cargando verificación...</div>}>
      <VerifyClient />
    </Suspense>
  );
}
