const fs = require('fs');
const path = require('path');

console.log('🔄 Generating portable test report with embedded screenshots...\n');

const screenshotsDir = path.join(__dirname, 'selenium-tests', 'screenshots');
const outputFile = path.join(__dirname, 'selenium-tests', 'PORTABLE_REPORT.html');

// Get all requirement screenshots
const screenshots = {
    req1: [
        'req1-1-firstname-required.png',
        'req1-2-lastname-required.png',
        'req1-3-both-names-valid.png'
    ],
    req2: [
        'req2-1-gmail-rejected.png',
        'req2-2-company-email-accepted.png',
        'req2-3-io-email-accepted.png',
        'req2-4-empty-email-rejected.png'
    ],
    req3: [
        'req3-1-company-required.png',
        'req3-2-role-required.png',
        'req3-3-empsize-required.png',
        'req3-4-all-three-valid.png'
    ],
    req4: [
        'req4-3-uk-flag.png',
        'req4-4-no-flag.png'
    ],
    req5: [
        'req5-1-help-empty-allowed.png',
        'req5-2-help-filled-works.png'
    ],
    req6: [
        'req6-4-checkbox-enabled-valid.png'
    ],
    req7: [
        'req7-3-step1-fields-filled.png',
        'req7-3-step2-checkbox-state.png'
    ]
};

// Convert image to base64
function imageToBase64(imagePath) {
    try {
        const imageBuffer = fs.readFileSync(imagePath);
        return `data:image/png;base64,${imageBuffer.toString('base64')}`;
    } catch (error) {
        console.error(`⚠️  Error reading ${imagePath}:`, error.message);
        return '';
    }
}

// Generate embedded images
const embeddedImages = {};
let imageCount = 0;

Object.keys(screenshots).forEach(req => {
    embeddedImages[req] = screenshots[req].map(filename => {
        const filePath = path.join(screenshotsDir, filename);
        if (fs.existsSync(filePath)) {
            imageCount++;
            console.log(`✅ Embedding: ${filename}`);
            return imageToBase64(filePath);
        } else {
            console.log(`⚠️  Missing: ${filename}`);
            return '';
        }
    });
});

console.log(`\n✨ Embedded ${imageCount} screenshots\n`);

