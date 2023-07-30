const fs = require('fs').promises;
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const path = require('path');
const process = require('process');

const {google} = require('googleapis');
const googledrive = require('./src/google');
const upload_ = require('./src/upload');
const mime = require('mime');  //mime.getType(file_path)



app.use('/upload', upload_);
app.use('/google', googledrive);

app.use(express.urlencoded({extended: true}));
app.use(express.json()) // To parse the incoming requests with JSON payloads




// Express Middleware for serving static files
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
    res.redirect('view/index.html');
});

app.get('/up', function(req, res) {
    res.redirect('view/upload2.html');
});




const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Listening on port ${port}...`)
})





















app.get('/users', (req, res) => {
    res.json(users)    
})


app.get('/users/:id', (req, res) => {
    if (users[req.params.id]){
          res.json(users[req.params.id])
    } else {
          res.json('User not found')
    }
})



//PUT USER
app.put('/users', (req, res) => {
    if (req.body.name && req.body.age){
         const {name, age} = req.body
         users[id] = {name, age}
         res.send(`Successfully created user with id: ${id}`)
         id++
    } else {
         res.send('Failed to create user')
    }
})


// PATCH USER
app.patch('/users', (req, res) => {
    if (users[req.body.id]){
          let user = users[req.body.id]
          user.name = req.body.name || user.name
          user.age = req.body.age || user.age
          res.json(user)
    } else {
          res.json('Failed to update or find user with that id.')
    }
})


const users = {
    0: {name: 'Bill', age: 29},
    1: {name: 'Jill', age: 32},
    2: {name: 'Will', age: 47}
}
let id = 3