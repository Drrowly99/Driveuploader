const fs = require('fs').promises;
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const path = require('path');
const process = require('process');
const {google} = require('googleapis');
const about = require('./src/about');
const contact = require('./src/contact');


app.use('/contact', contact);
app.use('/about', about);

// app.use(bodyParser.urlencoded())
// app.use(bodyParser.json())

app.use(express.urlencoded({extended: true}));
app.use(express.json()) // To parse the incoming requests with JSON payloads


const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Listening on port ${port}...`)
})


app.get('/', (req, res) => {
    res.send('working')
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