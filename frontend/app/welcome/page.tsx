'use client'

import { useRouter } from 'next/navigation'
import ParticleGlobeBackground from '@/components/ParticleGlobeBackground'
import { Sparkles, Globe, MapPin } from 'lucide-react'

export default function WelcomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Particle Globe Background */}
      <ParticleGlobeBackground />

      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-blue-900/50 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl w-full">
          {/* Animated title with glow effect */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-6">
              <Globe className="w-12 h-12 md:w-16 md:h-16 text-blue-400 animate-spin-slow" />
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 animate-pulse">
                ClinicFinder 3D
              </h1>
              <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-cyan-400 animate-pulse" />
            </div>
            
            <p className="text-xl md:text-2xl text-blue-100/90 mb-4 font-light">
              Find nearby real clinics with available appointment slots
            </p>
            <p className="text-lg md:text-xl text-blue-200/70 mb-12 font-light">
              on a fully interactive 3D world map
            </p>

            {/* Floating particles decoration */}
            <div className="flex justify-center gap-2 mb-12">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '2s',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Action buttons with enhanced styling */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={() => router.push('/clinic/register')}
              className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-lg rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-110 hover:shadow-blue-500/50 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                <MapPin className="w-6 h-6" />
                I am a Clinic / Hospital
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>

            <button
              onClick={() => router.push('/patient/map')}
              className="group relative px-10 py-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold text-lg rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-110 hover:shadow-green-500/50 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                <Globe className="w-6 h-6" />
                I am a Patient
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>

          {/* Additional decorative elements */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 text-blue-300/60 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Real-time updates</span>
              <span className="mx-2">•</span>
              <span>Live clinic availability</span>
              <span className="mx-2">•</span>
              <span>Instant booking</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx global>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  )
}
