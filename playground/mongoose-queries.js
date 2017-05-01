const { ObjectID } = require('mongodb');

const { mongoose } = require('./../server/db/mongoose');
const { Todo } = require('./../server/models/todo');
const { User } = require('./../server/models/user');

// var id = '59074d3b194cdc240c8eeca11';

// if (!ObjectID.isValid(id)) {
//     return console.log('ID not valid');
// }

// Todo.find({
//     _id: id
// }).then((todos) => {
//     console.log('Todos', todos);
// }).catch((e) => console.log(e));

// Todo.findOne({
//     _id: id
// }).then((todo) => {
//     console.log('Todo', todo);
// }).catch((e) => console.log(e));

// Todo.findById(id).then((todo) => {
//     if (!todo) {
//         return console.log('Id not found');
//     }

//     console.log('Todo By Id', todo);
// }).catch((e) => console.log(e));

User.findById('59072911db3f132f8058791e').then((user) => {
    if (!user) {
        return console.log('Unable to find user');
    }

    console.log(JSON.stringify(user, undefined, 2));
}, (e) => {
    console.log(e);
});