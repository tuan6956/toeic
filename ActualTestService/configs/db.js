module.exports = {
    url: "mongodb://toeic_db:123456zxC@103.114.107.16:27017/Toeic",
    //url: "mongodb://127.0.0.1:27017",
    name: "Toeic",
    collections: {
        user: "User",
        token: "Token",
        paragraphs: "paragraphs",
        dialogues: "dialogues",
        listening_question: "listening_question",
        reading_question: "reading_question",
    }
}
    
