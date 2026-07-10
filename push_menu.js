// Load environment variables from .env files like Next.js does
try {
  require('@next/env').loadEnvConfig(process.cwd());
} catch (err) {
  // Fallback if not running inside Next.js context
}

const fs = require('fs');

async function pushMenu() {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error("Error: ADMIN_PASSWORD environment variable is not defined in .env.local");
    return;
  }

  console.log("Reading local menu.json...");
  const menuData = fs.readFileSync('data/menu.json', 'utf8');

  console.log("Logging into live site...");
  const loginRes = await fetch('https://www.crowncoffeebangladesh.xyz/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: adminPassword })
  });

  if (!loginRes.ok) {
    console.error("Login failed:", loginRes.status, await loginRes.text());
    return;
  }

  // Get the session cookie
  const setCookie = loginRes.headers.get('set-cookie');
  if (!setCookie) {
    console.error("No cookie returned from login");
    return;
  }

  const cookieStr = setCookie.split(';')[0]; // grab just the crown_admin=... part
  
  console.log("Pushing menu payload to live site...");
  const pushRes = await fetch('https://www.crowncoffeebangladesh.xyz/api/menu', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookieStr
    },
    body: menuData
  });

  if (!pushRes.ok) {
    console.error("Failed to push menu:", pushRes.status, await pushRes.text());
  } else {
    console.log("Success! Menu updated on live site.");
  }
}

pushMenu().catch(console.error);
