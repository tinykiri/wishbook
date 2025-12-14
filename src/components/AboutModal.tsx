'use client'

interface AboutModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center p-4">

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* WRAPPER */}
      <div className="relative w-full max-w-md transform -rotate-1">

        {/* TAPE  */}
        <div
          className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-yellow-200/90 shadow-sm rotate-1 z-20 pointer-events-none"
          style={{ clipPath: 'polygon(5% 0%, 100% 2%, 95% 100%, 0% 98%)' }}
        ></div>

        {/* THE NOTE */}
        <div
          className="relative bg-paper w-full p-6 md:p-8 shadow-2xl z-10"
          style={{
            clipPath: 'polygon(2% 0%, 5% 2%, 8% 0%, 12% 2%, 18% 0%, 25% 3%, 35% 0%, 45% 2%, 55% 0%, 65% 3%, 75% 0%, 85% 2%, 92% 0%, 100% 3%, 100% 97%, 95% 100%, 90% 98%, 85% 100%, 75% 97%, 65% 100%, 55% 98%, 45% 100%, 35% 97%, 25% 100%, 15% 97%, 5% 100%, 0% 97%)',
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 1.9rem, #afe0e0 1.9rem, #afe0e0 2rem)',
            backgroundAttachment: 'local',
            backgroundSize: '100% 2rem'
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-slate-400 hover:text-red-500 font-title text-xl font-bold px-2 z-50 hover:cursor-pointer"
          >
            ✕
          </button>

          <h2 className="text-3xl font-title font-bold text-center mb-6 text-slate-800 mt-2">
            How to Use
          </h2>

          <div className="font-body text-lg text-slate-700 space-y-6 leading-relaxed">
            <div className="flex gap-3">
              <span className="text-2xl">✂️</span>
              <p>
                <strong>Paste a Link:</strong> Copy a product URL and click "Cut It!" to add it to your board.
              </p>
            </div>

            <div className="flex gap-3">
              <span className="text-2xl">🚧</span>
              <p>
                <strong>Manual Mode:</strong> Some sites block our scissors (copying). If a link doesn't work, just upload a photo and type the details yourself!
              </p>
            </div>

            <div className="flex gap-3">
              <span className="text-2xl">🎁</span>
              <p>
                <strong>Share It:</strong> Click the "Share" button to get a public link. Your friends can click items to buy them directly.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={onClose}
              className="bg-green-600 text-white px-6 py-2 rounded shadow-md hover:bg-green-700 transition-colors font-title font-bold text-lg transform hover:-rotate-1 hover:cursor-pointer inline-block"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}