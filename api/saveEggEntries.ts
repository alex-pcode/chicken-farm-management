import { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const entries = req.body;
    const dataFilePath = path.join(process.cwd(), 'src/components/test.json');
    
    // In production, you might want to use a database instead of file system
    fs.writeFileSync(dataFilePath, JSON.stringify({ eggEntries: entries }, null, 2));
    
    res.status(200).json({ message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ message: 'Error saving data' });
  }
}
