import ListeningQuestion from './listening_questions';
import ReadingQuestion from './reading_question';
import GenerateTest from './generate_test';

// var listeningModel = new ListeningQuestion();
// var readingQuestionModel = new ReadingQuestion();
// module.exports = {
//     listeningModel: listeningModel,
//     readingQuestionModel: readingQuestionModel,
// }

export default class Models {
    constructor(app){
        this.app = app;
        this.listeningModels = new ListeningQuestion(app);
        this.readingModels = new ReadingQuestion(app);
        this.testModels = new GenerateTest(app);
    }
}