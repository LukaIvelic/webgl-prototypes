import './global.css'

export const metadata = {
  title: "Flowing Dunes",
  description: "Luka Ivelić Prototype",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
