const express = require('express');
const router = express.Router();
const FileStorage = require('../utils/fileStorage');
const { logValidation, handleValidationErrors } = require('../middleware/validation');

const fileStorage = new FileStorage();

// POST /api/logs/add - Add log entry
router.post('/add', logValidation.add, handleValidationErrors, async (req, res) => {
  try {
    const { 'log-action': action, 'log-type': type, 'log-msg': msg } = req.body;
    
    const currentDateTime = new Date().toLocaleString('ru-RU', {
      timeZone: 'Europe/Saratov',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    let processedMsg = msg;
    if (type === 'img' && Array.isArray(msg)) {
      processedMsg = fileStorage.transformImg(msg);
    }
    
    const logEntry = `------------------------------
Datetime: ${currentDateTime}
Action: ${action}
Type: ${type}
Message: ${processedMsg}
------------------------------

`;
    
    await fileStorage.appendLogs(logEntry);
    
    res.status(201).json({
      message: 'Log entry added successfully',
      timestamp: currentDateTime
    });
  } catch (error) {
    console.error('Error adding log entry:', error);
    res.status(500).json({
      error: 'Failed to add log entry',
      message: error.message
    });
  }
});

// DELETE /api/logs/clear - Clear all logs
router.delete('/clear', async (req, res) => {
  try {
    await fileStorage.writeLogs('');
    
    res.json({
      message: 'Logs cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error clearing logs:', error);
    res.status(500).json({
      error: 'Failed to clear logs',
      message: error.message
    });
  }
});

// GET /api/logs/view - View logs (with pagination)
router.get('/view', async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    if (pageNum < 1 || limitNum < 1 || limitNum > 1000) {
      return res.status(400).json({
        error: 'Invalid pagination parameters',
        message: 'Page must be >= 1, limit must be between 1 and 1000'
      });
    }
    
    const logs = await fileStorage.readLogs();
    const logEntries = logs.split('------------------------------').filter(entry => entry.trim());
    
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedEntries = logEntries.slice(startIndex, endIndex);
    
    res.json({
      message: 'Logs retrieved successfully',
      data: {
        entries: paginatedEntries,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: logEntries.length,
          total_pages: Math.ceil(logEntries.length / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Error viewing logs:', error);
    res.status(500).json({
      error: 'Failed to view logs',
      message: error.message
    });
  }
});

// GET /api/logs/status - Get logs status
router.get('/status', async (req, res) => {
  try {
    const logs = await fileStorage.readLogs();
    const logEntries = logs.split('------------------------------').filter(entry => entry.trim());
    
    res.json({
      message: 'Logs status retrieved successfully',
      data: {
        total_entries: logEntries.length,
        file_size: Buffer.byteLength(logs, 'utf8'),
        last_updated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting logs status:', error);
    res.status(500).json({
      error: 'Failed to get logs status',
      message: error.message
    });
  }
});

module.exports = router;

