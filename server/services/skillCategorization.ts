import { AvailableSkillModel } from "../db/mongodb.js";
import { categorizeSkillWithAI } from "./aiCategorization.js";

// Predefined skill categories with keywords for AI-based categorization
const SKILL_CATEGORIES = {
  "Technology": [
    "programming", "coding", "development", "software", "web", "mobile", "app", "data", "machine learning", 
    "ai", "artificial intelligence", "cybersecurity", "security", "cloud", "blockchain", "game", "database",
    "javascript", "python", "java", "react", "node", "angular", "vue", "html", "css", "sql", "mongodb",
    "aws", "azure", "docker", "kubernetes", "git", "api", "backend", "frontend", "fullstack", "devops"
  ],
  "Creative Arts": [
    "design", "graphic", "illustration", "animation", "ui", "ux", "digital", "painting", "typography", 
    "logo", "brand", "creative", "visual", "art", "drawing", "sketch", "photoshop", "illustrator",
    "figma", "adobe", "creative suite", "branding", "layout", "color theory"
  ],
  "Music": [
    "guitar", "piano", "singing", "music", "production", "dj", "songwriting", "theory", "drums", "violin",
    "bass", "keyboard", "composition", "recording", "mixing", "mastering", "audio", "sound", "instrument",
    "melody", "harmony", "rhythm", "beat", "electronic music", "classical", "jazz", "rock", "pop"
  ],
  "Academic": [
    "mathematics", "math", "physics", "chemistry", "biology", "history", "literature", "philosophy", 
    "economics", "science", "research", "academic", "study", "education", "teaching", "tutoring",
    "calculus", "algebra", "geometry", "statistics", "psychology", "sociology", "political science"
  ],
  "Photography": [
    "photography", "photo", "camera", "portrait", "landscape", "product", "editing", "lighting", 
    "composition", "street", "wedding", "event", "studio", "digital", "film", "lens", "exposure",
    "photoshop", "lightroom", "raw", "macro", "wildlife", "fashion", "commercial"
  ],
  "Fitness": [
    "yoga", "fitness", "training", "workout", "exercise", "strength", "cardio", "pilates", "martial arts",
    "nutrition", "personal training", "gym", "health", "wellness", "sports", "running", "cycling",
    "swimming", "weightlifting", "bodybuilding", "crossfit", "zumba", "dance", "flexibility"
  ],
  "Languages": [
    "english", "spanish", "mandarin", "chinese", "french", "german", "japanese", "arabic", "russian",
    "language", "speaking", "writing", "reading", "translation", "interpretation", "grammar", "vocabulary",
    "conversation", "fluency", "accent", "pronunciation", "linguistics", "sign language"
  ],
  "Business": [
    "marketing", "business", "accounting", "project management", "public speaking", "sales", 
    "entrepreneurship", "strategy", "leadership", "management", "finance", "consulting", "negotiation",
    "communication", "presentation", "networking", "customer service", "operations", "hr", "human resources"
  ],
  "Culinary": [
    "cooking", "baking", "pastry", "chef", "cuisine", "recipe", "food", "meal prep", "wine", "barista",
    "coffee", "nutrition", "diet", "kitchen", "culinary", "restaurant", "catering", "dessert", "bread",
    "cake", "vegetarian", "vegan", "healthy cooking", "international cuisine"
  ],
  "Gardening": [
    "gardening", "plant", "garden", "vegetable", "landscape", "composting", "hydroponics", "bonsai",
    "herb", "flower", "soil", "organic", "permaculture", "greenhouse", "farming", "agriculture",
    "botany", "horticulture", "sustainable", "indoor plants", "outdoor gardening"
  ],
  "DIY & Crafts": [
    "woodworking", "knitting", "sewing", "jewelry", "pottery", "home repair", "upcycling", "candle",
    "crafts", "diy", "handmade", "carpentry", "furniture", "restoration", "painting", "decorating",
    "embroidery", "quilting", "scrapbooking", "beading", "metalworking", "leatherwork"
  ],
  "Wellness": [
    "meditation", "mindfulness", "aromatherapy", "massage", "stress management", "sleep", "journaling",
    "mental health", "therapy", "counseling", "relaxation", "breathing", "spiritual", "holistic",
    "alternative medicine", "reiki", "acupuncture", "self-care", "life coaching", "personal development"
  ]
};

