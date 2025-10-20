const express = require('express');
const router = express.Router();
const FileStorage = require('../utils/fileStorage');
const { queueValidation, handleValidationErrors } = require('../middleware/validation');

const fileStorage = new FileStorage();

// POST /api/queue/save - Save queue item
router.post('/save', queueValidation.save, handleValidationErrors, async (req, res) => {
  try {
    const { name, data } = req.body;
    
    const queueData = await fileStorage.readQueue();
    queueData.last_id += 1;
    
    const newItem = {
      id: queueData.last_id,
      name,
      data,
      created_at: new Date().toISOString()
    };
    
    queueData.data.push(newItem);
    await fileStorage.writeQueue(queueData);
    
    res.status(201).json({
      message: 'Queue item saved successfully',
      data: newItem
    });
  } catch (error) {
    console.error('Error saving queue item:', error);
    res.status(500).json({
      error: 'Failed to save queue item',
      message: error.message
    });
  }
});

// GET /api/queue/load - Load all queue items
router.get('/load', async (req, res) => {
  try {
    const queueData = await fileStorage.readQueue();
    
    res.json({
      message: 'Queue loaded successfully',
      data: queueData
    });
  } catch (error) {
    console.error('Error loading queue:', error);
    res.status(500).json({
      error: 'Failed to load queue',
      message: error.message
    });
  }
});

// DELETE /api/queue/remove - Remove queue item
router.delete('/remove', queueValidation.remove, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.body;
    
    const queueData = await fileStorage.readQueue();
    const initialLength = queueData.data.length;
    
    queueData.data = queueData.data.filter(item => item.id !== id);
    
    if (queueData.data.length === initialLength) {
      return res.status(404).json({
        error: 'Queue item not found',
        id
      });
    }
    
    await fileStorage.writeQueue(queueData);
    
    res.json({
      message: 'Queue item removed successfully',
      id
    });
  } catch (error) {
    console.error('Error removing queue item:', error);
    res.status(500).json({
      error: 'Failed to remove queue item',
      message: error.message
    });
  }
});

// GET /api/queue/status - Get queue status
router.get('/status', async (req, res) => {
  try {
    const queueData = await fileStorage.readQueue();
    
    res.json({
      message: 'Queue status retrieved successfully',
      data: {
        total_items: queueData.data.length,
        last_id: queueData.last_id,
        last_updated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting queue status:', error);
    res.status(500).json({
      error: 'Failed to get queue status',
      message: error.message
    });
  }
});

module.exports = router;

