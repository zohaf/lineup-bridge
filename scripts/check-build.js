// Stops the build (and so the deploy) if the built CSS is broken.
//
// 2026-11-10: a package update (postcss-selector-parser 7.2.0) escaped CSS-module class names twice
// (`Sy\+LF` became `Sy\\\+LF`), so those style rules matched nothing and live lost its layout. The
// build itself reported success. This check catches that kind of output before it is deployed.
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'build', 'static', 'css');
const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.css')) : [];
if (!files.length) {
  console.error(`check-build: no CSS files in ${dir}`);
  process.exit(1);
}

// A class name escaped twice: two backslashes followed by an escaped character.
const doubleEscaped = /\\\\\\[^\\]/g;
const problems = files
  .map(f => [f, (fs.readFileSync(path.join(dir, f), 'utf8').match(doubleEscaped) || []).length])
  .filter(([, n]) => n > 0);

if (problems.length) {
  console.error(
    'check-build: double-escaped class names in the built CSS; deploying would break the layout.'
  );
  problems.forEach(([f, n]) => console.error(`  ${f}: ${n}`));
  process.exit(1);
}
console.log(`check-build: ${files.length} CSS files OK`);
