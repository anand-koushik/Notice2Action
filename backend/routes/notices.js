import express from 'express';
import Notice from '../models/Notice.js';
import { analyzeNotice } from '../services/groq.js';
import pdfParse from 'pdf-parse';

const router = express.Router();

// GET all notices
router.get('/', async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json(notices);
  } catch (error) {
    console.error('Error fetching notices:', error);
    res.status(500).json({ error: 'Failed to fetch notices history' });
  }
});

// GET single notice
router.get('/:id', async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }
    res.json(notice);
  } catch (error) {
    console.error('Error fetching notice:', error);
    res.status(500).json({ error: 'Failed to fetch notice details' });
  }
});

// POST analyze notice
router.post('/analyze', async (req, res) => {
  try {
    let { content, fileType, fileName, mimeType } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required for analysis' });
    }

    if (!['text', 'pdf', 'image'].includes(fileType)) {
      return res.status(400).json({ error: 'Invalid fileType. Must be text, pdf, or image' });
    }

    console.log(`Starting analysis for notice: ${fileName || 'Pasted Text'} (${fileType})`);
    
    let analysisContent = content;
    let analysisFileType = fileType;

    // Handle PDF files by extracting text on the backend
    if (fileType === 'pdf') {
      console.log('PDF file detected, extracting text content using pdf-parse...');
      const buffer = Buffer.from(content, 'base64');
      const pdfData = await pdfParse(buffer);
      analysisContent = pdfData.text;
      
      if (!analysisContent || !analysisContent.trim()) {
        console.warn('PDF text extraction returned empty content. PDF might be scanned.');
        return res.status(400).json({
          error: 'Scanned PDF Detected',
          details: 'The uploaded PDF does not contain extractable text. If it is a scanned document, please convert its pages to images (PNG/JPG) and upload those instead so Groq Llama Vision can analyze it.'
        });
      }
      
      analysisFileType = 'text'; // Groq Llama will analyze the text
      console.log(`PDF text successfully extracted (${analysisContent.length} characters)`);
    }

    // Call Groq service
    const analysisResult = await analyzeNotice({
      content: analysisContent,
      fileType: analysisFileType,
      mimeType: mimeType || 'image/jpeg'
    });

    const originalContentSaved = fileType === 'text' 
      ? content 
      : `Uploaded ${fileType.toUpperCase()} file: ${fileName}`;

    // Create and save Notice document
    const notice = new Notice({
      title: analysisResult.title,
      originalContent: originalContentSaved,
      fileType,
      fileName: fileName || 'Pasted Notice',
      summary: analysisResult.summary,
      eligibility: analysisResult.eligibility,
      deadlines: analysisResult.deadlines,
      checklist: analysisResult.checklist
    });

    await notice.save();
    console.log(`Notice analyzed and saved successfully: ${notice.title} (${notice._id})`);
    res.status(201).json(notice);
  } catch (error) {
    console.error('Error analyzing notice:', error);
    res.status(500).json({ 
      error: 'Failed to analyze notice using Groq AI', 
      details: error.message 
    });
  }
});

// PUT update checklist item completion status
router.put('/:id/checklist', async (req, res) => {
  try {
    const { id } = req.params;
    const { itemId, completed } = req.body;

    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    const checklistItem = notice.checklist.id(itemId);
    if (!checklistItem) {
      return res.status(404).json({ error: 'Checklist item not found' });
    }

    checklistItem.completed = completed;
    await notice.save();

    res.json(notice);
  } catch (error) {
    console.error('Error updating checklist:', error);
    res.status(500).json({ error: 'Failed to update checklist item status' });
  }
});

// DELETE notice
router.delete('/:id', async (req, res) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }
    res.json({ message: 'Notice deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Error deleting notice:', error);
    res.status(500).json({ error: 'Failed to delete notice' });
  }
});

export default router;
