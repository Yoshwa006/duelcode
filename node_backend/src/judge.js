const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const headers = {
  'Content-Type': 'application/json',
  'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
  'x-rapidapi-key': "93f1e2c382mshae6d1f9ec604c67p14e8c3jsn7a4ef97c4287"
};

app.post('/run-code', async (req, res) => {

  const {
      source_code,
      stdin,
      expected_output,
      language_id
  } = req.body;

  try {
    const response = await axios.post(   // compiling code using judge0
        `https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true&fields=stdout,stderr,compile_output,status`,
        {
          source_code,
          stdin,
          expected_output,
          language_id
        },
        { headers }
    );

    const { status, stdout, stderr, compile_output } = response.data;

    console.log("Judge0 Status:", status.description);
    console.log("Stdout:", stdout);
    console.log("Stderr:", stderr);
    console.log("Compile Output:", compile_output);

    res.json({ //sending result to java
      status: status.description,
      stdout,
      stderr,
      compile_output
    });
  } catch (err) {
    console.error("Error running code:", err.response?.data || err.message);
    res.status(500).json({ error: 'Code execution failed' });
  }
});

app.listen(3001, () => {
  console.log('Judge0 microservice running on port 3001');
  // console.log("Api key is", process.env.JUDGE_API_KEY && process.env.JUDGE0_URL ? "is there" : "is not there")
});
