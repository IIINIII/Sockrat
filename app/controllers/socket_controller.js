var dataValidator = require('../helpers/io_data_validator');
var colors = require('colors');

var controller = {
    init: function (io) {
        var sockets = {};
        var users = {
            "admin": {
                "name": "Ibrokhim Shokirov",
                "username": "admin",
                "password": "123e45"
            },
            "test": {
                "name": "Chloe Parker",
                "username": "test",
                "password": "test"
            },
            "maria": {
                "name": "Maria Anderson",
                "username": "maria",
                "password": "maria"
            }
        };

        io.on('connection', function (socket) {
            var uniqueId = guidGenerator();
            var username = '';

            function checkAuth() {
                if (sockets[uniqueId] == null || !sockets[uniqueId].authenticated) {
                    logout();
                }
            }

            function logout(msg = 'Successful logout!') {
                socket.disconnect({msg: msg});
                delete sockets[uniqueId];
                delete sockets[username];
            }

            function login(usernm, passwd) {
                if (users[usernm] && users[usernm].password === passwd) {
                    sockets[uniqueId].authenticated = true;
                    sockets[uniqueId].username = usernm;
                    username = usernm;
                    sockets[usernm] = sockets[uniqueId];

                    return true;
                }

                return false;
            }

            function guidGenerator() {
                /**
                 * @return {string}
                 */
                var S4 = function () {
                    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
                };
                return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4());
            }

            console.log('[' + uniqueId.cyan + '] Client Connected! Waiting for authentication!');

            sockets[uniqueId] = {
                id: uniqueId,
                socket: socket,
                authenticated: false,
                username: '',
                authAttempt: 0
            };

            // Check authentication after 3 seconds
            setTimeout(function () {
                checkAuth(uniqueId);
            }, 5000);

            socket.on('auth', function (data, cb) {
                if (!dataValidator.isValid('auth', data)) {
                    console.log('[' + uniqueId.red + '] Invalid data for auth!');
                } else if (sockets[uniqueId] && login(data.username, data.password)) {
                    cb(true, {
                        session_id: uniqueId,
                        username: data.username
                    });

                    socket.emit('chat_msg', {
                        from: 'sys',
                        to: username,
                        msg: 'Welcome back, ' + users[username].name + '!'
                    });

                    console.log('[' + uniqueId.green + '] Client Authenticated!');
                } else {
                    console.log('[' + uniqueId.red + '] Invalid Authentication!');

                    if (sockets[uniqueId]) {
                        sockets[uniqueId].authAttempt++;

                        if (sockets[uniqueId].authAttempt > 2) {
                            logout();
                        }
                    }

                    cb(false, {msg: 'Invalid username or password!'});
                }
            });

            socket.on('chat_msg', function (data) {
                if (!dataValidator.isValid('chat_msg', data)) {
                    console.log('[' + uniqueId.red + '] Invalid data for chat_msg!');
                } else {
                    console.log('Message from ' + data.from + ' to ' + data.to + ':');
                    console.log(data.msg);
                    switch (data.to) {
                        case 'sys':
                            // do something
                            break;
                        case 'all':
                            io.emit('chat_msg', {from: sockets[uniqueId].username, msg: data.msg, to: data.to});
                            break;
                        default:
                            var chat_data = {
                                from: username,
                                msg: data.msg,
                                to: data.to
                            };

                            if (sockets[data.to] && sockets[data.to].authenticated && sockets[data.to].socket.connected) {
                                chat_data = {
                                    from: username,
                                    msg: data.msg,
                                    to: sockets[data.to].username
                                };
                                sockets[data.to].socket.emit('chat_msg', chat_data);
                            }

                            sockets[uniqueId].socket.emit('chat_msg', chat_data);
                            break;
                    }
                }
            });

            socket.on('disconnect', function () {
                logout();
                console.log('[' + uniqueId.gray + '] Client Disconnected!');
            });
        });
    }
};

module.exports = controller;