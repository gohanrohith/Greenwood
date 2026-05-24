const path = require('path');
const fs = require('fs');

const campusCache = {};

function getCampus(slug) {
  if (campusCache[slug]) return campusCache[slug];
  const file = path.join(__dirname, '..', 'campuses', `${slug}.json`);
  if (!fs.existsSync(file)) return null;
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  campusCache[slug] = data;
  return data;
}

function getAllCampuses() {
  const dir = path.join(__dirname, '..', 'campuses');
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => getCampus(f.replace('.json', '')))
    .sort((a, b) => parseInt(a.established) - parseInt(b.established));
}

module.exports = { getCampus, getAllCampuses };
