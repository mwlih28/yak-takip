import { Fuel } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-blue-600 p-2 rounded-xl">
            <Fuel className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">Yakıt Takip</span>
        </div>
        {children}
      </div>
    </div>
  )
}
