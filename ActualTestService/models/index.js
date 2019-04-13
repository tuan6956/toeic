const blankParagraphModel = require('./blank_paragraph');
const listAnswerOfPart6Model = require('./question_of_part6');
const paragraphPart7Model = require('./paragraph_part7');
const questionOfPart7Model = require('./question_of_part7');
import BlankQuestion from './blank_question';
import ListeningQuestion from './listening_questions';
import ReadingQuestion from './reading_question';

var blankQuestion = new BlankQuestion();
var listeningModel = new ListeningQuestion();
var readingQuestionModel = new ReadingQuestion();
module.exports = {
    blankQuestionModel: blankQuestion,
    listeningModel: listeningModel,
    readingQuestionModel: readingQuestionModel,
    blankParagraphModel,
    listAnswerOfPart6Model,
    paragraphPart7Model,
    questionOfPart7Model,
}