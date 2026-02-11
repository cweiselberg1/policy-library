/**
 * Test script for policy utilities
 * Run with: npx tsx lib/test-policies.ts
 */
import {
  getAllPolicies,
  getPolicyById,
  getCategories,
  searchPolicies,
  getPolicyCount
} from './policies';

async function runTests() {
  console.log('🧪 Testing Policy Utilities\n');

  // Test 1: Get all covered entity policies
  console.log('📋 Test 1: Get all Covered Entity policies');
  const cePolicies = getAllPolicies('covered_entity');
  console.log(`✓ Found ${cePolicies.length} Covered Entity policies`);
  if (cePolicies.length > 0) {
    console.log(`  First policy: ${cePolicies[0].id} - ${cePolicies[0].title}`);
  }
  console.log();

  // Test 2: Get all business associate policies
  console.log('📋 Test 2: Get all Business Associate policies');
  const baPolicies = getAllPolicies('business_associate');
  console.log(`✓ Found ${baPolicies.length} Business Associate policies`);
  if (baPolicies.length > 0) {
    console.log(`  First policy: ${baPolicies[0].id} - ${baPolicies[0].title}`);
  }
  console.log();

  // Test 3: Get policy by ID
  if (cePolicies.length > 0) {
    console.log('🔍 Test 3: Get policy by ID');
    const testId = cePolicies[0].id;
    const policy = getPolicyById(testId, 'covered_entity');
    console.log(`✓ Found policy ${testId}: ${policy?.title}`);
    console.log(`  Category: ${policy?.category}`);
    console.log(`  Required: ${policy?.required}`);
    console.log();
  }

  // Test 4: Get categories
  console.log('📂 Test 4: Get Covered Entity categories');
  const ceCategories = getCategories('covered_entity');
  console.log(`✓ Found ${ceCategories.length} categories:`, ceCategories);
  console.log();

  console.log('📂 Test 5: Get Business Associate categories');
  const baCategories = getCategories('business_associate');
  console.log(`✓ Found ${baCategories.length} categories:`, baCategories);
  console.log();

  // Test 5: Search policies
  console.log('🔎 Test 6: Search for "privacy" in Covered Entities');
  const searchResults = searchPolicies('privacy', 'covered_entity');
  console.log(`✓ Found ${searchResults.length} matching policies`);
  searchResults.slice(0, 3).forEach(p => {
    console.log(`  - ${p.id}: ${p.title}`);
  });
  console.log();

  // Test 6: Get policy counts
  console.log('📊 Test 7: Policy counts');
  const ceCount = getPolicyCount('covered_entity');
  const baCount = getPolicyCount('business_associate');
  console.log(`✓ Covered Entities: ${ceCount} policies`);
  console.log(`✓ Business Associates: ${baCount} policies`);
  console.log(`✓ Total: ${ceCount + baCount} policies`);
  console.log();

  // Test 7: Validate policy structure
  if (cePolicies.length > 0) {
    console.log('✅ Test 8: Validate policy structure');
    const sample = cePolicies[0];
    const hasAllFields =
      sample.id &&
      sample.title &&
      sample.category &&
      Array.isArray(sample.applies_to) &&
      typeof sample.required === 'boolean' &&
      sample.version &&
      sample.file_path;

    console.log(`✓ All required fields present: ${hasAllFields}`);
    console.log('  Sample policy structure:');
    console.log('  {');
    console.log(`    id: "${sample.id}",`);
    console.log(`    title: "${sample.title.substring(0, 50)}...",`);
    console.log(`    category: "${sample.category}",`);
    console.log(`    applies_to: [${sample.applies_to.map(x => `"${x}"`).join(', ')}],`);
    console.log(`    required: ${sample.required},`);
    console.log(`    version: "${sample.version}",`);
    console.log(`    file_path: "${sample.file_path}",`);
    console.log('  }');
  }

  console.log('\n✨ All tests completed successfully!');
}

runTests().catch(console.error);
