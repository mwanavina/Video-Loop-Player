"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Square, Video } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function VideoLoopPlayer() {
  const [videoUrl, setVideoUrl] = useState("")
  const [loopCount, setLoopCount] = useState(100)
  const [playDuration, setPlayDuration] = useState(5)
  const [isRunning, setIsRunning] = useState(false)
  const [currentLoop, setCurrentLoop] = useState(0)
  const [status, setStatus] = useState("Ready to start")
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const isRunningRef = useRef(false)

  const convertToEmbedUrl = (url: string): string => {
    console.log("[v0] Original URL:", url)

    // YouTube URL patterns
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/
    const youtubeMatch = url.match(youtubeRegex)

    if (youtubeMatch) {
      const videoId = youtubeMatch[1]
      const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=1&rel=0`
      console.log("[v0] Converted to YouTube embed:", embedUrl)
      return embedUrl
    }

    // Vimeo URL patterns
    const vimeoRegex = /vimeo\.com\/(\d+)/
    const vimeoMatch = url.match(vimeoRegex)

    if (vimeoMatch) {
      const videoId = vimeoMatch[1]
      const embedUrl = `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1`
      console.log("[v0] Converted to Vimeo embed:", embedUrl)
      return embedUrl
    }

    // If already an embed URL or other format, return as is
    console.log("[v0] Using URL as-is:", url)
    return url
  }

  const startLooping = async () => {
    if (!videoUrl) {
      setStatus("Please enter a video URL")
      return
    }

    setIsRunning(true)
    isRunningRef.current = true
    setCurrentLoop(0)
    setStatus("Starting loop sequence...")

    const embedUrl = convertToEmbedUrl(videoUrl)

    for (let i = 0; i < loopCount && isRunningRef.current; i++) {
      setCurrentLoop(i + 1)
      setStatus(`Loading video ${i + 1} of ${loopCount}...`)

      const urlWithTimestamp = `${embedUrl}${embedUrl.includes("?") ? "&" : "?"}t=${Date.now()}`
      console.log("[v0] Loading iframe with URL:", urlWithTimestamp)

      if (iframeRef.current) {
        iframeRef.current.src = urlWithTimestamp
      }

      setStatus(`Playing video ${i + 1} of ${loopCount}...`)

      // Wait for the specified duration
      await new Promise((resolve) => setTimeout(resolve, playDuration * 1000))

      if (isRunningRef.current && iframeRef.current) {
        console.log("[v0] Clearing iframe for loop", i + 1)
        iframeRef.current.src = "about:blank"
        setStatus(`Closed video ${i + 1}, preparing next...`)
      }

      // Small delay between loops
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    if (isRunningRef.current) {
      setStatus("Loop sequence completed!")
      setIsRunning(false)
      isRunningRef.current = false
    }
  }

  const stopLooping = () => {
    console.log("[v0] Stopping loop sequence")
    isRunningRef.current = false
    setIsRunning(false)
    setStatus("Stopped by user")

    if (iframeRef.current) {
      iframeRef.current.src = "about:blank"
    }
  }

  const progress = loopCount > 0 ? (currentLoop / loopCount) * 100 : 0

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 gap-6">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Video className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-bold">Video Loop Player</CardTitle>
          </div>
          <CardDescription>Automatically open and play videos multiple times</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="video-url">Video URL</Label>
            <Input
              id="video-url"
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              disabled={isRunning}
            />
            <p className="text-sm text-muted-foreground">Enter any video URL (YouTube, Vimeo, etc.)</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="loop-count">Number of Loops</Label>
              <Input
                id="loop-count"
                type="number"
                min="1"
                max="1000"
                value={loopCount}
                onChange={(e) => setLoopCount(Number.parseInt(e.target.value) || 1)}
                disabled={isRunning}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="play-duration">Play Duration (seconds)</Label>
              <Input
                id="play-duration"
                type="number"
                min="1"
                max="60"
                value={playDuration}
                onChange={(e) => setPlayDuration(Number.parseInt(e.target.value) || 1)}
                disabled={isRunning}
              />
            </div>
          </div>

          {isRunning && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-mono font-medium">
                  {currentLoop} / {loopCount}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <p className="text-sm font-mono mt-1">{status}</p>
          </div>

          <div className="flex gap-3">
            {!isRunning ? (
              <Button onClick={startLooping} className="flex-1" size="lg">
                <Play className="mr-2 h-4 w-4" />
                Start Loop
              </Button>
            ) : (
              <Button onClick={stopLooping} variant="destructive" className="flex-1" size="lg">
                <Square className="mr-2 h-4 w-4" />
                Stop Loop
              </Button>
            )}
          </div>

          {isRunning && (
            <div className="rounded-lg border border-border bg-black overflow-hidden" style={{ height: "400px" }}>
              <iframe
                ref={iframeRef}
                className="w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          <div className="rounded-lg border border-border bg-card p-4 space-y-2">
            <p className="text-sm font-medium">How it works:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Automatically converts YouTube/Vimeo URLs to embeddable format</li>
              <li>Videos play muted to allow autoplay (browser requirement)</li>
              <li>Each video plays for the specified duration then reloads</li>
              <li>Check browser console for debugging information</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