// Generate HTML with embedded images
const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Report - Organization Form</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 10px; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 5px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { font-size: 2em; margin-bottom: 10px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; padding: 30px 20px; background: #f8f9fa; }
        .stat { background: white; padding: 20px; border-radius: 10px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .stat-num { font-size: 2.5em; font-weight: bold; margin: 10px 0; }
        .passed { color: #10b981; }
        .failed { color: #ef4444; }
        .total { color: #667eea; }
        .content { padding: 20px; }
        .section { margin: 30px 0; }
        .section-title { font-size: 1.5em; color: #667eea; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 3px solid #667eea; }
        .requirement { background: white; border-radius: 12px; padding: 25px; margin: 20px 0; box-shadow: 0 3px 12px rgba(0,0,0,0.08); border-left: 5px solid; }
        .requirement.pass { border-left-color: #10b981; background: linear-gradient(to right, #d1fae5, white 20%); }
        .requirement.fail { border-left-color: #ef4444; background: linear-gradient(to right, #fee2e2, white 20%); }
        .requirement.partial { border-left-color: #f59e0b; background: linear-gradient(to right, #fef3c7, white 20%); }
        .req-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px; }
        .req-title { font-size: 1.3em; font-weight: 700; }
        .badge { padding: 6px 15px; border-radius: 20px; font-size: 0.85em; font-weight: 700; text-transform: uppercase; }
        .badge.pass { background: #10b981; color: white; }
        .badge.fail { background: #ef4444; color: white; }
        .badge.partial { background: #f59e0b; color: white; }
        .test-stats { background: rgba(0,0,0,0.03); padding: 12px; border-radius: 8px; margin: 10px 0; font-weight: 600; }
        .screenshots { margin-top: 20px; }
        .screenshot-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; margin-top: 15px; }
        .screenshot-item { background: #f9fafb; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .screenshot-item img { width: 100%; height: auto; display: block; cursor: pointer; }
        .screenshot-caption { padding: 12px; font-size: 0.9em; background: white; font-weight: 600; }
        .lightbox { display: none; position: fixed; z-index: 9999; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); align-items: center; justify-content: center; }
        .lightbox.active { display: flex; }
        .lightbox img { max-width: 95%; max-height: 95%; border-radius: 8px; }
        .lightbox-close { position: absolute; top: 20px; right: 30px; color: white; font-size: 35px; cursor: pointer; }
        .issues { background: #fffbeb; border: 2px solid #f59e0b; border-radius: 12px; padding: 25px; margin: 30px 0; }
        .issue { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #ef4444; }
        .severity { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 0.75em; font-weight: 700; margin-left: 8px; }
        .severity.high { background: #fee2e2; color: #dc2626; }
        .severity.medium { background: #fef3c7; color: #d97706; }
        .footer { background: #1f2937; color: white; padding: 30px 20px; text-align: center; }
        @media (max-width: 768px) {
            .header h1 { font-size: 1.5em; }
            .stat-num { font-size: 2em; }
            .screenshot-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Organization Form Test Report</h1>
            <p>Complete Test Results with Visual Evidence</p>
            <p style="font-size: 0.9em; margin-top: 10px;">November 28, 2025</p>
        </div>
        
        <div class="stats">
            <div class="stat">
                <div style="font-size: 0.9em; color: #666;">Total Tests</div>
                <div class="stat-num total">24</div>
            </div>
            <div class="stat">
                <div style="font-size: 0.9em; color: #666;">Passed</div>
                <div class="stat-num passed">16</div>
            </div>
            <div class="stat">
                <div style="font-size: 0.9em; color: #666;">Failed</div>
                <div class="stat-num failed">8</div>
            </div>
            <div class="stat">
                <div style="font-size: 0.9em; color: #666;">Pass Rate</div>
                <div class="stat-num" style="color: #f59e0b;">67%</div>
            </div>
        </div>
        
        <div class="content">
            <!-- Requirement 1 -->
            <div class="section">
                <h2 class="section-title">✅ Requirement 1: First Name & Last Name</h2>
                <div class="requirement pass">
                    <div class="req-header">
                        <div class="req-title">Mandatory Name Validation</div>
                        <span class="badge pass">✓ Passed</span>
                    </div>
                    <div class="test-stats">📊 3 out of 3 tests passed (100%)</div>
                    <div style="margin: 15px 0; line-height: 1.8;">
                        ✅ Form blocks when First Name empty<br>
                        ✅ Form blocks when Last Name empty<br>
                        ✅ Form accepts valid name entries
                    </div>
                    <div class="screenshots">
                        <div class="screenshot-grid">
                            <div class="screenshot-item">
                                <img src="${embeddedImages.req1[0]}" onclick="openLightbox(this.src)">
                                <div class="screenshot-caption">First Name required error</div>
                            </div>
                            <div class="screenshot-item">
                                <img src="${embeddedImages.req1[1]}" onclick="openLightbox(this.src)">
                                <div class="screenshot-caption">Last Name required error</div>
                            </div>
                            <div class="screenshot-item">
                                <img src="${embeddedImages.req1[2]}" onclick="openLightbox(this.src)">
                                <div class="screenshot-caption">Both names valid</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Requirement 2 -->
            <div class="section">
                <h2 class="section-title">✅ Requirement 2: Business Email Validation</h2>
                <div class="requirement pass">
                    <div class="req-header">
                        <div class="req-title">Email Domain Filtering</div>
                        <span class="badge pass">✓ Passed</span>
                    </div>
                    <div class="test-stats">📊 4 out of 4 tests passed (100%)</div>
                    <div style="margin: 15px 0; line-height: 1.8;">
                        ✅ Rejects @gmail.com correctly<br>
                        ✅ Accepts @company.com domains<br>
                        ✅ Accepts @business.io domains<br>
                        ✅ Blocks empty email
                    </div>
                    <div class="screenshots">
                        <div class="screenshot-grid">
                            <div class="screenshot-item">
                                <img src="${embeddedImages.req2[0]}" onclick="openLightbox(this.src)">
                                <div class="screenshot-caption">Gmail correctly rejected</div>
                            </div>
                            <div class="screenshot-item">
                                <img src="${embeddedImages.req2[1]}" onclick="openLightbox(this.src)">
                                <div class="screenshot-caption">Business email accepted</div>
                            </div>
                            <div class="screenshot-item">
                                <img src="${embeddedImages.req2[2]}" onclick="openLightbox(this.src)">
                                <div class="screenshot-caption">.io domain accepted</div>
                            </div>
                            <div class="screenshot-item">
                                <img src="${embeddedImages.req2[3]}" onclick="openLightbox(this.src)">
                                <div class="screenshot-caption">Empty email rejected</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Requirement 3 -->
            <div class="section">
                <h2 class="section-title">✅ Requirement 3: Business Information</h2>
                <div class="requirement pass">
                    <div class="req-header">
                        <div class="req-title">Company, Role & Employee Size</div>
                        <span class="badge pass">✓ Passed</span>
                    </div>
                    <div class="test-stats">📊 4 out of 4 tests passed (100%)</div>
                    <div style="margin: 15px 0; line-height: 1.8;">
                        ✅ Company field required<br>
                        ✅ Role field required<br>
                        ✅ Employee Size required<br>
                        ✅ All three fields validated
                    </div>
                    <div class="screenshots">
                        <div class="screenshot-grid">
                            <div class="screenshot-item">
                                <img src="${embeddedImages.req3[0]}" onclick="openLightbox(this.src)">
                                <div class="screenshot-caption">Company required error</div>
                            </div>
                            <div class="screenshot-item">
                                <img src="${embeddedImages.req3[1]}" onclick="openLightbox(this.src)">
                                <div class="screenshot-caption">Role required error</div>
                            </div>
                            <div class="screenshot-item">
                                <img src="${embeddedImages.req3[2]}" onclick="openLightbox(this.src)">
                                <div class="screenshot-caption">Employee Size required</div>
                            </div>
                            <div class="screenshot-item">
                                <img src="${embeddedImages.req3[3]}" onclick="openLightbox(this.src)">
                                <div class="screenshot-caption">All fields valid</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Requirement 4 -->
            <div class="section">
                <h2 class="section-title">⚠️ Requirement 4: Country Flag Icons</h2>
                <div class="requirement partial">
                    <div class="req-header">
                        <div class="req-title">Flag Display</div>
                        <span class="badge partial">⚠ Partial</span>
                    </div>
                    <div class="test-stats">📊 2 out of 4 tests passed (50%) - BUG FOUND</div>
                    <div style="margin: 15px 0; line-height: 1.8;">
                        ❌ India shows wrong flag (Argentina)<br>
                        ❌ US shows wrong flag (Australia)<br>
                        ✅ UK flag correct<br>
                        ✅ No flag when not selected<br>
                        <strong style="color: #d97706;">🐛 Bug: Flag mapping incorrect</strong>
                    </div>
                    <div class="screenshots">
                        <div class="screenshot-grid">
                            <div class="screenshot-item">
                                <img src="${embeddedImages.req4[0]}" onclick="openLightbox(this.src)">
                                <div class="screenshot-caption">UK flag correct ✅</div>
                            </div>
                            <div class="screenshot-item">
                                <img src="${embeddedImages.req4[1]}" onclick="openLightbox(this.src)">
                                <div class="screenshot-caption">No flag without selection ✅</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Requirement 5 -->
            <div class="section">
                <h2 class="section-title">✅ Requirement 5: Optional Help Field</h2>
                <div class="requirement pass">
                    <div class="req-header">
                        <div class="req-title">"How can we help you?"</div>
                        <span class="badge pass">✓ Passed</span>
                    </div>
                    <div class="test-stats">📊 2 out of 2 tests passed (100%)</div>
                    <div style="margin: 15px 0; line-height: 1.8;">
                        ✅ Empty help field allowed<br>
                        ✅ Filled help field works
                    </div>
                    <div class="screenshots">
                        <div class="screenshot-grid">
                            <div class="screenshot-item">
                                <img src="${embeddedImages.req5[0]}" onclick="openLightbox(this.src)">
                                <div class="screenshot-caption">Empty help allowed</div>
                            </div>
                            <div class="screenshot-item">
                                <img src="${embeddedImages.req5[1]}" onclick="openLightbox(this.src)">
                                <div class="screenshot-caption">Filled help works</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Requirement 6 -->
            <div class="section">
                <h2 class="section-title">❌ Requirement 6: Terms Checkbox State</h2>
                <div class="requirement fail">
                    <div class="req-header">
                        <div class="req-title">Checkbox Disabled Until Valid</div>
                        <span class="badge fail">✗ Failed</span>
                    </div>
                    <div class="test-stats">📊 1 out of 4 tests passed (25%) - FEATURE MISSING</div>
                    <div style="margin: 15px 0; line-height: 1.8;">
                        ❌ Checkbox NOT disabled on empty form<br>
                        ❌ Checkbox NOT disabled with partial data<br>
                        ❌ Checkbox NOT disabled with invalid email<br>
                        ✅ Checkbox enabled when all valid<br>
                        <strong style="color: #ef4444;">🚧 Missing: Checkbox state management</strong>
                    </div>
                    <div class="screenshots">
                        <div class="screenshot-grid">
                            <div class="screenshot-item">
                                <img src="${embeddedImages.req6[0]}" onclick="openLightbox(this.src)">
                                <div class="screenshot-caption">Checkbox state (only passing test)</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Requirement 7 -->
            <div class="section">
                <h2 class="section-title">❌ Requirement 7: Submit Button Control</h2>
                <div class="requirement fail">
                    <div class="req-header">
                        <div class="req-title">Button Disabled Until Terms Checked</div>
                        <span class="badge fail">✗ Failed</span>
                    </div>
                    <div class="test-stats">📊 0 out of 3 tests passed (0%) - FEATURE MISSING</div>
                    <div style="margin: 15px 0; line-height: 1.8;">
                        ❌ Button NOT disabled when unchecked<br>
                        ❌ Button state control missing<br>
                        ❌ End-to-end workflow incomplete<br>
                        <strong style="color: #ef4444;">🚧 Missing: Button activation logic</strong>
                    </div>
                    <div class="screenshots">
                        <div class="screenshot-grid">
                            <div class="screenshot-item">
                                <img src="${embeddedImages.req7[0]}" onclick="openLightbox(this.src)">
                                <div class="screenshot-caption">Step 1: Fields filled</div>
                            </div>
                            <div class="screenshot-item">
                                <img src="${embeddedImages.req7[1]}" onclick="openLightbox(this.src)">
                                <div class="screenshot-caption">Step 2: Checkbox state</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Issues -->
            <div class="section">
                <h2 class="section-title">⚠️ Issues & Recommendations</h2>
                <div class="issues">
                    <h3 style="margin-bottom: 20px; font-size: 1.3em;">🐛 Bugs (1)</h3>
                    <div class="issue">
                        <div style="font-weight: 700; margin-bottom: 8px;">
                            BUG-001: Country Flag Mapping
                            <span class="severity medium">Medium</span>
                        </div>
                        <div style="line-height: 1.8; color: #555;">
                            <strong>Issue:</strong> India/US show wrong flags<br>
                            <strong>Fix Time:</strong> ~2 hours<br>
                            <strong>Action:</strong> Review flag mapping in CountrySelector
                        </div>
                    </div>
                    
                    <h3 style="margin: 30px 0 20px 0; font-size: 1.3em;">🚧 Missing Features (2)</h3>
                    <div class="issue">
                        <div style="font-weight: 700; margin-bottom: 8px;">
                            FEAT-001: Terms Checkbox State
                            <span class="severity high">High</span>
                        </div>
                        <div style="line-height: 1.8; color: #555;">
                            <strong>Required:</strong> Disable checkbox until form valid<br>
                            <strong>Fix Time:</strong> ~4 hours<br>
                            <strong>Priority:</strong> High - Implement before production
                        </div>
                    </div>
                    <div class="issue">
                        <div style="font-weight: 700; margin-bottom: 8px;">
                            FEAT-002: Submit Button Control
                            <span class="severity high">High</span>
                        </div>
                        <div style="line-height: 1.8; color: #555;">
                            <strong>Required:</strong> Disable button until Terms checked<br>
                            <strong>Fix Time:</strong> ~2 hours<br>
                            <strong>Priority:</strong> Critical - Legal compliance issue
                        </div>
                    </div>
                    
                    <div style="margin-top: 25px; padding: 20px; background: white; border-radius: 10px; border-left: 4px solid #667eea;">
                        <strong style="font-size: 1.1em;">💡 Summary</strong><br>
                        <div style="margin-top: 10px; line-height: 1.8;">
                            Total Fix Time: <strong>~8 hours</strong><br>
                            Priority: <strong>HIGH</strong><br>
                            Recommendation: Implement missing features before production release
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Test Environment</strong></p>
            <p>Chrome 143.0 | Selenium 4.38.0 | Node.js v22.12.0</p>
            <p style="margin-top: 15px; opacity: 0.8;">November 28, 2025 at 15:30 IST</p>
        </div>
    </div>
    
    <div class="lightbox" id="lightbox" onclick="closeLightbox()">
        <span class="lightbox-close">&times;</span>
        <img id="lightbox-img" src="">
    </div>
    
    <script>
        function openLightbox(src) {
            document.getElementById('lightbox').classList.add('active');
            document.getElementById('lightbox-img').src = src;
        }
        function closeLightbox() {
            document.getElementById('lightbox').classList.remove('active');
        }
        document.addEventListener('keydown', e => e.key === 'Escape' && closeLightbox());
    </script>
</body>
</html>`;

// Write the file
fs.writeFileSync(outputFile, html);

console.log(`\n✅ SUCCESS! Portable report created:\n`);
console.log(`   📄 ${outputFile}\n`);
console.log(`📱 This file works on ANY device - phone, tablet, laptop!`);
console.log(`📸 All ${imageCount} screenshots are embedded inside the HTML file.\n`);
