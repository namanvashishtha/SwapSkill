import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const skills = [
  { name: "Coding", icon: "fa-code" },
  { name: "Music", icon: "fa-music" },
  { name: "Cooking", icon: "fa-utensils" },
  { name: "Art", icon: "fa-paint-brush" },
  { name: "Languages", icon: "fa-language" },
  { name: "Photography", icon: "fa-camera" },
  { name: "Fitness", icon: "fa-dumbbell" },
  { name: "Chess", icon: "fa-chess" },
  { name: "Design", icon: "fa-palette" },
  { name: "Guitar", icon: "fa-guitar" }
];

export const popularSkills = [
  {
    title: "Web Development",
    description: "Learn to create responsive websites and web applications from scratch.",
    icon: "fa-code",
    color: "primary",
    teachers: 32,
    learners: 128
  },
  {
    title: "Guitar Lessons",
    description: "Master guitar basics and play your favorite songs with confidence.",
    icon: "fa-guitar",
    color: "secondary",
    teachers: 18,
    learners: 96
  },
  {
    title: "Indian Cooking",
    description: "Learn authentic Indian recipes and cooking techniques.",
    icon: "fa-utensils",
    color: "accent",
    teachers: 24,
    learners: 75
  }
];

export const testimonials = [
  {
    name: "Amit Sharma",
    location: "Mumbai, India",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
    text: "I taught Python programming and learned guitar in return. SwapSkill made it easy to find someone with complementary skills!"
  },
  {
    name: "Priya Patel",
    location: "Delhi, India",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
    text: "I've always wanted to learn photography, and now I exchange my yoga teaching skills for professional photo lessons!"
  },
  {
    name: "Rahul Verma",
    location: "Bangalore, India",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
    text: "SwapSkill connected me with a brilliant cook who taught me Indian cuisine while I helped them improve their English speaking skills."
  }
];
