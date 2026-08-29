import { execSync } from 'child_process';
console.log(execSync('cat ~/.latentcode/settings.json || echo "No settings"').toString());
