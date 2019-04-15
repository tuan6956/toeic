import ListeningQuestion from './listening_questions';
import ReadingQuestion from './reading_question';

var listeningModel = new ListeningQuestion();
var readingQuestionModel = new ReadingQuestion();
module.exports = {
    listeningModel: listeningModel,
    readingQuestionModel: readingQuestionModel,
}