// Simple keyword-based categorization function
export function categorizeSkill(skillName: string): string {
  const normalizedSkill = skillName.toLowerCase().trim();
  
  // Check each category for keyword matches
  for (const [category, keywords] of Object.entries(SKILL_CATEGORIES)) {
    for (const keyword of keywords) {
      if (normalizedSkill.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(normalizedSkill)) {
        return category;
      }
    }
  }
  
  // Default category if no match found
  return "Other";
}

// Enhanced categorization using AI-based approach
export function categorizeSkillAdvanced(skillName: string): string {
  try {
    // Use the advanced AI categorization
    const prediction = categorizeSkillWithAI(skillName);
    
    // Log the categorization for debugging
    console.log(`AI Categorization: "${skillName}" -> "${prediction.category}" (confidence: ${prediction.confidence.toFixed(2)})`);
    
    // Return the category if confidence is reasonable
    if (prediction.confidence > 0.2) {
      return prediction.category;
    }
    
    // Fallback to simple categorization if AI confidence is too low
    return categorizeSkill(skillName);
  } catch (error) {
    console.error('Error in AI categorization, falling back to simple categorization:', error);
    return categorizeSkill(skillName);
  }
}

// Simple similarity calculation (Jaccard similarity for words)
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.split(/\s+/));
  const words2 = new Set(str2.split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

// Function to auto-create skills in the available skills collection
export async function autoCreateSkills(skills: string[]): Promise<void> {
  if (!skills || skills.length === 0) {
    return;
  }
  
  try {
    console.log(`Auto-creating skills: ${skills.join(', ')}`);
    
    for (const skillName of skills) {
      if (!skillName || skillName.trim() === '') {
        continue;
      }
      
      const trimmedSkillName = skillName.trim();
      
      // Check if skill already exists (case-insensitive)
      const existingSkill = await AvailableSkillModel.findOne({
        name: { $regex: new RegExp(`^${trimmedSkillName}$`, 'i') }
      });
      
      if (existingSkill) {
        console.log(`Skill "${trimmedSkillName}" already exists, skipping`);
        continue;
      }
      
      // Categorize the skill using AI-based categorization
      const category = categorizeSkillAdvanced(trimmedSkillName);
      
      // Get the next available ID
      const maxSkill = await AvailableSkillModel.findOne({}, { id: 1 }).sort({ id: -1 }).lean();
      const nextId = (maxSkill?.id || 0) + 1;
      
      // Create the new skill
      const newSkill = {
        id: nextId,
        name: trimmedSkillName,
        category: category,
        description: `Auto-generated skill: ${trimmedSkillName}`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await AvailableSkillModel.create(newSkill);
      console.log(`Created new skill: "${trimmedSkillName}" in category "${category}"`);
    }
  } catch (error) {
    console.error('Error auto-creating skills:', error);
    // Don't throw error to prevent profile update from failing
  }
}

// Function to get or create skills and return their categories
export async function getOrCreateSkillsWithCategories(skills: string[]): Promise<Array<{name: string, category: string}>> {
  if (!skills || skills.length === 0) {
    return [];
  }
  
  const result: Array<{name: string, category: string}> = [];
  
  try {
    for (const skillName of skills) {
      if (!skillName || skillName.trim() === '') {
        continue;
      }
      
      const trimmedSkillName = skillName.trim();
      
      // Check if skill exists
      let existingSkill = await AvailableSkillModel.findOne({
        name: { $regex: new RegExp(`^${trimmedSkillName}$`, 'i') }
      });
      
      if (existingSkill) {
        result.push({ name: existingSkill.name, category: existingSkill.category });
      } else {
        // Create new skill
        const category = categorizeSkillAdvanced(trimmedSkillName);
        const maxSkill = await AvailableSkillModel.findOne({}, { id: 1 }).sort({ id: -1 }).lean();
        const nextId = (maxSkill?.id || 0) + 1;
        
        const newSkill = {
          id: nextId,
          name: trimmedSkillName,
          category: category,
          description: `Auto-generated skill: ${trimmedSkillName}`,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await AvailableSkillModel.create(newSkill);
        result.push({ name: trimmedSkillName, category: category });
        console.log(`Auto-created skill: "${trimmedSkillName}" in category "${category}"`);
      }
    }
  } catch (error) {
    console.error('Error getting/creating skills with categories:', error);
  }
  
  return result;
}