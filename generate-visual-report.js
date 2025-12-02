const fs = require('fs');
const path = require('path');

const screenshotsDir = path.join(__dirname, 'selenium-tests', 'screenshots');
const outputFile = path.join(__dirname, 'visual-test-report.html');

console.log('🎨 Generating Visual Test Report...');

if (!fs.existsSync(screenshotsDir)) {
    console.error('❌ Screenshots directory not found!');
    process.exit(1);
}

const files = fs.readdirSync(screenshotsDir).filter(f => f.endsWith('.png'));

if (files.length === 0) {
    console.log('⚠️ No screenshots found to include in the report.');
}

let htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visual Test Report - Aforo</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; color: #333; }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #0092DF; border-bottom: 2px solid #eee; padding-bottom: 20px; }
        .summary { margin-bottom: 30px; padding: 15px; background: #eef9ff; border-radius: 6px; border-left: 4px solid #0092DF; }
        .screenshot-card { margin-bottom: 40px; border: 1px solid #eee; border-radius: 8px; overflow: hidden; }
        .screenshot-header { padding: 15px 20px; background: #f9f9f9; border-bottom: 1px solid #eee; font-weight: 600; display: flex; justify-content: space-between; align-items: center; }
        .screenshot-img { width: 100%; display: block; }
        .badge { background: #28a745; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
        .timestamp { color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Visual Test Report</h1>
        
        <div class="summary">
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Total Screenshots:</strong> ${files.length}</p>
        </div>

        <div class="screenshots">
`;

files.forEach(file => {
    const filePath = path.join(screenshotsDir, file);
    const bitmap = fs.readFileSync(filePath);
    const base64Image = Buffer.from(bitmap).toString('base64');
    const dataUrl = `data:image/png;base64,${base64Image}`;

    // Determine title from filename
    const title = file.replace(/-/g, ' ').replace('.png', '').replace(/\b\w/g, l => l.toUpperCase());

    htmlContent += `
            <div class="screenshot-card">
                <div class="screenshot-header">
                    <span>${title}</span>
                    <span class="badge">CAPTURED</span>
                </div>
                <img src="${dataUrl}" alt="${title}" class="screenshot-img" loading="lazy">
            </div>
    `;
});

htmlContent += `
        </div>
    </div>
</body>
</html>
`;

fs.writeFileSync(outputFile, htmlContent);
console.log(`✅ Visual report generated successfully: ${outputFile}`);
