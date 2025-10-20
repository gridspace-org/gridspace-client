import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const winston = require('winston');
export default winston;
