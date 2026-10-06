const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const previewTokenValue = process.env.PREVIEW_TOKEN || process.env.PREVIEW_SECRET || 'change-me-to-a-long-random-string';

const clientOriginVal = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const allowedOriginsArr = clientOriginVal.split(',').map(s => s.trim());

const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigin: clientOriginVal,
  allowedOrigins: allowedOriginsArr,
  pagePilotApi: process.env.PAGEPILOT_API || 'https://pagepilot.fabbuilder.com/api/tenant/6336128a251dcbda38bd8fe1',
  mongoUri: process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb+srv://ksawle1515_db_user:Wa8vHywtvOvmE06p@cluster0.q3sqraz.mongodb.net/pagepilot_mern_db',
  previewToken: previewTokenValue,
  previewSecret: previewTokenValue,
  cacheTtlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '300', 10),
  headerMenuName: process.env.PAGEPILOT_HEADER_MENU || 'Navigation menu',
};

module.exports = config;
