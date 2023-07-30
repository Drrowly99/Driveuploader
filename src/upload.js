const express = require('express')
const app = express()
const multer = require('multer');
const upload = multer({ dest: 'uploads/'}); 
const uploadMiddleware = require('../src/middlewares/uploadMiddleware');
const fs = require('fs');
const mime = require('mime');


module.exports = app.get('/test', (req, res) => {
    res.send('hi');
});

module.exports = app.post('/upload', uploadMiddleware, (req, res) => {
     // Handle the uploaded files
  const files = req.files;

  // Process and store the files as required
  // For example, save the files to a specific directory using fs module
  files.forEach((file) => {
    const filePath = `uploads/${file.filename}`;
    console.log( mime.getType(filePath));
    fs.rename(file.path, filePath, (err) => {
      if (err) {
        // Handle error appropriately and send an error response
        return res.status(500).json({ error: 'Failed to store the file' });
      }
    });
  });

  // Send an appropriate response to the client
  res.status(200).json({ message: 'File upload successful' });
});
