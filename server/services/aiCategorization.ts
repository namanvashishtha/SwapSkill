// Advanced AI-based skill categorization service
// This service can be extended to use external AI APIs for better categorization

interface CategoryPrediction {
  category: string;
  confidence: number;
  reasoning?: string;
}

// Enhanced categorization using multiple algorithms
export class AISkillCategorizer {
  private static instance: AISkillCategorizer;
  
  // Skill patterns with weights for better matching
  private skillPatterns = {
    "Gardening": {
      exact: ["gardening", "horticulture", "botany", "composting", "hydroponics"],
      contains: ["garden", "plant", "flower", "vegetable", "herb", "soil", "organic", "farming", "greenhouse", "landscape"],
      suffixes: ["gardening", "farming"],
      prefixes: ["organic", "indoor", "outdoor"],
      weight: 1.0
    },
    "DIY & Crafts": {
      exact: ["woodworking", "knitting", "sewing", "pottery", "crafts", "diy"],
      contains: ["craft", "handmade", "wood", "furniture", "knit", "sew", "pottery", "ceramic", "jewelry", "repair", "build"],
      suffixes: ["working", "making", "crafts"],
      prefixes: ["hand", "home", "furniture"],
      weight: 1.0
    },
    "Technology": {
      exact: ["javascript", "python", "java", "react", "angular", "vue", "node.js", "html", "css", "sql"],
      contains: ["programming", "coding", "development", "software", "web", "mobile", "app", "data", "ai", "ml"],
      suffixes: ["js", "py", "dev", "script"],
      prefixes: ["web", "mobile", "full", "back", "front"],
      weight: 1.0
    },
    "Creative Arts": {
      exact: ["photoshop", "illustrator", "figma", "sketch", "indesign", "painting", "drawing"],
      contains: ["design", "graphic", "illustration", "animation", "ui", "ux", "art", "creative", "visual", "paint", "draw", "sketch", "color", "canvas", "brush", "watercolor", "acrylic"],
      suffixes: ["design", "art", "painting"],
      prefixes: ["graphic", "visual", "watercolor", "digital"],
      weight: 1.0
    },
    "Music": {
      exact: ["guitar", "piano", "drums", "violin", "bass", "keyboard", "singing", "dj"],
      contains: ["music", "singing", "song", "audio", "sound", "instrument", "melody", "guitar", "piano", "drums", "violin", "bass", "keyboard", "vocal", "harmony", "rhythm", "beat", "composition"],
      suffixes: ["music", "theory", "playing"],
      prefixes: ["music", "audio"],
      weight: 1.0
    },
    "Fitness": {
      exact: ["yoga", "pilates", "crossfit", "zumba", "climbing"],
      contains: ["fitness", "workout", "exercise", "training", "gym", "health", "sport", "climbing", "rock", "indoor", "outdoor", "physical", "cardio", "strength"],
      suffixes: ["training", "fitness", "climbing"],
      prefixes: ["personal", "strength", "rock", "indoor", "outdoor"],
      weight: 1.0
    },
    "Languages": {
      exact: ["english", "spanish", "french", "german", "chinese", "japanese", "arabic", "russian"],
      contains: ["language", "speaking", "writing", "translation", "grammar"],
      suffixes: ["language"],
      prefixes: [],
      weight: 1.0
    },
    "Business": {
      exact: ["marketing", "sales", "accounting", "finance", "management", "entrepreneurship"],
      contains: ["business", "entrepreneur", "leadership", "strategy", "consulting", "marketing", "sales", "finance", "accounting", "management", "corporate", "commercial", "economy", "profit"],
      suffixes: ["management", "strategy", "marketing"],
      prefixes: ["business", "project", "digital"],
      weight: 1.0
    },
    "Academic": {
      exact: ["mathematics", "physics", "chemistry", "biology", "history", "literature", "philosophy", "psychology"],
      contains: ["math", "science", "research", "academic", "study", "education", "theory", "quantum", "molecular", "theoretical", "applied", "scientific"],
      suffixes: ["science", "studies", "theory"],
      prefixes: ["applied", "theoretical", "quantum", "advanced"],
      weight: 1.0
    },
    "Culinary": {
      exact: ["cooking", "baking", "chef", "barista"],
      contains: ["food", "cuisine", "recipe", "culinary", "kitchen", "meal"],
      suffixes: ["cooking", "baking"],
      prefixes: ["food", "culinary"],
      weight: 1.0
    },
    "Photography": {
      exact: ["photography", "lightroom", "camera"],
      contains: ["photo", "picture", "image", "visual", "lens", "studio"],
      suffixes: ["photography"],
      prefixes: ["photo", "digital"],
      weight: 1.0
    },
    "Wellness": {
      exact: ["meditation", "mindfulness", "therapy", "counseling"],
      contains: ["wellness", "mental", "spiritual", "healing", "relaxation"],
      suffixes: ["therapy", "wellness"],
      prefixes: ["mental", "spiritual"],
      weight: 1.0
    }
  };

