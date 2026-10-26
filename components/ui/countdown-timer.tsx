"use client"

import { useState, useEffect } from "react"
import { Clock, AlertTriangle } from "lucide-react"

interface CountdownTimerProps {
  initialMinutes: number
  onExpire?: () => void
  variant?: "warning" | "danger" | "info"
  title?: string
  className?: string
}

export function CountdownTimer({
  initialMinutes,
  onExpire,
  variant = "info",
  title = "Time remaining",
  className = "",
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60) // Convert to seconds
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true)
      onExpire?.()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true)
          onExpire?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, onExpire])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  const getVariantStyles = () => {
    if (isExpired) {
      return "bg-red-50 border-red-200 text-red-800"
    }

    switch (variant) {
      case "warning":
        return timeLeft <= 300
          ? "bg-red-50 border-red-200 text-red-800"
          : "bg-yellow-50 border-yellow-200 text-yellow-800"
      case "danger":
        return "bg-red-50 border-red-200 text-red-800"
      case "info":
      default:
        return timeLeft <= 300
          ? "bg-yellow-50 border-yellow-200 text-yellow-800"
          : "bg-blue-50 border-blue-200 text-blue-800"
    }
  }

  return (
    <div
      className={`flex items-center justify-center space-x-2 p-3 border rounded-lg ${getVariantStyles()} ${className}`}
    >
      {isExpired ? <AlertTriangle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
      <span className="text-sm font-medium">
        {isExpired ? (
          "Time expired"
        ) : (
          <>
            {title}:{" "}
            <strong>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </strong>
          </>
        )}
      </span>
    </div>
  )
}
