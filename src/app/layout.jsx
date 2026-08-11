import './globals.css'

export const metadata = {
  title: 'BillingApp',
  description: 'Billing Management System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#f5f9ff] text-slate-800">
        {children}
      </body>
    </html>
  )
}