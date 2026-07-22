const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const { runAIDetection } = require('../src/services/aiDetectionService');
const { detectPlate } = require('../src/services/plateDetectionService');

test('runAIDetection returns null when the Python script is missing', async () => {
  const missingScript = path.join(__dirname, 'missing-detect.py');
  const result = await runAIDetection('dummy-image.jpg', { scriptPath: missingScript });

  assert.equal(result, null);
});

test('detectPlate returns null when the Python script is missing', async () => {
  const missingScript = path.join(__dirname, 'missing-detect-plate.py');
  const result = await detectPlate('dummy-image.jpg', { scriptPath: missingScript });

  assert.equal(result, null);
});
