import { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const expenseData = req.body;
    const dataFilePath = path.join(process.cwd(), 'src/components/test.json');
    
    // Read current data
    let currentData = {};
    try {
      const fileContent = fs.readFileSync(dataFilePath, 'utf8');
      currentData = JSON.parse(fileContent);
    } catch (error) {
      // File doesn't exist or is empty, start with empty object
      currentData = {};
    }
    
    // Update expenses data
    currentData.expenses = expenseData;
    
    // Write back to file
    fs.writeFileSync(dataFilePath, JSON.stringify(currentData, null, 2));
    
    res.status(200).json({ message: 'Expenses saved successfully', data: currentData });
  } catch (error) {
    console.error('Error saving expenses:', error);
    res.status(500).json({ message: 'Error saving expenses', error: error.message });
  }
}
