// Automated Test Script for Criteria Catalog & Role Authorization Logic
import assert from 'node:assert';

// Mock localStorage
const store = {};
global.localStorage = {
  getItem: (k) => store[k] || null,
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};

// Mock browser globals
global.document = {
  cookie: '',
  getElementById: () => null,
  createElement: () => ({ appendChild: () => {}, classList: { add: () => {} } })
};
global.window = {};

// Run dynamic tests
async function runTests() {
  console.log('=== SDLC STEP 3: AUTOMATED TEST SUITE FOR CRITERIA CATALOG ===\n');

  const {
    BENCHMARK_CRITERIA_CATALOG,
    loadCriteriaCatalog,
    addCriterionToCatalog,
    updateCriterionInCatalog,
    deleteCriterionFromCatalog,
    resetCriteriaCatalog,
    isSuperAdmin
  } = await import('./public/assets/js/components/custom-filter-builder.js');

  const { auth, ROLE_SUPERADMIN, ROLE_EDITOR_EXPORT } = await import('./public/assets/js/core/auth.js');

  // TC01: Initial catalog load
  console.log('[TEST] TC01: Initial catalog baseline count...');
  loadCriteriaCatalog();
  assert(BENCHMARK_CRITERIA_CATALOG.length > 50, `Catalog should have > 50 baseline criteria, found ${BENCHMARK_CRITERIA_CATALOG.length}`);
  console.log(`✓ TC01 Passed: Initial catalog loaded ${BENCHMARK_CRITERIA_CATALOG.length} criteria.\n`);

  // TC02: Unauthorized access check
  console.log('[TEST] TC02: Non-superadmin cannot add or update criteria...');
  auth.currentUser = { name: 'Staff User', role: 'editor' };
  auth.currentToken = 'mock-token';
  auth.currentRole = ROLE_EDITOR_EXPORT;
  assert.strictEqual(isSuperAdmin(), false, 'Editor should not be superadmin');

  const unauthorizedAdd = addCriterionToCatalog({ field: 'Tỷ lệ Chi phí / Thu nhập (CIR)', value: 0.5 });
  assert.strictEqual(unauthorizedAdd.success, false, 'Non-superadmin add must fail');
  assert.strictEqual(unauthorizedAdd.message, 'Unauthorized');

  const unauthorizedUpdate = updateCriterionInCatalog('crit_cir_under_60_latest', { value: 0.55 });
  assert.strictEqual(unauthorizedUpdate.success, false, 'Non-superadmin update must fail');
  assert.strictEqual(unauthorizedUpdate.message, 'Unauthorized');
  console.log('✓ TC02 Passed: Unauthorized mutations properly blocked.\n');

  // TC03: Superadmin add new custom criterion
  console.log('[TEST] TC03: Superadmin adds new criterion...');
  auth.currentUser = { name: 'Admin User', role: 'admin' };
  auth.currentRole = ROLE_SUPERADMIN;
  assert.strictEqual(isSuperAdmin(), true, 'Admin should be superadmin');

  const newCrit = {
    name: 'Thử nghiệm Tiêu chí ROE Khủng > 25%',
    field: 'Tỷ suất sinh lời trên Vốn CSH (ROE)',
    category: 'Kiểm định Admin',
    industry: 'NGAN_HANG',
    mode: 'threshold',
    operator: '>=',
    value: 0.25,
    displayValue: '25%',
    timeScope: 'latest'
  };

  const addRes = addCriterionToCatalog(newCrit);
  assert.strictEqual(addRes.success, true, 'Add criterion should succeed');
  const foundInCatalog = BENCHMARK_CRITERIA_CATALOG.find(c => c.id === addRes.criterion.id);
  assert(foundInCatalog, 'Newly added criterion must exist in catalog');
  assert.strictEqual(foundInCatalog.isCustom, true, 'isCustom must be true');
  assert.strictEqual(foundInCatalog.name, newCrit.name);
  console.log(`✓ TC03 Passed: Added criterion ${foundInCatalog.id} with badge isCustom=true.\n`);

  // TC04: Superadmin fix/override existing system criterion
  console.log('[TEST] TC04: Superadmin fixes existing system criterion...');
  const targetId = 'crit_cir_under_60_latest';
  const original = BENCHMARK_CRITERIA_CATALOG.find(c => c.id === targetId);
  assert(original, 'Target criterion must exist in baseline');

  const updateRes = updateCriterionInCatalog(targetId, {
    name: 'Tỷ lệ CIR dưới 55% đã fix bởi Super Admin',
    value: 0.55,
    displayValue: '55%'
  });
  assert.strictEqual(updateRes.success, true, 'Update criterion should succeed');

  const updated = BENCHMARK_CRITERIA_CATALOG.find(c => c.id === targetId);
  assert.strictEqual(updated.value, 0.55, 'Value should be updated to 0.55');
  assert.strictEqual(updated.displayValue, '55%', 'Display value should be 55%');
  assert.strictEqual(updated.isModified, true, 'isModified must be true');
  console.log(`✓ TC04 Passed: Fixed criterion ${targetId} updated to value=0.55, isModified=true.\n`);

  // TC05: Superadmin delete criterion
  console.log('[TEST] TC05: Superadmin deletes custom criterion...');
  const customId = addRes.criterion.id;
  const deleteRes = deleteCriterionFromCatalog(customId);
  assert.strictEqual(deleteRes.success, true, 'Delete should succeed');
  assert(!BENCHMARK_CRITERIA_CATALOG.find(c => c.id === customId), 'Criterion should no longer exist in catalog');
  console.log('✓ TC05 Passed: Custom criterion successfully deleted.\n');

  // TC06: Reset catalog to original baseline
  console.log('[TEST] TC06: Reset catalog to baseline defaults...');
  const resetRes = resetCriteriaCatalog();
  assert.strictEqual(resetRes.success, true, 'Reset should succeed');
  const restored = BENCHMARK_CRITERIA_CATALOG.find(c => c.id === targetId);
  assert.strictEqual(restored.value, 0.60, 'Value should be restored to baseline 0.60');
  assert.strictEqual(restored.isModified, false, 'isModified should be false after reset');
  console.log('✓ TC06 Passed: Catalog successfully restored to default baseline.\n');

  console.log('🎉 ALL SDLC UNIT & INTEGRATION TESTS PASSED (100% SUCCESS)!');
}

runTests().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
