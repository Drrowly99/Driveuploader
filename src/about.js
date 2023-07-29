const express = require('express')
const app = express()

module.exports = app.get('/', (req, res)=>{
    res.status(200).send('ABOUT From about.js file')
});


module.exports = app.get('/users', (req, res) => {
    res.json('users')    
})