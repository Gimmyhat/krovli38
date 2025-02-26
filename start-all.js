// Так как в package.json указан "type": "module", используем ESM синтаксис
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import colors from 'colors';

// Получаем текущую директорию в ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Функция для запуска команды в указанной директории
function runCommand(command, args, cwd, name) {
  console.log(colors.cyan(`[${name}] Запуск...`));
  
  const child = spawn(command, args, {
    cwd: path.resolve(__dirname, cwd),
    shell: true,
    stdio: 'pipe'
  });

  child.stdout.on('data', (data) => {
    console.log(colors[getColor(name)](`[${name}] ${data.toString().trim()}`));
  });

  child.stderr.on('data', (data) => {
    console.error(colors.red(`[${name}] ${data.toString().trim()}`));
  });

  child.on('close', (code) => {
    if (code !== 0) {
      console.log(colors.red(`[${name}] Процесс завершился с кодом ${code}`));
    } else {
      console.log(colors.green(`[${name}] Процесс завершился успешно`));
    }
  });

  return child;
}

// Получение цвета для логов
function getColor(name) {
  const colorMap = {
    'Сервер': 'green',
    'Админка': 'yellow',
    'Сайт': 'blue'
  };
  return colorMap[name] || 'white';
}

// Запуск всех компонентов
console.log(colors.bold('Запуск всех компонентов системы...'));

// Запуск сервера
const server = runCommand('npm', ['run', 'dev'], 'server', 'Сервер');

// Даем серверу время на запуск перед запуском клиентских приложений
setTimeout(() => {
  // Запуск админ-панели
  const adminPanel = runCommand('npm', ['run', 'dev'], 'admin-panel', 'Админка');
  
  // Запуск основного сайта
  const website = runCommand('npm', ['run', 'dev'], '.', 'Сайт');

  // Обработка завершения процесса
  process.on('SIGINT', () => {
    console.log(colors.bold('\nЗавершение всех процессов...'));
    server.kill();
    adminPanel.kill();
    website.kill();
  });
}, 3000);

console.log(colors.bold('Для завершения нажмите Ctrl+C')); 