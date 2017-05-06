const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { User } = require('./../models/user');
const { todos, populateTodos, users, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test todo text';

        request(app)
            .post('/todos')
            .send({ text })
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find({ text }).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((err) => done(err));
            });
    });

    it('should not create todo with invalid body data', (done) => {
        request(app)
            .post('/todos')
            .send({  })
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((err) => done(err));
            });
    });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    });
});

describe('GET /todos:id', () => {
    it('should return todo doc', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        var notFoundID = new ObjectID().toHexString();

        request(app)
            .get(`/todos/${notFoundID}`)
            .expect(404)
            .end(done)
    });

    it('should return 404 if non-object ids', (done) => {
        request(app)
            .get('/todos/123')
            .expect(404)
            .end(done);
    });


});

describe('DELETE /todos:id', () => {
    it('should return todo deleted doc', (done) =>{
        request(app)
            .delete(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        var notFoundID = new ObjectID().toHexString();

        request(app)
            .delete(`/todos/${notFoundID}`)
            .expect(404)
            .end(done)
    });

    it('should return 404 if non-object ids', (done) => {
        request(app)
            .delete('/todos/123')
            .expect(404)
            .end(done);
    });

});

describe('PATCH /todos:id', () => {

    it('should return todo (completed: true) updated doc', (done) => {
        var testCompleted = {
            text: 'Second test todo UPDATED', 
            completed: true
        }; 

        request(app)
            .patch(`/todos/${todos[1]._id.toHexString()}`)
            .send(testCompleted)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo).toInclude(testCompleted);
                expect(res.body.todo.completedAt).toBeA('number');
            })
            .end(done);
    });

    it('should return todo (completed: false, completedAt: null) updated doc', (done) => {
        var testNotCompleted = {
            text: 'Second test todo UPDATED UPDATED',
            completed:false
        };

        request(app)
            .patch(`/todos/${todos[1]._id.toHexString()}`)
            .send(testNotCompleted)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo).toInclude(testNotCompleted);
                expect(res.body.todo.completedAt).toBe(null);
            })
            .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        var notFoundID = new ObjectID().toHexString();

        request(app)
            .patch(`/todos/${notFoundID}`)
            .expect(404)
            .end(done)
    });

    it('should return 404 if non-object ids', (done) => {
        request(app)
            .patch('/todos/123')
            .expect(404)
            .end(done);
    });
});

describe('GET /users/me', () => {
    
    it('should return the correct user with correct token', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(users[0]._id.toHexString());
            })
            .end(done)
    });

    it('should return 401 if token is unauthorized', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth','091283oajdwi')
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual({});
            })
            .end(done)
    });
});

describe('POST /users', () => {
    it('should create a user', (done) => {
        var email = 'example@example.com'
        var password  = '123mnb!';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toExist();
                expect(res.body._id).toExist();
                expect(res.body.email).toBe(email);
            })
            .end((err) => {
                if (err) {
                    return done(err);
                }

                User.findOne({email}).then((user) => {
                    expect(user).toExist();
                    expect(user.password).toNotBe(password);
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should return validation errors if request invalid', (done) => {
        var email = 'example';
        var password = '123mnb!';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(400)
            .end(done);
    });

    it('should not create user if email in use', (done) => {
        var email = 'andrew@example.com';
        var password = '123mnb!';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(400)
            .end(done);
    });
});

describe('POST /users/login', () => {
    it('should login a existing user and return auth token', (done) => {
        request(app)
            .post('/users/login')
            .send({email: users[1].email, password: users[1].password})
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toExist();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                User.findById(users[1]._id).then((user) => {
                    expect(user.tokens[0]).toInclude({
                        access: 'auth',
                        token: res.headers['x-auth']
                    });
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should reject invalid login', (done) => {
        request(app)
            .post('/users/login')
            .send({email: users[1].email, password: 'bruh'})
            .expect(400)
            .expect((res) => {
                expect(res.headers['x-auth']).toNotExist();
            })
            .end((err) => {
                if (err) {
                    return done(err);
                }

                User.findById(users[1]._id).then((user) => {
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch((e) => done(e));
            });
    });
});