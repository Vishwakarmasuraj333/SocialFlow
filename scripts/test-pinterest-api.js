require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

async function testPinterest() {
  const token = process.env.PINTEREST_ACCESS_TOKEN;
  console.log('Token exists:', !!token);

  // 1. Test getting user account
  console.log('Fetching user account...');
  const userRes = await fetch('https://api.pinterest.com/v5/user_account', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('User account status:', userRes.status);
  const userText = await userRes.text();
  console.log('User account body:', userText);

  // 2. Test getting boards
  console.log('Fetching boards...');
  const boardsRes = await fetch('https://api.pinterest.com/v5/boards', {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Boards status:', boardsRes.status);
  const boardsText = await boardsRes.text();
  console.log('Boards body:', boardsText);
}

testPinterest().catch(console.error);
