var config = {
    'chat_msg': {
        type: 'object',
        props: {
            to: { type: 'string' },
            from: { type: 'string' },
            msg: { type: 'string' }
        }
    },
    'auth': {
        type: 'object',
        props: {
            username: { type: 'string' },
            password: { type: 'string' }
        }
    }
};

module.exports = config;