// This script ensures the classic theme is correctly applied and debugs any theme issues

// Set the theme to classic in localStorage
localStorage.setItem('uiTheme', 'classic');

// Apply the theme classes to the HTML and body elements directly
document.documentElement.classList.remove('theme-futuristic');
document.documentElement.classList.add('theme-classic');
document.body.classList.remove('theme-futuristic');
document.body.classList.add('theme-classic');

// Force a reload to ensure the theme is applied from the beginning
// window.location.reload();

console.log('Theme set to classic');
console.log('Current HTML classes:', document.documentElement.className);
console.log('Current BODY classes:', document.body.className);

// Check if theme-specific styles are being applied correctly
const themeClassicElements = document.querySelectorAll('.theme-classic');
console.log('Number of elements with .theme-classic class:', themeClassicElements.length);

// Debug information about loaded stylesheets
const stylesheets = Array.from(document.styleSheets);
console.log('Loaded stylesheets:', stylesheets.map(sheet => sheet.href));

// Display debug panel
const debugDiv = document.createElement('div');
debugDiv.style.position = 'fixed';
debugDiv.style.top = '10px';
debugDiv.style.right = '10px';
debugDiv.style.backgroundColor = 'rgba(0,0,0,0.8)';
debugDiv.style.color = 'white';
debugDiv.style.padding = '10px';
debugDiv.style.zIndex = '9999';
debugDiv.style.borderRadius = '5px';
debugDiv.style.maxWidth = '400px';
debugDiv.style.overflow = 'auto';
debugDiv.style.maxHeight = '300px';
debugDiv.innerHTML = `
  <h3>Theme Debug Info</h3>
  <p>Current theme: ${localStorage.getItem('uiTheme')}</p>
  <p>HTML classes: ${document.documentElement.className}</p>
  <p>BODY classes: ${document.body.className}</p>
  <p>Elements with theme-classic: ${themeClassicElements.length}</p>
  <button id="forceClassic">Force Classic Theme</button>
`;
document.body.appendChild(debugDiv);

// Add event listener for the force classic button
document.getElementById('forceClassic').addEventListener('click', () => {
  localStorage.setItem('uiTheme', 'classic');
  window.location.reload();
});
