const express = require('express');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, Raspberry Pi!');
});

app.post('/system/date', (req, res) => {
  const { date } = req.body || {};

  if (!date) {
    return res.status(400).json({ error: 'date is required' });
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return res.status(400).json({ error: 'invalid date format' });
  }

  const pad = (value) => value.toString().padStart(2, '0');
  const formatted = `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())} ${pad(parsed.getHours())}:${pad(parsed.getMinutes())}:${pad(parsed.getSeconds())}`;
  const command = `sudo date -s "${formatted}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({
        error: 'failed to update system date',
        details: stderr.trim() || error.message,
      });
    }

    return res.status(200).json({
      message: 'system date updated',
      stdout: stdout.trim(),
      targetDate: formatted,
    });
  });
});

app.get('/system/date', (req, res) => {
  exec('date "+%Y-%m-%d %H:%M:%S"', (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({
        error: 'failed to retrieve system date',
        details: stderr.trim() || error.message,
      });
    }

    return res.status(200).json({
      currentDate: stdout.trim(),
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
