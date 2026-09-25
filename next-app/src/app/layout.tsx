// @ts-nocheck
import './globals.css';

export const metadata = {
  title: 'Digimon Atlas',
  description: 'Catalogo de Digimon e suas linhas evolutivas.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
