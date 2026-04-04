const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();

const CORS_ORIGINS = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];
app.use(cors({
  origin: CORS_ORIGINS.length > 0 ? CORS_ORIGINS : false,
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

const JUDGE_API_KEY = process.env.JUDGE_API_KEY;
if (!JUDGE_API_KEY) {
  console.error('ERROR: JUDGE_API_KEY environment variable is required');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  'x-rapidapi-host': process.env.JUDGE0_HOST || 'judge0-ce.p.rapidapi.com',
  'x-rapidapi-key': JUDGE_API_KEY
};

app.get('/health', async (req, res) => {
  const healthStatus = { 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    judge0: 'unknown'
  };
  
  try {
    await axios.get(
      `${process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com'}/about`,
      { headers, timeout: 5000 }
    );
    healthStatus.judge0 = 'connected';
  } catch {
    healthStatus.judge0 = 'disconnected';
    healthStatus.status = 'degraded';
  }
  
  res.json(healthStatus);
});

app.post('/run-code', async (req, res) => {
  const {
      source_code,
      stdin,
      expected_output,
      language_id
  } = req.body;

  if (!source_code || typeof source_code !== 'string') {
    return res.status(400).json({ error: 'source_code is required' });
  }
  
  if (source_code.length > 100000) {
    return res.status(400).json({ error: 'source_code exceeds maximum length' });
  }

  if (!language_id || typeof language_id !== 'number') {
    return res.status(400).json({ error: 'language_id is required and must be a number' });
  }

  const validLanguages = [50, 54, 62, 63, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83];
  if (!validLanguages.includes(language_id)) {
    return res.status(400).json({ error: 'invalid language_id' });
  }

  try {
    const response = await axios.post(
        `${process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com'}/submissions?base64_encoded=false&wait=true&fields=stdout,stderr,compile_output,status`,
        {
          source_code,
          stdin: stdin || '',
          expected_output: expected_output || '',
          language_id
        },
        { headers, timeout: 30000 }
    );

    const { status, stdout, stderr, compile_output } = response.data;

    res.json({
      status: status.description,
      stdout,
      stderr,
      compile_output
    });
  } catch (err) {
    console.error("Error running code:", err.response?.data || err.message);
    res.status(500).json({ error: 'Code execution failed', details: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Judge0 microservice running on port ${PORT}`);
});
