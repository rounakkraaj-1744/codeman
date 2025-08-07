"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Github, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import AddTemplate from "./addTemplate"
import { InputCode } from '@/components/input-code'

const projects = [
  {
    id: 1,
    title: "CodeBriefs",
    description: "A markdown blogpost app for sharing and learning coding through notes and cheatsheets",
    image: "/codebriefs.png?height=300&width=500",
    tags: ["Next.js", "OAuth", "Prisma", "Postgres", "TailwindCSS", "ShadCN"],
    category: "web",
    github: "#",
  },
  {
    id: 2,
    title: "PassSafeX",
    description: "A safe, secure, scalable and reliable password manager that respects your privacy",
    image: "/password.png?height=300&width=500",
    tags: [
      "Next.js",
      "OAuth",
      "Prisma",
      "Postgres",
      "TailwindCSS",
      "ShadCN",
      "Express.js",
      "bcrypt.js",
      "Docker compose",
    ],
    category: "web",
    github: "#",
  },
  {
    id: 3,
    title: "LangMorph",
    description:
      "A VS Code Extension that allows in-editor AI Based code conversion from one programming language to another",
    image: "/placeholder.svg?height=300&width=500",
    tags: ["TypeScript", "Gemini 2.O Flash API"],
    category: "systems",
    github: "#",
  },
  {
    id: 4,
    title: "Music Hunter",
    description: "My personalized music player ... (Spotify clone but my style)",
    image: "/musichunter.png?height=300&width=500",
    tags: ["DevOps", "Docker", "Next.js", "Express.js", "AWS S3", "Kubernetes", "TailwindCSS", "ShadCN"],
    category: "web",
    github: "#",
  },
  {
    id: 5,
    title: "Weather App",
    description: "Full Stack weather app to get accurate weather forecast as per your location",
    image: "/weather.png?height=300&width=500",
    tags: ["Next.js", "Express.js", "OpenWeatherMap API"],
    category: "web",
    github: "#",
  },
  {
    id: 6,
    title: "Observability Platform",
    description: "Full Stack Cloud and DevOps Observability Platform",
    image: "/weather.png?height=300&width=500",
    tags: ["Next.js", "Express.js", "AWS", "Kubernetes", "Docker", "Helm", "Terraform", "Github Actions", "ArgoCD"],
    category: "devops",
    github: "#",
  },
  {
    id: 7,
    title: "ROSH",
    description: "High performance Smart Shell powered by Rust",
    image: "/weather.png?height=300&width=500",
    tags: ["Rust"],
    category: "systems",
    github: "#",
  },
  {
    id: 9,
    title: "Attendance Tracking App",
    description: "Attendance Tracking App that will keep a track of your college and office attendance",
    image: "/weather.png?height=300&width=500",
    tags: ["React Native", "Nativewind", "TailwindCSS"],
    category: "mobile",
    github: "#",
  },
  {
    id: 10,
    title: "Attendance Tracking App",
    description: "Attendance Tracking App that will keep a track of your college and office attendance",
    image: "/weather.png?height=300&width=500",
    tags: ["React Native", "Nativewind", "TailwindCSS"],
    category: "mobile",
    github: "#",
  },
  {
    id: 11,
    title: "Attendance Tracking App",
    description: "Attendance Tracking App that will keep a track of your college and office attendance",
    image: "/weather.png?height=300&width=500",
    tags: ["React Native", "Nativewind", "TailwindCSS"],
    category: "mobile",
    github: "#",
  },
  {
    id: 12,
    title: "Attendance Tracking App",
    description: "Attendance Tracking App that will keep a track of your college and office attendance",
    image: "/weather.png?height=300&width=500",
    tags: ["React Native", "Nativewind", "TailwindCSS"],
    category: "mobile",
    github: "#",
  },
  {
    id: 13,
    title: "Attendance Tracking App",
    description: "Attendance Tracking App that will keep a track of your college and office attendance",
    image: "/weather.png?height=300&width=500",
    tags: ["React Native", "Nativewind", "TailwindCSS"],
    category: "mobile",
    github: "#",
  },
  {
    id: 14,
    title: "Attendance Tracking App",
    description: "Attendance Tracking App that will keep a track of your college and office attendance",
    image: "/weather.png?height=300&width=500",
    tags: ["React Native", "Nativewind", "TailwindCSS"],
    category: "mobile",
    github: "#",
  },
  {
    id: 15,
    title: "Attendance Tracking App",
    description: "Attendance Tracking App that will keep a track of your college and office attendance",
    image: "/weather.png?height=300&width=500",
    tags: ["React Native", "Nativewind", "TailwindCSS"],
    category: "mobile",
    github: "#",
  },
  {
    id: 16,
    title: "Attendance Tracking App",
    description: "Attendance Tracking App that will keep a track of your college and office attendance",
    image: "/weather.png?height=300&width=500",
    tags: ["React Native", "Nativewind", "TailwindCSS"],
    category: "mobile",
    github: "#",
  },
  {
    id: 17,
    title: "Attendance Tracking App",
    description: "Attendance Tracking App that will keep a track of your college and office attendance",
    image: "/weather.png?height=300&width=500",
    tags: ["React Native", "Nativewind", "TailwindCSS"],
    category: "mobile",
    github: "#",
  },
  {
    id: 18,
    title: "Attendance Tracking App",
    description: "Attendance Tracking App that will keep a track of your college and office attendance",
    image: "/weather.png?height=300&width=500",
    tags: ["React Native", "Nativewind", "TailwindCSS"],
    category: "mobile",
    github: "#",
  },
  {
    id: 19,
    title: "Attendance Tracking App",
    description: "Attendance Tracking App that will keep a track of your college and office attendance",
    image: "/weather.png?height=300&width=500",
    tags: ["React Native", "Nativewind", "TailwindCSS"],
    category: "mobile",
    github: "#",
  },
]

