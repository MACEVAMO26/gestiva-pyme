const fs = require('fs');
const path = require('path');

const ids = [
  'd62284cb-462b-4ba3-ac63-23b4e8535d50',
  'c03dcc4d-b235-4b4a-a61c-8f199eae8ff1',
  '9fea4d07-298c-4fac-bc65-fff2c20cd5ef',
  '2a51e873-fc03-414a-a4e1-91f6070cfefa',
  '87b594cb-67a6-46e0-be31-967f6ea021f0'
];

let finalHtml = '';
let finalScss = '';

ids.forEach((id, index) => {
  const logPath = \C:\\\\Users\\\\EVIAN\\\\.gemini\\\\antigravity\\\\brain\\\\\\\\\.system_generated\\\\logs\\\\transcript.jsonl\;
  if (!fs.existsSync(logPath)) {
    console.error('Log not found for subagent ' + index + ' ' + id);
    return;
  }
  
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\\n').filter(l => l.trim() !== '');
  
  let modelContent = '';
  for (let i = lines.length - 1; i >= 0; i--) {
    const entry = JSON.parse(lines[i]);
    if (entry.source === 'MODEL' && entry.content) {
      modelContent = entry.content;
      break;
    }
  }
  
  if (!modelContent) {
    console.error('No model content found for subagent ' + index);
    return;
  }
  
  const htmlMatch = modelContent.match(/\\\html([\\s\\S]*?)\\\/);
  if (htmlMatch) {
    finalHtml += htmlMatch[1].trim() + '\\n';
  } else {
    console.error('No HTML block found for subagent ' + index);
  }
  
  const scssMatch = modelContent.match(/\\\scss([\\s\\S]*?)\\\/);
  if (scssMatch) {
    finalScss += scssMatch[1].trim() + '\\n\\n';
  } else {
    console.error('No SCSS block found for subagent ' + index);
  }
});

fs.writeFileSync('C:\\\\Users\\\\EVIAN\\\\Documents\\\\SENA\\\\APLICATIVO\\\\GESTIVAPYME\\\\frontend\\\\src\\\\app\\\\pages\\\\saas-admin\\\\saas-admin.component.html', finalHtml);
fs.writeFileSync('C:\\\\Users\\\\EVIAN\\\\Documents\\\\SENA\\\\APLICATIVO\\\\GESTIVAPYME\\\\scratch\\\\saas-admin-new-classes.scss', finalScss);
console.log('Successfully stitched HTML and SCSS!');
