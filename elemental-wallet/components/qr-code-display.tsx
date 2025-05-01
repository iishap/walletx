"use client"

import { useEffect, useRef } from "react"
import QRCode from "qrcode"

interface QRCodeDisplayProps {
  address: string
  size?: number
}

export function QRCodeDisplay({ address, size = 200 }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        address,
        {
          width: size,
          margin: 1,
          color: {
            dark: "#2D2424", // dark-brown
            light: "#FFFFFF", // white
          },
        },
        (error) => {
          if (error) console.error(error)
        },
      )
    }
  }, [address, size])

  return (
    <div className="flex justify-center">
      <div className="bg-white p-3 rounded-2xl border border-mauve/10 shadow-sm">
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}
