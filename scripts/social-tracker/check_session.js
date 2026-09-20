const fs = require('fs');
const path = require('path');

const sessionPath = path.join(__dirname, 'twitter_session.json');
if (fs.existsSync(sessionPath)) {
  const session = JSON.parse(fs.readFileSync(sessionPath, 'utf-8'));
  const auth = session.cookies?.find(c => c.name === 'auth_token');
  const ct0 = session.cookies?.find(c => c.name === 'ct0');
  console.log('Session file valid:', true);
  console.log('Cookies count:', session.cookies?.length);
  console.log('Auth token found:', !!auth);
  console.log('CT0 token found:', !!ct0);
} else {
  console.log('Session file not found!');
}
