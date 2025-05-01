import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Skill icons data - using string literals for SVG
export const skillIcons = [
  {
    id: 1,
    name: "Coding",
    icon: `<svg
      class="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
      />
    </svg>`,
    bgColor: "bg-indigo-100",
    textColor: "text-primary",
  },
  {
    id: 2,
    name: "Music",
    icon: `<svg
      class="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
      />
    </svg>`,
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-600",
  },
  {
    id: 3,
    name: "Cooking",
    icon: `<svg
      class="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>`,
    bgColor: "bg-red-100",
    textColor: "text-red-600",
  },
  {
    id: 4,
    name: "Photography",
    icon: `<svg
      class="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>`,
    bgColor: "bg-green-100",
    textColor: "text-green-600",
  },
  {
    id: 5,
    name: "Design",
    icon: `<svg
      class="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
      />
    </svg>`,
    bgColor: "bg-blue-100",
    textColor: "text-blue-600",
  },
  {
    id: 6,
    name: "Language",
    icon: `<svg
      class="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
      />
    </svg>`,
    bgColor: "bg-purple-100",
    textColor: "text-purple-600",
  },
  {
    id: 7,
    name: "Crafts",
    icon: `<svg
      class="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
      />
    </svg>`,
    bgColor: "bg-pink-100",
    textColor: "text-pink-600",
  },
  {
    id: 8,
    name: "Finance",
    icon: `<svg
      class="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>`,
    bgColor: "bg-orange-100",
    textColor: "text-orange-600",
  },
  {
    id: 9,
    name: "Art",
    icon: `<svg
      class="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>`,
    bgColor: "bg-indigo-100",
    textColor: "text-indigo-600",
  },
  {
    id: 10,
    name: "Mentoring",
    icon: `<svg
      class="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>`,
    bgColor: "bg-teal-100",
    textColor: "text-teal-600",
  },
  // Additional 10 skills
  {
    id: 11,
    name: "Taekwondo",
    icon: `<svg
      class="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M9 5l7 7-7 7M5 5l7 7-7 7"
      />
    </svg>`,
    bgColor: "bg-red-200",
    textColor: "text-red-700",
  },
  {
    id: 12,
    name: "Surfing",
    icon: `<svg
      class="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>`,
    bgColor: "bg-blue-200",
    textColor: "text-blue-700",
  },
  {
    id: 13,
    name: "Video Gaming",
    icon: `<svg
      class="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M9 12l2 2 4-4m5.5-3.5a2 2 0 11-4 0 2 2 0 014 0zM7 10.5a2 2 0 11-4 0 2 2 0 014 0zM19 10.5a2 2 0 11-4 0 2 2 0 014 0zM12 15.5a2 2 0 100-4 2 2 0 000 4z"
      />
    </svg>`,
    bgColor: "bg-green-200",
    textColor: "text-green-700",
  },
  {
    id: 14,
    name: "Skating",
    icon: `<svg
      class="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M17 8l4 4m0 0l-4 4m4-4H3"
      />
    </svg>`,
    bgColor: "bg-purple-200",
    textColor: "text-purple-700",
  },
  {
    id: 15,
    name: "Basketball",
    icon: `<svg
      class="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>`,
    bgColor: "bg-orange-200",
    textColor: "text-orange-700",
  },
  {
    id: 16,
    name: "Chess",
    icon: `<svg
      class="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M9 5l7 7-7 7"
      />
    </svg>`,
    bgColor: "bg-gray-200",
    textColor: "text-gray-700",
  },
  {
    id: 17,
    name: "Swimming",
    icon: `<svg
      class="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16v-2.586l-2.293-2.293a1 1 0 00-1.414 0l-2.586 2.586V19h8zm-4-6l2 2 4-4 2 2V9l-6-6-6 6v5z"
      />
    </svg>`,
    bgColor: "bg-teal-200",
    textColor: "text-teal-700",
  },
  {
    id: 18,
    name: "Pottery",
    icon: `<svg
      class="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M5 13l4 4L19 7"
      />
    </svg>`,
    bgColor: "bg-pink-200",
    textColor: "text-pink-700",
  },
  {
    id: 19,
    name: "Karate",
    icon: `<svg
      class="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M15 10l4 4m0 0l-4 4m4-4H6"
      />
    </svg>`,
    bgColor: "bg-indigo-200",
    textColor: "text-indigo-700",
  },
  {
    id: 20,
    name: "Climbing",
    icon: `<svg
      class="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M7 11l5-5 5 5M7 11l5 5m-5-5h12"
      />
    </svg>`,
    bgColor: "bg-green-200",
    textColor: "text-green-700",
  },
];

// Features data (unchanged)
export const features = [
  {
    title: "Create Your Profile",
    description: "List the skills you want to learn and the skills you can teach to others.",
    icon: `<svg
      class="h-8 w-8 text-primary"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>`,
    bgColor: "bg-primary-light bg-opacity-20",
  },
  {
    title: "Get Matched",
    description: "Our algorithm finds perfect skill-swap matches based on your interests and location.",
    icon: `<svg
      class="h-8 w-8 text-secondary"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>`,
    bgColor: "bg-secondary bg-opacity-20",
  },
  {
    title: "Connect & Learn",
    description: "Chat with your matches, schedule sessions, and start swapping skills.",
    icon: `<svg
      class="h-8 w-8 text-accent"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>`,
    bgColor: "bg-accent bg-opacity-20",
  },
];

// Testimonials data (unchanged)
export const testimonials = [
  {
    name: "Priya Sharma",
    location: "Mumbai, India",
    quote: "I taught yoga to Arjun while he taught me how to code in Python. Now I'm building a yoga app with my new skills!",
  },
  {
    name: "Raj Patel",
    location: "Bangalore, India",
    quote: "I was struggling with digital marketing until I met Neha through SwapSkill. I taught her guitar, and she transformed my business!",
  },
  {
    name: "Ananya Desai",
    location: "Delhi, India",
    quote: "Found a photography mentor while sharing my cooking skills. SwapSkill connects people in ways I never imagined possible.",
  },
];

// Footer links (unchanged)
export const footerLinks = {
  resources: [
    { title: "Community Guidelines", href: "#" },
    { title: "Safety Tips", href: "#" },
    { title: "Success Stories", href: "#" },
    { title: "Skill Categories", href: "#" },
  ],
  company: [
    { title: "About Us", href: "#" },
    { title: "Careers", href: "#" },
    { title: "Press", href: "#" },
    { title: "Contact", href: "#" },
  ],
  legal: [
    { title: "Terms of Service", href: "#" },
    { title: "Privacy Policy", href: "#" },
    { title: "Cookie Policy", href: "#" },
    { title: "Community Standards", href: "#" },
  ],
};