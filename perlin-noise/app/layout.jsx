import './global.css'

export const metadata = {
  title: "Perlin Noise",
  description: "Luka Ivelić Prototype",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
