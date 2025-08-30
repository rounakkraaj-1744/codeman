"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from "@/components/ui/command"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { signOut } from "next-auth/react";

export function Navbar() {
  const { setTheme } = useTheme()

  return (
    <nav className="bg-primary text-primary-foreground h-16 flex justify-between items-center px-6 shadow-md">
      <div className="text-2xl md:text-3xl font-bold tracking-tight">
        <Link href="/">CodeMan</Link>
      </div>

      <ul className="hidden md:flex gap-8 text-lg font-medium">
        <Link href="/"><li className="cursor-pointer">Home</li></Link>
        <Link href="/about"><li className="cursor-pointer">About</li></Link>
      </ul>

      <div className="flex items-center gap-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary" className="pr-8">
              Search Templates ...
            </Button>
          </DialogTrigger>
          <DialogContent className="p-0">
            <DialogHeader>
              <DialogTitle className="w-full">
                <Command className="rounded-lg border shadow-md md:min-w-[450px]">
                  <CommandInput placeholder="Search Templates ..." />
                  <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Suggestions">
                      <CommandItem className="cursor-pointer">
                        <ArrowRight />
                        <span>Calendar</span>
                      </CommandItem>
                      <CommandItem className="cursor-pointer">
                        <ArrowRight />
                        <span>Search Emoji</span>
                      </CommandItem>
                      <CommandItem className="cursor-pointer">
                        <ArrowRight />
                        <span>Calculator</span>
                      </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Settings">
                      <CommandItem className="cursor-pointer">
                        <ArrowRight />
                        <span>Profile</span>
                      </CommandItem>
                      <CommandItem className="cursor-pointer">
                        <ArrowRight />
                        <span>Billing</span>
                      </CommandItem>
                      <CommandItem className="cursor-pointer">
                        <ArrowRight />
                        <span>Settings</span>
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <Link href="/profile" className="w-full">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/dashboard" className="w-full">Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/settings" className="w-full">Settings</Link>
            </DropdownMenuItem>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <button className="w-full text-left" onClick={()=>signOut()}>Log out</button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
