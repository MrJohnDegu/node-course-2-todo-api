var express = require('express');
var bodyParser = require('body-parser');

var { mongoose } = require('./db/mongoose');
var { Todo } = require('./models/todo');
var { User } = require('./models/user');

var app = express();
var port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/todos', (req, res) => {

});

app.post('/todos', (req, res) => {
    var todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status('400').send(e);
    });
});

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});


// var otherTodo = new Todo({
//     text: 'Cook dinner',
//     completed: true,
//     completedAt: 200,
// });

// otherTodo.save().then((res) => {
//     console.log('Saved todo', res);
// }, (err) => {
//     console.log('Unable to save todo');
// });

// var newUser = new User({
//     email:'    jcdeguzman88@gmail.com   ',
// });

// newUser.save().then((res) => {
//     console.log('Saved user', res);
// }, (err) => {
//     console.log('Unable to save user');
// });