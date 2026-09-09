const path = require('path');

const registryPath = path.join(__dirname, '..', 'assets', 'data', 'portfolio-data.js');
const requiredServices = new Set(['websites', 'systems', 'branding', 'social', 'campaigns', 'automation']);

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exitCode = 1;
}

function warn(message) {
  console.warn(`WARN: ${message}`);
}

let registry;
try {
  delete globalThis.CAMBM_PORTFOLIO;
  delete require.cache[require.resolve(registryPath)];
  require(registryPath);
  registry = globalThis.CAMBM_PORTFOLIO;
} catch (error) {
  fail(`Could not read ${registryPath}: ${error.message}`);
  process.exit();
}

if (!registry || !Array.isArray(registry.projects)) {
  fail('Registry must contain a projects array.');
  process.exit();
}

const seen = new Set();
registry.projects.forEach((project, index) => {
  const label = project && project.id ? project.id : `record ${index + 1}`;
  if (!project || typeof project !== 'object') {
    fail(`Project ${index + 1} is not an object.`);
    return;
  }
  if (!project.id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.id)) {
    fail(`${label} needs a lowercase kebab-case id.`);
  } else if (seen.has(project.id)) {
    fail(`Duplicate project id: ${project.id}.`);
  } else {
    seen.add(project.id);
  }
  if (!project.brand) fail(`${label} is missing brand.`);
  if (!project.translationPrefix) fail(`${label} is missing translationPrefix.`);
  if (!Array.isArray(project.services) || project.services.length === 0) {
    warn(`${label} has no services and will render as Other.`);
  } else {
    project.services.forEach((service) => {
      if (!requiredServices.has(service)) warn(`${label} uses unknown service: ${service}.`);
    });
  }
  if (!project.location || !project.location.country || !Array.isArray(project.location.countryPosition)) {
    warn(`${label} has no valid country-level map position and will be omitted from the map.`);
  }
  if (!project.logo) warn(`${label} has no brand logo and will use a monogram.`);
});

if (!process.exitCode) {
  console.log(`Portfolio registry valid: ${registry.projects.length} projects, ${seen.size} unique IDs.`);
}
