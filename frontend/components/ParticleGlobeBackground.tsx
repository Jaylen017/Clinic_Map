'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  radius: number
  lat: number
  lng: number
}

export default function ParticleGlobeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const rotationRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Create particles in sphere formation
    const createParticles = () => {
      const particles: Particle[] = []
      const radius = Math.min(canvas.width, canvas.height) * 0.25
      const particleCount = 250

      for (let i = 0; i < particleCount; i++) {
        const lat = Math.acos(Math.random() * 2 - 1) - Math.PI / 2
        const lng = Math.random() * Math.PI * 2
        const x = radius * Math.cos(lat) * Math.cos(lng)
        const y = radius * Math.sin(lat)
        const z = radius * Math.cos(lat) * Math.sin(lng)

        particles.push({
          x,
          y,
          z,
          vx: (Math.random() - 0.5) * 0.02,
          vy: (Math.random() - 0.5) * 0.02,
          vz: (Math.random() - 0.5) * 0.02,
          radius: Math.random() * 2 + 1,
          lat,
          lng,
        })
      }

      particlesRef.current = particles
    }

    createParticles()

    // Mouse movement tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / canvas.width) * 2 - 1
      mouseRef.current.y = (e.clientY / canvas.height) * 2 - 1

      rotationRef.current.y += mouseRef.current.x * 0.01
      rotationRef.current.x -= mouseRef.current.y * 0.01
    }

    canvas.addEventListener('mousemove', handleMouseMove)

    // Project 3D point to 2D
    const project = (x: number, y: number, z: number) => {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const scale = 500
      const zOffset = 500

      const screenX = centerX + (x / (z + zOffset)) * scale
      const screenY = centerY + (y / (z + zOffset)) * scale

      return { screenX, screenY, z: z + zOffset }
    }

    // Rotate point around Y axis
    const rotateY = (x: number, z: number, angle: number) => {
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      return {
        x: x * cos - z * sin,
        z: x * sin + z * cos,
      }
    }

    // Rotate point around X axis
    const rotateX = (y: number, z: number, angle: number) => {
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      return {
        y: y * cos - z * sin,
        z: y * sin + z * cos,
      }
    }

    // Animation loop
    const animate = () => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Auto rotation
      rotationRef.current.y += 0.002

      const particles = particlesRef.current
      const projected: Array<{ x: number; y: number; z: number; original: Particle }> = []

      // Project all particles
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i]

        // Apply rotations
        let { x, z } = rotateY(particle.x, particle.z, rotationRef.current.y)
        let rotated = rotateX(particle.y, z, rotationRef.current.x)
        const y = rotated.y
        z = rotated.z

        const proj = project(x, y, z)
        projected.push({ x: proj.screenX, y: proj.screenY, z: proj.z, original: particle })

        // Draw particle
        if (proj.z > 0) {
          ctx.beginPath()
          const alpha = Math.min(1, proj.z / 500)
          ctx.fillStyle = `rgba(59, 130, 246, ${alpha})`
          ctx.arc(proj.screenX, proj.screenY, particle.radius, 0, Math.PI * 2)
          ctx.fill()

          // Glow effect
          const gradient = ctx.createRadialGradient(
            proj.screenX,
            proj.screenY,
            0,
            proj.screenX,
            proj.screenY,
            particle.radius * 3
          )
          gradient.addColorStop(0, `rgba(59, 130, 246, ${alpha * 0.5})`)
          gradient.addColorStop(1, 'rgba(59, 130, 246, 0)')
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(proj.screenX, proj.screenY, particle.radius * 3, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Draw connections between nearby particles (optimized)
      const maxDistance = 150
      for (let i = 0; i < projected.length; i++) {
        if (projected[i].z <= 0) continue
        
        for (let j = i + 1; j < projected.length; j++) {
          if (projected[j].z <= 0) continue
          
          const dx = projected[i].x - projected[j].x
          const dy = projected[i].y - projected[j].y
          const distanceSq = dx * dx + dy * dy
          
          // Use squared distance to avoid sqrt for better performance
          if (distanceSq < maxDistance * maxDistance) {
            const distance = Math.sqrt(distanceSq)
            const alpha = (1 - distance / maxDistance) * 0.2
            ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(projected[i].x, projected[i].y)
            ctx.lineTo(projected[j].x, projected[j].y)
            ctx.stroke()
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      canvas.removeEventListener('mousemove', handleMouseMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-auto"
      style={{ zIndex: 0, cursor: 'move' }}
    />
  )
}

