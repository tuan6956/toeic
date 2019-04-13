const blankQuestionModel = require('./blank_question');
const blankParagraphModel = require('./blank_paragraph');
const listAnswerOfPart6Model = require('./question_of_part6');
const paragraphPart7Model = require('./paragraph_part7');
const questionOfPart7Model = require('./question_of_part7');
const listeningPar1Model = require('./listening_part1');
const listeningPart2Model = require('./listening_part2');
import BlankQuestion from './blank_question';
import ListeningQuestion from './listening_questions';

var blankQuestion = new BlankQuestion();
var listeningModel = new ListeningQuestion();
module.exports = {
    blankQuestionModel: blankQuestion,
    listeningModel: listeningModel,
    blankParagraphModel,
    listAnswerOfPart6Model,
    paragraphPart7Model,
    questionOfPart7Model,
    listeningPar1Model,
    listeningPart2Model,
}