export default function Templates() {
  const [visibleCount, setVisibleCount] = useState(6)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const [showInputCode, setShowInputCode] = useState(false)
  const inputCodeRef = useRef(null)

  // Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 6)
        }
      },
      { threshold: 1.0 }
    )
    if (loadMoreRef.current) observer.observe(loadMoreRef.current)
    return () => observer.disconnect()
  }, [])



  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputCodeRef.current && !(inputCodeRef.current as any).contains(event.target))
        setShowInputCode(false)
    }

    if (showInputCode)
      document.addEventListener("mousedown", handleClickOutside)
    else
      document.removeEventListener("mousedown", handleClickOutside)

    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showInputCode])

  const visibleProjects = projects.slice(0, visibleCount)

  return (
    <div>

      <div className="flex items-end justify-end ">
        <AddTemplate onClick={() => setShowInputCode(true)} />

        {showInputCode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent transition-all duration-700">
            <div ref={inputCodeRef} className="flex items-center justify-center p-6 w-full max-w-xl bg-transparent transition-all duration-700">
              <InputCode />
            </div>
          </div>
        )}
      </div>

      <section
        id="projects"
        className="py-20 px-6 md:px-20 bg-[var(--bg-primary)] text-[var(--text)] min-h-screen"
      >
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center text-3xl md:text-4xl font-bold mb-12 text-[var(--primary)]"
        >
          All Templates
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {visibleProjects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="overflow-hidden flex flex-col h-full border border-border/50 hover:border-primary/20 transition-all hover:shadow-md group bg-[var(--card-bg)]">
                <div className="aspect-video w-full overflow-hidden bg-muted relative">
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                    <Button size="sm" variant="secondary" className="rounded-full" asChild>
                      <Link href={project.github} target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4 mr-1" />
                        Code
                      </Link>
                    </Button>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {project.title}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                    {project.tags.length > 3 && (
                      <Badge variant="outline">+{project.tags.length - 3}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardDescription className="text-sm">{project.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div ref={loadMoreRef} className="h-20 mt-10 flex justify-center items-center">
          {visibleCount < projects.length && (
            <p className="text-[var(--secondary)]">Loading more...</p>
          )}
        </div>

        <div className="text-center mt-12">
          <Button asChild variant="outline" size="lg" className="rounded-full bg-transparent">
            <Link href="https://github.com/rounakkraaj-1744" target="_blank" rel="noopener noreferrer">
              <Code className="h-5 w-5 mr-2" />
              View More on GitHub
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
