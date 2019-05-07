import _ from 'lodash';
import collections from '../configs/db';
var ObjectId = require('mongodb').ObjectID;

export default class GenerateTest {
    constructor(app){
        this.app = app;
    }

    async get_latest_test(skip_records, level){
        if(skip_records === 0){
            console.log(result)
            return null;
        }
        if(skip_records === 1){
            let result = await this.app.db.collection(collections.collections.test).find({level: level}).toArray();
            return result[0];
        }
        let result = await this.app.db.collection(collections.collections.test).find({level: level}).skip(skip_records-1).toArray();
        return result[0];
    }

    async getQuestionsToGenerate(collection, part, level, skip_number, limit){
        return await this.app.db.collection(collection).find({part: part, level: level}).sort({time: -1}).skip(skip_number).limit(limit).toArray();
    }

    async insertQuestionToTest(collection_get_questions, part, level, skip_records, limit_records, id_test, current_quantity_question,quantity_questions_of_part){
        // switch (part) {
        //     case 1: case 2:{
        //         let questions = await this.getQuestionsToGenerate(collection_get_questions, part, level, skip_records, limit_records);
        //         console.log(skip_records, limit_records, quantity_questions_of_part, current_quantity_question, id_test, part, "part")
        //         console.log(questions.length, questions.length)

        //         while(current_quantity_question <= quantity_questions_of_part && questions.length !== 0){
        //             //insert the question to test
        //             let insert_to_part = 'questions.part_' + part;
        //             let insert_question = {};
        //             // questions[0].test_id = id_test;
        //             insert_question[insert_to_part] = questions[0];
        //             this.app.db.collection(collections.collections.test)
        //                         .findOneAndUpdate({_id: ObjectId(id_test)}, 
        //                             {$push: insert_question})

        //             //update question add to id_test.
        //             this.app.db.collection(collection_get_questions)
        //                         .findOneAndUpdate({_id: questions[0]._id}, {
        //                             $set: {test_id: id_test}
        //                         })
        //             //remove question have inserted.
        //             questions.shift();
        //         }
        //     }
        //     case 3: case 4:{
                
        //     }
        //     default:
        //         break;
        // }


        let questions = await this.getQuestionsToGenerate(collection_get_questions, part, level, skip_records, limit_records);
        console.log(skip_records, limit_records, quantity_questions_of_part, current_quantity_question, id_test, part, "part")
        console.log(questions.length, questions.length)

        while(current_quantity_question <= quantity_questions_of_part && questions.length !== 0){
            //insert the question to test
            let insert_to_part = 'questions.part_' + part;
            let insert_question = {};
            // questions[0].test_id = id_test;
            insert_question[insert_to_part] = questions[0];
            this.app.db.collection(collections.collections.test)
                        .findOneAndUpdate({_id: ObjectId(id_test)}, 
                            {$push: insert_question})

            //update question add to id_test.
            this.app.db.collection(collection_get_questions)
                        .findOneAndUpdate({_id: questions[0]._id}, {
                            $set: {test_id: id_test}
                        })
            //remove question have inserted.
            questions.shift();
        }
    }

    async generateTestToLevel(level){

        let count_test = await this.app.db.collection(collections.collections.test).find({level: level}).count();

        let latest_test = await this.get_latest_test(count_test, level);
        if(!_.isNull(latest_test) && latest_test.status === 'pending'){
            // insert for part 1:
            if(latest_test.questions.part_1.length < 6){
                this.insertQuestionToTest(collections.collections.listening_question, 1, level, (count_test-1)*6 + latest_test.questions.part_1.length, 6-latest_test.questions.part_1.length, latest_test._id, latest_test.questions.part_1.length, 6);     
            }

            if(latest_test.questions.part_2.length < 25){
                this.insertQuestionToTest(collections.collections.listening_question, 2, level, (count_test-1)*25 + latest_test.questions.part_2.length, 25-latest_test.questions.part_2.length,latest_test._id, latest_test.questions.part_2.length, 25);
            }

            if(latest_test.questions.part_3.length < 13){
                this.insertQuestionToTest(collections.collections.dialogues, 3, level, (count_test-1)*13 + latest_test.questions.part_3.length, 13-latest_test.questions.part_3.length,latest_test._id, latest_test.questions.part_3.length, 13);
            }
            
            if(latest_test.questions.part_4.length < 10){
                this.insertQuestionToTest(collections.collections.dialogues, 4, level, (count_test-1)*10 + latest_test.questions.part_4.length, 10-latest_test.questions.part_4.length,latest_test._id, latest_test.questions.part_4.length, 10);
            }

            if(latest_test.questions.part_5.length < 30){
                this.insertQuestionToTest(collections.collections.reading_question, 5, level, (count_test-1)*30 + latest_test.questions.part_5.length, 30-latest_test.questions.part_5.length,latest_test._id, latest_test.questions.part_5.length, 30);
            }

            if(latest_test.questions.part_6.length < 4){
                this.insertQuestionToTest(collections.collections.paragraphs, 6, level, (count_test-1)*4 + latest_test.questions.part_6.length, 4-latest_test.questions.part_6.length,latest_test._id, latest_test.questions.part_6.length, 4);
            }
        }
        else{
            let data_insert = {
                questions: {
                    part_1: [],
                    part_2: [],
                    part_3: [],
                    part_4: [],
                    part_5: [],
                    part_6: [],
                    part_7: []
                },
                status: 'pending',
                level: level
            }
            let id_insert = await this.app.db.collection('test').insertOne(data_insert).then(result=>{
                return result.ops[0]._id
            })
            .catch(err=>{
                console.log(err)
            })
            //generate part 1
            for (let index = 1; index <= 7; index++){
                switch (index) {
                    case 1:{
                        this.insertQuestionToTest(collections.collections.listening_question,1, level, (count_test)*6, 6, id_insert,0, 6);
                    }
                    case 2:{
                        this.insertQuestionToTest(collections.collections.listening_question,2, level, (count_test)*25, 25, id_insert, 0,25)
                    }
                    case 3:{
                        this.insertQuestionToTest(collections.collections.dialogues, index, level, count_test*13, 13, id_insert, 0, 13);
                    }
                    case 4:{
                        this.insertQuestionToTest(collections.collections.dialogues, index, level, count_test*10, 10, id_insert, 0, 10);
                    }
                    case 5: {
                        this.insertQuestionToTest(collections.collections.reading_question, index, level, count_test*30, 30, id_insert, 0, 30);
                    }
                    case 6: {
                        this.insertQuestionToTest(collections.collections.paragraphs, index, level, count_test*4, 4, id_insert, 0, 4);
                    }
                    default:
                        break;
                }
               
            }
        }
    }
}