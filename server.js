import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Generic function to update test.json
const updateTestData = (type, data) => {
  try {
    const testDataPath = join(__dirname, 'src', 'components', 'test.json');
    console.log('Attempting to write to:', testDataPath);
    
    // Read current data
    const currentData = fs.readFileSync(testDataPath, 'utf8');
    const testData = JSON.parse(currentData);
    
    // Update data
    testData[type] = data;
    
    // Write back to file
    fs.writeFileSync(testDataPath, JSON.stringify(testData, null, 2));
    console.log(`Successfully updated ${type} in test.json`);
    return testData;
  } catch (error) {
    console.error('Error in updateTestData:', error);
    throw error;
  }
};

// Handle egg entries updates
app.post('/api/saveEggEntries', (req, res) => {
  try {
    const testData = updateTestData('eggEntries', req.body);
    res.json({ success: true, data: testData });
  } catch (error) {
    console.error('Error saving egg entries:', error);
    res.status(500).json({ error: 'Failed to save egg entries' });
  }
});

// Handle flock profile updates
app.post('/api/saveFlockProfile', (req, res) => {
  try {
    const testData = updateTestData('flockProfile', req.body);
    res.json({ success: true, data: testData });
  } catch (error) {
    console.error('Error saving flock profile:', error);
    res.status(500).json({ error: 'Failed to save flock profile' });
  }
});

// Handle expenses updates
app.post('/api/saveExpenses', (req, res) => {
  try {
    const testData = updateTestData('chickenExpenses', req.body);
    res.json({ success: true, data: testData });
  } catch (error) {
    console.error('Error saving expenses:', error);
    res.status(500).json({ error: 'Failed to save expenses' });
  }
});

// Handle feed inventory updates
app.post('/api/saveFeedInventory', (req, res) => {
  try {
    const testData = updateTestData('feedInventory', req.body);
    res.json({ success: true, data: testData });
  } catch (error) {
    console.error('Error saving feed inventory:', error);
    res.status(500).json({ error: 'Failed to save feed inventory' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});