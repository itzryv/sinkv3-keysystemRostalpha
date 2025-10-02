const express = require('express');
const fs = require('fs');
const app = express();

// Load used keys from file
let usedKeys = new Set();
try {
    const data = fs.readFileSync('used-keys.json', 'utf8');
    usedKeys = new Set(JSON.parse(data));
} catch (e) {
    // File doesn't exist yet
}

function saveUsedKeys() {
    fs.writeFileSync('used-keys.json', JSON.stringify([...usedKeys]));
}

// Clean old keys every hour
setInterval(() => {
    const now = Date.now();
    const newUsedKeys = new Set();
    
    for (const key of usedKeys) {
        const keyTime = parseInt(key.split('-')[1]);
        if (now - keyTime < 90 * 60 * 1000) { // 1.5 hours
            newUsedKeys.add(key);
        }
    }
    
    usedKeys = newUsedKeys;
    saveUsedKeys();
}, 60 * 60 * 1000);

app.get('/', (req, res) => {
  const referrer = req.get('Referrer');
  
  if(!referrer || !referrer.includes('work.ink')) {
    return res.send(`
      <html>
        <head><title>Access Denied</title></head>
        <body style="background: #0f0f19; color: white; text-align: center; padding: 50px;">
          <h1>🔒 ACCESS DENIED</h1>
          <p>Complete the Workink task to access the key generator</p>
          <a href="https://work.ink/25ge/on47ur0h" style="background: #50b450; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none;">
            ✅ GO TO WORKINK TASK
          </a>
        </body>
      </html>
    `);
  }

  const key = "SINKV3-" + Date.now() + "-" + Math.random().toString(36).substr(2, 8).toUpperCase();
  
  if(usedKeys.has(key)) {
    return res.redirect('/');
  }
  
  usedKeys.add(key);
  saveUsedKeys();

  res.send(`
    <html>
      <head>
        <title>SINKV3 - Key Generated</title>
        <style>
          body { 
            background: #0f0f19; 
            color: white; 
            text-align: center; 
            padding: 50px; 
            font-family: Arial;
          }
          .key {
            font-size: 24px;
            color: #00ff88;
            margin: 20px 0;
            font-weight: bold;
          }
          .btn {
            background: #50b450;
            color: white;
            padding: 12px 25px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
          }
        </style>
      </head>
      <body>
        <h1>✅ KEY GENERATED!</h1>
        <div class="key">${key}</div>
        <button class="btn" onclick="navigator.clipboard.writeText('${key}')">📋 COPY KEY</button>
        <p>Key expires in 1.5 hours</p>
        <p><small>Return to Roblox and use this key</small></p>
      </body>
    </html>
  `);
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