  private constructor() {}

  public static getInstance(): AISkillCategorizer {
    if (!AISkillCategorizer.instance) {
      AISkillCategorizer.instance = new AISkillCategorizer();
    }
    return AISkillCategorizer.instance;
  }

  // Main categorization method with confidence scoring
  public categorizeSkill(skillName: string): CategoryPrediction {
    const normalizedSkill = skillName.toLowerCase().trim();
    const predictions: CategoryPrediction[] = [];

    // Special handling for compound skills like "Digital Marketing"
    if (normalizedSkill.includes('marketing') || normalizedSkill.includes('business') || normalizedSkill.includes('sales')) {
      const businessScore = this.calculateCategoryScore(normalizedSkill, this.skillPatterns["Business"]);
      if (businessScore > 0.3) {
        return {
          category: "Business",
          confidence: Math.min(businessScore, 1.0),
          reasoning: "Business-related skill detected"
        };
      }
    }

    // Special handling for academic/scientific terms
    if (normalizedSkill.includes('theory') || normalizedSkill.includes('quantum') || normalizedSkill.includes('physics') || normalizedSkill.includes('science')) {
      const academicScore = this.calculateCategoryScore(normalizedSkill, this.skillPatterns["Academic"]);
      if (academicScore > 0.1 || normalizedSkill.includes('theory')) {
        return {
          category: "Academic",
          confidence: Math.max(academicScore, 0.6),
          reasoning: "Academic/scientific skill detected"
        };
      }
    }

    // Special handling for climbing activities
    if (normalizedSkill.includes('climbing') || (normalizedSkill.includes('rock') && normalizedSkill.includes('indoor'))) {
      return {
        category: "Fitness",
        confidence: 0.9,
        reasoning: "Physical activity/climbing skill detected"
      };
    }

    // Score each category
    for (const [category, patterns] of Object.entries(this.skillPatterns)) {
      const score = this.calculateCategoryScore(normalizedSkill, patterns);
      if (score > 0) {
        predictions.push({
          category,
          confidence: Math.min(score * patterns.weight, 1.0),
          reasoning: this.generateReasoning(normalizedSkill, category, patterns)
        });
      }
    }

    // Sort by confidence and return the best match
    predictions.sort((a, b) => b.confidence - a.confidence);
    
    if (predictions.length > 0 && predictions[0].confidence > 0.3) {
      return predictions[0];
    }

    // Fallback to semantic analysis
    const semanticPrediction = this.semanticCategorization(normalizedSkill);
    if (semanticPrediction.confidence > 0.2) {
      return semanticPrediction;
    }

    return {
      category: "Other",
      confidence: 0.1,
      reasoning: "No clear category match found"
    };
  }

  // Calculate score for a category based on pattern matching
  private calculateCategoryScore(skill: string, patterns: any): number {
    let score = 0;

    // Exact matches (highest weight)
    if (patterns.exact.some((exact: string) => skill === exact)) {
      score += 1.0;
    }

    // Contains matches
    for (const keyword of patterns.contains) {
      if (skill.includes(keyword)) {
        score += 0.7;
      }
      if (keyword.includes(skill) && skill.length > 2) {
        score += 0.5;
      }
    }

    // Suffix matches
    for (const suffix of patterns.suffixes) {
      if (skill.endsWith(suffix)) {
        score += 0.6;
      }
    }

    // Prefix matches
    for (const prefix of patterns.prefixes) {
      if (skill.startsWith(prefix)) {
        score += 0.6;
      }
    }

    // Word similarity
    const words = skill.split(/[\s\-_]+/);
    for (const word of words) {
      if (word.length > 2) {
        for (const keyword of [...patterns.exact, ...patterns.contains]) {
          const similarity = this.calculateStringSimilarity(word, keyword);
          if (similarity > 0.8) {
            score += similarity * 0.4;
          }
        }
      }
    }

    return Math.min(score, 1.0);
  }

