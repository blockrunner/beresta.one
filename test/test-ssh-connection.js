#!/usr/bin/env node

/**
 * Тестовый скрипт для проверки SSH подключения
 * Использует те же параметры, что и в GitHub Actions
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Загружаем переменные окружения из .env файла
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '..', 'env.example');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ Файл env.example не найден');
    process.exit(1);
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });
  
  return envVars;
}

async function testSSHConnection() {
  console.log('🔧 Тестирование SSH подключения...\n');
  
  const env = loadEnvFile();
  
  const host = env.SSH_HOST;
  const username = env.SSH_USER;
  const password = env.SSH_PASS;
  
  if (!host || !username || !password) {
    console.error('❌ Не все переменные окружения найдены:');
    console.error(`SSH_HOST: ${host ? '✅' : '❌'}`);
    console.error(`SSH_USER: ${username ? '✅' : '❌'}`);
    console.error(`SSH_PASS: ${password ? '✅' : '❌'}`);
    process.exit(1);
  }
  
  console.log(`📡 Хост: ${host}`);
  console.log(`👤 Пользователь: ${username}`);
  console.log(`🔑 Пароль: ${password ? '***' : 'НЕ УСТАНОВЛЕН'}`);
  console.log('');
  
  // Тестируем SSH подключение
  const sshCommand = `sshpass -p "${password}" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${username}@${host} "echo 'SSH connection successful!'"`;
  
  console.log('🚀 Выполняем SSH подключение...');
  
  return new Promise((resolve, reject) => {
    exec(sshCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Ошибка SSH подключения:');
        console.error(error.message);
        if (stderr) {
          console.error('Stderr:', stderr);
        }
        reject(error);
      } else {
        console.log('✅ SSH подключение успешно!');
        console.log('Ответ сервера:', stdout.trim());
        resolve();
      }
    });
  });
}

async function testDockerCommands() {
  console.log('\n🐳 Тестирование Docker команд на сервере...\n');
  
  const env = loadEnvFile();
  const host = env.SSH_HOST;
  const username = env.SSH_USER;
  const password = env.SSH_PASS;
  
  const commands = [
    'docker --version',
    'docker-compose --version',
    'pwd',
    'ls -la'
  ];
  
  for (const command of commands) {
    console.log(`🔧 Выполняем: ${command}`);
    
    const sshCommand = `sshpass -p "${password}" ssh -o StrictHostKeyChecking=no ${username}@${host} "${command}"`;
    
    try {
      await new Promise((resolve, reject) => {
        exec(sshCommand, (error, stdout, stderr) => {
          if (error) {
            console.error(`❌ Ошибка выполнения команды "${command}":`);
            console.error(error.message);
            reject(error);
          } else {
            console.log(`✅ Результат: ${stdout.trim()}`);
            resolve();
          }
        });
      });
    } catch (error) {
      console.error(`❌ Не удалось выполнить команду: ${command}`);
    }
    console.log('');
  }
}

async function main() {
  try {
    await testSSHConnection();
    await testDockerCommands();
    console.log('🎉 Все тесты завершены успешно!');
  } catch (error) {
    console.error('💥 Тесты завершились с ошибкой:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { testSSHConnection, testDockerCommands };
