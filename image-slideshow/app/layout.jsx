import './globals.css'

export const metadata = {
  title: "Image Slideshow",
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
