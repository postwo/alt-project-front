export default function Footer() {
  return (
    <footer className="py-12 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">알</span>
            </div>
            <span className="text-xl font-bold text-emerald-800">알뜰모아</span>
          </div>
          <div className="text-sm text-gray-500">
            © 2025 알뜰모아. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
