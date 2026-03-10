#!/usr/bin/env node

import fs from 'fs/promises';
import chalk from 'chalk';

const AUDIT_JSON = 'data/audit-report.json';
const OUTPUT_HTML = 'data/audit-report.html';

/**
 * Main function
 */
async function main() {
  console.log(chalk.bold.cyan('\n📊 Generating Visual Report\n'));

  // Load audit report
  console.log(chalk.blue('📂 Loading audit report...'));
  const audit = await loadAuditReport();
  console.log(chalk.green(`✓ Loaded report with ${audit.variant_groups.length} variant groups\n`));

  // Generate HTML
  console.log(chalk.blue('🎨 Generating HTML...'));
  const html = generateHTML(audit);

  // Save HTML
  console.log(chalk.blue('💾 Saving HTML report...'));
  await fs.writeFile(OUTPUT_HTML, html, 'utf-8');
  console.log(chalk.green(`✓ Report saved to ${OUTPUT_HTML}\n`));

  console.log(chalk.cyan('Next step: Open data/audit-report.html in your browser\n'));
}

/**
 * Load audit report
 */
async function loadAuditReport() {
  const content = await fs.readFile(AUDIT_JSON, 'utf-8');
  return JSON.parse(content);
}

/**
 * Generate HTML report
 */
