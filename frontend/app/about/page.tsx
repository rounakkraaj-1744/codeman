'use client'

import { Card, CardContent } from '@/components/ui/card'
import { motion } from "motion/react"

const stats = [
  { label: 'Templates Saved', value: '10,000+' },
  { label: 'Active Devs', value: '1,200+' },
  { label: 'Languages Supported', value: '30+' },
]

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen text-[var(--text)] bg-gradient-to-b from-[var(--bg-primary)] to-[var(--bg-secondary)]">
      <main className="flex-grow px-6 py-12 md:px-20">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-extrabold tracking-tight text-center mb-10 text-primary"
        >
          🚀 About DevTemplate Vault
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl text-center text-white max-w-3xl mx-auto mb-16"
        >
          DevTemplate Vault is your personal coding archive. Save, tag, and reuse
          all your backend logic, auth flows, DB schemas, and more — without starting from scratch ever again.
        </motion.p>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.2 }}
            >
              <Card className="bg-[var(--card-bg)] border border-[var(--border)] text-center">
                <CardContent className="p-6">
                  <p className="text-3xl font-bold text-[var(--primary)]">{stat.value}</p>
                  <p className="text-sm text-white mt-2">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-center max-w-2xl mx-auto mb-24"
        >
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-primary">
            💡 Why This Exists
          </h2>
          <p className="text-[var(--text)]">
            You shouldn't have to rewrite boilerplate. DevTemplate Vault is the place to store and reuse your
            battle-tested code. Every project starts faster, scales smoother, and stays cleaner.
          </p>
        </motion.div>
      </main>
    </div>
  )
}
