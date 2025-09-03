import { exit } from 'process';

/**
 * Validates required environment variables
 * Exits with clear error message if any are missing
 */
function validateConfig() {
  const requiredVars = [
    'DISCORD_TOKEN',
    'DISCORD_CLIENT_ID'
  ];

  const missing = [];

  for (const envVar of requiredVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\nPlease check your .env file and ensure all required variables are set.');
    exit(1);
  }

  console.log('✅ Environment configuration validated');
}

export { validateConfig };
