// watch-themes.js
import { exec } from 'child_process';
import { watch } from 'fs';
import path from 'path';

// Function to execute a command
function execCommand(command) {
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing command: ${error.message}`);
      return;
    }
    if (stderr) {
      console.warn(`Command warning: ${stderr}`);
    }
    console.log(stdout);
  });
}

// Watch classic theme files
console.log('Watching Classic theme files...');
watch(path.join(process.cwd(), 'src', 'themes', 'classic'), { recursive: true }, (eventType, filename) => {
  if (filename.endsWith('.jsx') || filename.endsWith('.js')) {
    console.log(`Classic theme file changed: ${filename}`);
    execCommand('npm run build:css:classic');
  }
});

// Watch futuristic theme files
console.log('Watching Futuristic theme files...');
watch(path.join(process.cwd(), 'src', 'themes', 'futuristic'), { recursive: true }, (eventType, filename) => {
  if (filename.endsWith('.jsx') || filename.endsWith('.js')) {
    console.log(`Futuristic theme file changed: ${filename}`);
    execCommand('npm run build:css:futuristic');
  }
});

// Watch tailwind config files
console.log('Watching Tailwind config files...');
watch(process.cwd(), { recursive: false }, (eventType, filename) => {
  if (filename === 'tailwind.classic.config.js') {
    console.log('Classic theme config changed');
    execCommand('npm run build:css:classic');
  } else if (filename === 'tailwind.futuristic.config.js') {
    console.log('Futuristic theme config changed');
    execCommand('npm run build:css:futuristic');
  }
});

console.log('Theme watcher started! Watching for changes...');
