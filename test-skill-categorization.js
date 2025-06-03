// Test script for skill categorization functionality
import { categorizeSkillAdvanced, autoCreateSkills } from './server/services/skillCategorization.js';
import { categorizeSkillWithAI, categorizeSkillsWithAI, getSkillCategoryStats } from './server/services/aiCategorization.js';
import { connectToMongoDB } from './server/db/mongodb.js';

async function testSkillCategorization() {
  console.log('🧪 Testing Skill Categorization System...\n');
  
  // Test skills with expected categories
  const testSkills = [
    { skill: 'React', expected: 'Technology' },
    { skill: 'JavaScript Programming', expected: 'Technology' },
    { skill: 'Guitar Playing', expected: 'Music' },
    { skill: 'Yoga Instruction', expected: 'Fitness' },
    { skill: 'Portrait Photography', expected: 'Photography' },
    { skill: 'Italian Cooking', expected: 'Culinary' },
    { skill: 'Spanish Language', expected: 'Languages' },
    { skill: 'Digital Marketing', expected: 'Business' },
    { skill: 'Mindfulness Meditation', expected: 'Wellness' },
    { skill: 'Graphic Design', expected: 'Creative Arts' },
    { skill: 'Organic Gardening', expected: 'Gardening' },
    { skill: 'Furniture Woodworking', expected: 'DIY & Crafts' },
    { skill: 'Advanced Mathematics', expected: 'Academic' },
    { skill: 'Quantum Entanglement Theory', expected: 'Other' }
  ];
  
  console.log('=== 🎯 AI Categorization Test ===');
  let correctPredictions = 0;
  for (const { skill, expected } of testSkills) {
    const prediction = categorizeSkillWithAI(skill);
    const isCorrect = prediction.category === expected;
    const status = isCorrect ? '✅' : '❌';
    
    if (isCorrect) correctPredictions++;
    
    console.log(`${status} "${skill}"`);
    console.log(`   → Category: ${prediction.category} (confidence: ${(prediction.confidence * 100).toFixed(1)}%)`);
    console.log(`   → Expected: ${expected}`);
    console.log(`   → Reasoning: ${prediction.reasoning}`);
    console.log('');
  }
  
  const accuracy = (correctPredictions / testSkills.length * 100).toFixed(1);
  console.log(`📊 Accuracy: ${correctPredictions}/${testSkills.length} (${accuracy}%)\n`);
  
  console.log('=== 📈 Batch Analysis Test ===');
  const skillNames = testSkills.map(t => t.skill);
  const batchPredictions = categorizeSkillsWithAI(skillNames);
  const stats = getSkillCategoryStats(skillNames);
  
  console.log('Category Distribution:');
  for (const [category, count] of Object.entries(stats)) {
    console.log(`  ${category}: ${count} skills`);
  }
  console.log('');
  
  console.log('=== 🔧 Auto-Creation Test ===');
  try {
    // Connect to MongoDB for testing auto-creation
    await connectToMongoDB();
    console.log('✅ Connected to MongoDB for testing');
    
    const newSkills = [
      'Vue.js Development', 
      'Ceramic Pottery Making', 
      'Italian Language Conversation', 
      'Indoor Rock Climbing',
      'Machine Learning with Python',
      'Watercolor Painting',
      'Vegan Meal Preparation'
    ];
    
    console.log(`Testing auto-creation of skills: ${newSkills.join(', ')}`);
    
    await autoCreateSkills(newSkills);
    console.log('✅ Auto-creation test completed successfully');
    
    // Test categorization of the new skills
    console.log('\n=== 🆕 New Skills Categorization ===');
    for (const skill of newSkills) {
      const prediction = categorizeSkillWithAI(skill);
      console.log(`"${skill}" → ${prediction.category} (${(prediction.confidence * 100).toFixed(1)}%)`);
    }
    
  } catch (error) {
    console.error('❌ Auto-creation test failed:', error.message);
  }
  
  console.log('\n=== ✨ Test Complete ===');
  console.log('🎉 All tests completed successfully!');
  process.exit(0);
}

// Run the test
testSkillCategorization().catch(console.error);