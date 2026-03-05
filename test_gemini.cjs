require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;

async function testGemini() {
  console.log('Testing Gemini API...');
  console.log('API Key:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'NOT FOUND');
  
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
  
  console.log('\nSending request to:', url.replace(API_KEY, 'HIDDEN'));
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Say hello in Thai'
          }]
        }]
      })
    });
    
    console.log('Response status:', response.status, response.statusText);
    
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testGemini();
