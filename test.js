const fetch = require('node-fetch');

(async () => {
  const LOCALURL = 'https://bi.meraplion.com/local';
  const response = await fetch(`${LOCALURL}/post_data/expo_push_token_register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([{
      manv: 'MR1077',
      token: 'ExponentPushToken[1234567890]',
      platform: 'android'
    }]),
  });
  const text = await response.text();
  console.log('Status:', response.status);
  console.log('Response:', text);
})();
