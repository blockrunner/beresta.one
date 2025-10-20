const fs = require('fs').promises;
const path = require('path');

class FileStorage {
  constructor(dataDir = './data') {
    this.dataDir = dataDir;
    this.queueFile = path.join(dataDir, 'queue_data.json');
    this.logsFile = path.join(dataDir, 'logs.log');
  }

  async ensureDataDir() {
    try {
      await fs.access(this.dataDir);
    } catch (error) {
      await fs.mkdir(this.dataDir, { recursive: true });
    }
  }

  async readQueue() {
    await this.ensureDataDir();
    try {
      const data = await fs.readFile(this.queueFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // Return default structure if file doesn't exist
      return {
        last_id: 0,
        data: []
      };
    }
  }

  async writeQueue(data) {
    await this.ensureDataDir();
    await fs.writeFile(this.queueFile, JSON.stringify(data, null, 2));
  }

  async readLogs() {
    await this.ensureDataDir();
    try {
      return await fs.readFile(this.logsFile, 'utf8');
    } catch (error) {
      return '';
    }
  }

  async writeLogs(content) {
    await this.ensureDataDir();
    await fs.writeFile(this.logsFile, content);
  }

  async appendLogs(content) {
    await this.ensureDataDir();
    await fs.appendFile(this.logsFile, content);
  }

  transformImg(msg) {
    let result = '\n';
    
    for (const subArray of msg) {
      for (const row of subArray) {
        for (const value of row) {
          result += value === 1 ? '+' : ' ';
        }
        result += '\n';
      }
      result += '\n';
    }
    
    return result;
  }
}

module.exports = FileStorage;

