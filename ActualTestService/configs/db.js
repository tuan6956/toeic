module.exports = {
    url: "mongodb://toeic_db:123456zxC@103.114.107.16:27017/Toeic",
    // url: "mongodb://127.0.0.1:27017",
    name: "Toeic",
    collections: {
        user: "User",
        token: "Token",
        paragraphs: "paragraphs",
        dialogues: "dialogues",
        listening_question: "listening_question",
        reading_question: "reading_question",
        manage_question_quantity: "manage_question_quantity",
        test: "test",
        mini_test: "mini_test",
        mini_test_users: 'mini_test_users',
        test_users: "test_users"
    },
    option : {
        useNewUrlParser: true,
        autoReconnect: true,
        reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
        reconnectInterval: 500, // Reconnect every 500ms
        poolSize: 50, // Maintain up to 10 socket connections
        // If not connected, return errors immediately rather than waiting for reconnect
        bufferMaxEntries: 0,
        connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
        // socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        family: 4 // Use IPv4, skip trying IPv6
    }
}