  // Semantic categorization based on word relationships
  private semanticCategorization(skill: string): CategoryPrediction {
    const words = skill.split(/[\s\-_]+/).filter(word => word.length > 2);
    
    // Technology indicators
    if (words.some(word => 
      ['app', 'web', 'code', 'tech', 'digital', 'cyber', 'data', 'cloud', 'software', 'programming'].includes(word) ||
      word.endsWith('ing') && ['program', 'develop', 'cod'].some(tech => word.includes(tech))
    )) {
      return { category: "Technology", confidence: 0.6, reasoning: "Semantic analysis detected technology-related terms" };
    }

    // Creative indicators
    if (words.some(word => 
      ['art', 'creative', 'visual', 'draw', 'paint', 'sketch', 'watercolor', 'acrylic', 'canvas', 'brush'].includes(word)
    )) {
      return { category: "Creative Arts", confidence: 0.5, reasoning: "Semantic analysis detected creative terms" };
    }

    // Physical activity indicators
    if (words.some(word => 
      ['training', 'exercise', 'physical', 'body', 'movement', 'sport', 'climbing', 'rock', 'indoor', 'outdoor'].includes(word)
    )) {
      return { category: "Fitness", confidence: 0.5, reasoning: "Semantic analysis detected fitness-related terms" };
    }

    // Gardening indicators
    if (words.some(word => 
      ['garden', 'plant', 'organic', 'grow', 'soil', 'flower', 'vegetable', 'herb'].includes(word)
    )) {
      return { category: "Gardening", confidence: 0.5, reasoning: "Semantic analysis detected gardening terms" };
    }

    // DIY & Crafts indicators
    if (words.some(word => 
      ['wood', 'furniture', 'craft', 'handmade', 'pottery', 'ceramic', 'making', 'build'].includes(word)
    )) {
      return { category: "DIY & Crafts", confidence: 0.5, reasoning: "Semantic analysis detected crafts terms" };
    }

    // Business indicators (for digital marketing)
    if (words.some(word => 
      ['marketing', 'business', 'sales', 'strategy', 'commercial', 'profit'].includes(word)
    )) {
      return { category: "Business", confidence: 0.5, reasoning: "Semantic analysis detected business terms" };
    }

    return { category: "Other", confidence: 0.1, reasoning: "Semantic analysis found no clear category" };
  }

  // Generate human-readable reasoning for categorization
  private generateReasoning(skill: string, category: string, patterns: any): string {
    const reasons = [];

    if (patterns.exact.some((exact: string) => skill === exact)) {
      reasons.push("exact match found");
    }

    const matchingKeywords = patterns.contains.filter((keyword: string) => 
      skill.includes(keyword) || keyword.includes(skill)
    );
    if (matchingKeywords.length > 0) {
      reasons.push(`contains keywords: ${matchingKeywords.slice(0, 2).join(', ')}`);
    }

    return reasons.length > 0 ? reasons.join('; ') : `categorized as ${category}`;
  }

  // Calculate string similarity using Levenshtein distance
  private calculateStringSimilarity(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    const maxLength = Math.max(str1.length, str2.length);
    return maxLength === 0 ? 1 : (maxLength - matrix[str2.length][str1.length]) / maxLength;
  }

  // Batch categorization for multiple skills
  public categorizeSkills(skills: string[]): CategoryPrediction[] {
    return skills.map(skill => this.categorizeSkill(skill));
  }

  // Get category statistics
  public getCategoryStats(skills: string[]): { [category: string]: number } {
    const stats: { [category: string]: number } = {};
    const predictions = this.categorizeSkills(skills);
    
    for (const prediction of predictions) {
      stats[prediction.category] = (stats[prediction.category] || 0) + 1;
    }
    
    return stats;
  }
}

// Export singleton instance and convenience functions
export const aiCategorizer = AISkillCategorizer.getInstance();

export function categorizeSkillWithAI(skillName: string): CategoryPrediction {
  return aiCategorizer.categorizeSkill(skillName);
}

export function categorizeSkillsWithAI(skills: string[]): CategoryPrediction[] {
  return aiCategorizer.categorizeSkills(skills);
}

export function getSkillCategoryStats(skills: string[]): { [category: string]: number } {
  return aiCategorizer.getCategoryStats(skills);
}