function generateHTML(audit) {
  const variantGroupsHTML = audit.variant_groups
    .map(group => generateVariantGroupCard(group))
    .join('\n');

  const issuesHTML = audit.issues
    .filter(issue => issue.type === 'number_collision')
    .map(issue => generateIssueCard(issue))
    .join('\n');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Variant Groups Audit Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0a;
      color: #e0e0e0;
      padding: 20px;
      line-height: 1.6;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
    }

    h1 {
      font-size: 2rem;
      margin-bottom: 10px;
      color: #fff;
    }

    .summary {
      background: #1a1a1a;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
      border-left: 4px solid #6366f1;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }

    .summary-item {
      background: #0a0a0a;
      padding: 15px;
      border-radius: 6px;
    }

    .summary-label {
      font-size: 0.85rem;
      color: #888;
      margin-bottom: 5px;
    }

    .summary-value {
      font-size: 1.5rem;
      font-weight: 600;
      color: #fff;
    }

    .summary-value.warning {
      color: #f59e0b;
    }

    .section {
      margin-bottom: 40px;
    }

    .section-title {
      font-size: 1.5rem;
      margin-bottom: 20px;
      color: #fff;
      border-bottom: 2px solid #333;
      padding-bottom: 10px;
    }

    .variant-group-card {
      background: #1a1a1a;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      border: 1px solid #333;
    }

    .variant-group-card.has-issues {
      border-left: 4px solid #f59e0b;
    }

    .group-header {
      margin-bottom: 15px;
    }

    .group-name {
      font-size: 1.2rem;
      font-weight: 600;
      color: #6366f1;
      margin-bottom: 5px;
    }

    .group-prompt {
      font-size: 0.9rem;
      color: #888;
      margin-bottom: 10px;
    }

    .group-meta {
      display: flex;
      gap: 15px;
      font-size: 0.85rem;
      color: #666;
    }

    .variants-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }

    .variant-item {
      background: #0a0a0a;
      border-radius: 6px;
      padding: 10px;
      border: 2px solid #333;
      transition: border-color 0.2s;
    }

    .variant-item:hover {
      border-color: #6366f1;
    }

    .variant-item.suspicious {
      border-color: #f59e0b;
    }

    .variant-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: 4px;
      margin-bottom: 10px;
      background: #000;
    }

    .variant-info {
      font-size: 0.8rem;
    }

    .variant-filename {
      color: #fff;
      font-weight: 500;
      margin-bottom: 5px;
      word-break: break-all;
    }

    .variant-meta {
      color: #666;
      margin-bottom: 3px;
    }

    .variant-index {
      display: inline-block;
      background: #6366f1;
      color: #fff;
      padding: 2px 8px;
      border-radius: 3px;
      font-size: 0.75rem;
      font-weight: 600;
      margin-top: 5px;
    }

    .variant-index.missing {
      background: #ef4444;
    }

    .issues-list {
      background: #1a1a1a;
      border-radius: 8px;
      padding: 20px;
      border-left: 4px solid #f59e0b;
    }

    .issue-item {
      background: #0a0a0a;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 15px;
      border: 1px solid #333;
    }

    .issue-title {
      font-weight: 600;
      color: #f59e0b;
      margin-bottom: 10px;
    }

    .issue-details {
      font-size: 0.9rem;
      color: #888;
      white-space: pre-wrap;
      font-family: 'Courier New', monospace;
    }

    .badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      margin-right: 5px;
    }

    .badge-warning {
      background: #f59e0b;
      color: #000;
    }

    .badge-error {
      background: #ef4444;
      color: #fff;
    }

    .badge-info {
      background: #6366f1;
      color: #fff;
    }

    .checkbox-container {
      margin-top: 10px;
      padding: 10px;
      background: #1a1a1a;
      border-radius: 4px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      color: #ef4444;
      font-weight: 500;
    }

    .checkbox-label input {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .export-button {
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: #6366f1;
      color: #fff;
      border: none;
      padding: 15px 30px;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
      transition: all 0.2s;
    }

    .export-button:hover {
      background: #4f46e5;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(99, 102, 241, 0.6);
    }

    .export-button:active {
      transform: translateY(0);
    }

    .marked-count {
      position: fixed;
      bottom: 30px;
      left: 30px;
      background: #1a1a1a;
      color: #fff;
      padding: 15px 25px;
      border-radius: 8px;
      font-weight: 600;
      border: 2px solid #6366f1;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔍 Variant Groups Audit Report</h1>
    <p style="color: #888; margin-bottom: 30px;">Generated: ${audit.generated_at}</p>

    <div class="summary">
      <h2 style="margin-bottom: 15px;">Summary</h2>
      <div class="summary-grid">
        <div class="summary-item">
          <div class="summary-label">Total Entries</div>
          <div class="summary-value">${audit.total_entries}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Variant Groups</div>
          <div class="summary-value">${audit.variant_groups_count}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Single Images</div>
          <div class="summary-value">${audit.single_images_count}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Issues Found</div>
          <div class="summary-value warning">${audit.issues.length}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">⚠️ Number Collisions (${audit.issues.filter(i => i.type === 'number_collision').length})</h2>
      <div class="issues-list">
        ${issuesHTML}
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">📦 Variant Groups (${audit.variant_groups.length})</h2>
      ${variantGroupsHTML}
    </div>
  </div>

  <div class="marked-count" id="markedCount">
    Marked for removal: <span id="count">0</span>
  </div>

  <button class="export-button" onclick="exportManifest()">
    Export Cleanup Manifest
  </button>

  <script>
    const markedVariants = new Set();

    function toggleVariant(groupName, variantId, url, hash) {
      const key = groupName + '|' + variantId;
      if (markedVariants.has(key)) {
        markedVariants.delete(key);
      } else {
        markedVariants.add(key);
      }
      updateCount();
    }

    function updateCount() {
      document.getElementById('count').textContent = markedVariants.size;
    }

    function exportManifest() {
      const actions = [];
      markedVariants.forEach(key => {
        const [groupName, variantId] = key.split('|');
        const checkbox = document.querySelector(\`input[data-key="\${key}"]\`);
        const url = checkbox.dataset.url;
        const hash = checkbox.dataset.hash;
        
        actions.push({
          action: 'remove_variant',
          variant_group: groupName,
          image_id: variantId,
          url: url,
          hash: hash,
          reason: 'User marked as incorrect',
          marked_by: 'user'
        });
      });

      const manifest = {
        version: '1.0',
        created_at: new Date().toISOString(),
        total_actions: actions.length,
        actions: actions
      };

      const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cleanup-manifest.json';
      a.click();
      URL.revokeObjectURL(url);

      alert(\`Exported \${actions.length} actions to cleanup-manifest.json\`);
    }
  </script>
</body>
</html>`;
}

/**
 * Generate variant group card HTML
 */
function generateVariantGroupCard(group) {
  const hasIssues = group.issues.length > 0;
  const issuesBadges = group.issues.map(issue => 
    `<span class="badge badge-warning">${issue.type.replace('_', ' ')}</span>`
  ).join('');

  const variantsHTML = group.variants.map(variant => {
    const imageNumber = variant.image_number;
    const isSuspicious = group.variants.filter(v => v.image_number === imageNumber).length > 1 ||
                         variant.image_number !== group.variants[0]?.image_number;
    
    return `
      <div class="variant-item ${isSuspicious ? 'suspicious' : ''}">
        <img src="../${variant.url}" alt="${variant.url}" class="variant-image" loading="lazy">
        <div class="variant-info">
          <div class="variant-filename">${variant.url.split('/').pop()}</div>
          <div class="variant-meta">Model: ${variant.model}</div>
          <div class="variant-meta">Number: ${variant.image_number}</div>
          <span class="variant-index ${variant.variant_index === 0 ? '' : ''}">#${variant.variant_index}</span>
          ${isSuspicious ? '<span class="badge badge-warning">⚠️ Suspicious</span>' : ''}
        </div>
        <div class="checkbox-container">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              data-key="${group.variant_group}|${variant.id}"
              data-url="${variant.url}"
              data-hash="${variant.hash}"
              onchange="toggleVariant('${group.variant_group}', '${variant.id}', '${variant.url}', '${variant.hash}')"
            >
            Mark for removal
          </label>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="variant-group-card ${hasIssues ? 'has-issues' : ''}">
      <div class="group-header">
        <div class="group-name">${group.variant_group}</div>
        <div class="group-prompt">${group.prompt}</div>
        <div class="group-meta">
          <span><span class="badge badge-info">${group.category}</span></span>
          <span>Variants: ${group.variant_count}</span>
          ${issuesBadges}
        </div>
      </div>
      <div class="variants-grid">
        ${variantsHTML}
      </div>
    </div>
  `;
}

/**
 * Generate issue card HTML
 */
function generateIssueCard(issue) {
  return `
    <div class="issue-item">
      <div class="issue-title">${issue.message}</div>
      <div class="issue-details">${issue.details || ''}</div>
    </div>
  `;
}

// Run
main().catch(error => {
  console.error(chalk.red('\n❌ Error:'), error);
  process.exit(1);
});
