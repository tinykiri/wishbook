'use client'

import Link from 'next/link';

export default function TermsPage() {
  const instaLink = "https://www.instagram.com/tiny.kiri?igsh=MW9seXJqeG4yZzY1";

  return (
    <main className="w-full min-h-screen pt-24 pb-20 px-4 md:px-0 relative">

      {/* HEADER */}
      <h1 className="text-5xl md:text-7xl font-bold text-center mb-12 font-title transform -rotate-1">
        <span className="text-crayon-red">Terms</span> & <span className="text-slate-600">Stuff</span>
      </h1>

      {/* WRAPPER: Holds both Tape and Paper together */}
      <div className="max-w-3xl mx-auto relative transform rotate-1">

        {/* TAPE: Now outside the clipped paper div so it is visible */}
        <div
          className="absolute -top-5 left-1/2 -translate-x-1/2 w-40 h-10 bg-yellow-200/90 shadow-sm rotate-[-2deg] z-20"
          style={{
            // Added jagged edges to make it look like real tape
            clipPath: 'polygon(5% 0%, 100% 2%, 95% 100%, 0% 98%)'
          }}
        ></div>

        {/* PAPER SHEET */}
        <div className="bg-white p-8 md:p-12 shadow-xl relative z-10"
          style={{
            clipPath: 'polygon(1% 0%, 99% 2%, 100% 98%, 0% 100%)',
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 1.9rem, #afe0e0 1.9rem, #afe0e0 2rem)',
            backgroundAttachment: 'local',
            backgroundSize: '100% auto'
          }}
        >

          <div className="font-body text-xl md:text-2xl leading-relaxed text-slate-800 space-y-8">

            <section>
              <h2 className="font-bold text-3xl text-crayon-blue mb-2">1. The Basics</h2>
              <p>
                Welcome to <strong>My WishList</strong> by{' '}
                <Link href={instaLink} target="_blank" className="text-crayon-red hover:underline">
                  @tiny.kiri
                </Link>.
                By using this site, you agree to these terms.
                Basically: be nice, have fun, and don't break things.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-3xl text-crayon-red mb-2">2. Your Stuff</h2>
              <p>
                You can paste links and make lists. Please don't upload anything illegal, mean, or weird.
                If you do, I ({' '}
                <Link href={instaLink} target="_blank" className="text-crayon-red hover:underline">
                  @tiny.kiri
                </Link>
                ) might have to delete it. I am the boss of this notebook.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-3xl text-green-600 mb-2">3. No Promises</h2>
              <p>
                This site is a fun project. It might break. The layout might get wonky on your fridge (or phone).
                I try my best, but I provide this service "as is"—crayon smudges and all.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-3xl text-purple-500 mb-2">4. Privacy</h2>
              <p>
                I only save the stuff you tell me to save (your list items). I don't sell your data because
                I don't even know how to do that.
              </p>
            </section>

            <div className="pt-8 text-center">
              <Link href="/" className="inline-block bg-yellow-300 px-6 py-2 font-bold text-yellow-900 transform -rotate-2 hover:scale-110 transition-transform shadow-md">
                Okay, I agree! ➜
              </Link>
            </div>

          </div>
        </div>
      </div>

    </main>
  );
}