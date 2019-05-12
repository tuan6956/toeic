import ListeningQuestion from './listening_questions';
import ReadingQuestion from './reading_question';
import GenerateTest from './generate_test';

export default class Models {
    constructor(app){
        this.app = app;
        this.listeningModels = new ListeningQuestion(app);
        this.readingModels = new ReadingQuestion(app);
        this.testModels = new GenerateTest(app);
    }
}