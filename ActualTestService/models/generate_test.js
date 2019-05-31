import _ from 'lodash';
import collections from '../configs/db';
var ObjectId = require('mongodb').ObjectID;

const scores_Test = [ 5, 5, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70,
     75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150, 155,
     160, 165, 170, 175, 180, 185, 190, 195, 200, 205, 210, 215, 220, 225, 230, 235, 240,
     245, 250, 255, 260, 265, 270, 275, 280, 285, 290, 295, 300, 305, 310, 315, 320, 325,
     330, 335, 340, 345, 350, 355, 360, 365, 370, 375, 380, 385, 390, 395, 400, 405, 410,
     415, 420, 425, 430, 435, 440, 445, 450, 455, 460, 465, 470, 475, 480, 485, 490, 495 ];
const scores_MiniTest = [ 5, 45, 95, 145, 195, 270, 295, 345, 395, 445, 495]

export default class GenerateTest {
    constructor(app){
        this.app = app;

    }


    async get_latest_test(skip_records, level){
        if(skip_records === 0){
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

    async insertQuestionToTest(collection_get_questions, part, level, skip_records, limit_records, id_test, current_quantity_question,quantity_questions_of_part, type_for_part7){
        switch (part) {
            case 1: case 2: case 5:{
                let questions = await this.getQuestionsToGenerate(collection_get_questions, part, level, skip_records, limit_records);
            
                while(current_quantity_question <= quantity_questions_of_part && questions.length !== 0){
                    
                    //insert the question to test
                    let insert_to_part = 'questions.part_' + part;
                    let insert_question = {};
                    // questions[0].test_id = id_test;
                    insert_question[insert_to_part] = questions[0]._id;
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
                break;
            }
            case 3: case 4: case 6:{
                let questions = await this.getQuestionsToGenerate(collection_get_questions, part, level, skip_records, limit_records);
                
                while(current_quantity_question <= quantity_questions_of_part && questions.length !== 0){
                    
                    //insert the question to testfindOneAndUpdate
                    let insert_to_part = 'questions.part_' + part;
                    let insert_question = {};
                    // questions[0].test_id = id_test;
                    insert_question[insert_to_part] = questions[0]._id;
                    this.app.db.collection(collections.collections.test)
                                .findOneAndUpdate({_id: ObjectId(id_test)}, 
                                    {$push: insert_question})

                    //update paragraph or dialogue add to id_test.
                    await this.app.db.collection(collection_get_questions)
                                .findOneAndUpdate({_id: questions[0]._id}, {
                                    $set: {test_id: id_test}
                                })
                    //update question of paragraph or dialogue
                    if(collection_get_questions === collections.collections.dialogues){
                        await this.app.db.collection(collections.collections.listening_question)
                                .updateMany({id_dialogue: questions[0]._id}, {
                                    $set: {test_id: id_test}
                                })
                    }else{
                        await this.app.db.collection(collections.collections.reading_question)
                                .updateMany({id_paragraph: questions[0]._id}, {
                                    $set: {test_id: id_test}
                                })
                    }
                    //remove question have inserted.
                    questions.shift();

                } 
                break;
            }
            case 7:{
                    
                let questions = await this.app.db.collection(collection_get_questions).find({part: part, level: level, type: type_for_part7}).sort({time: -1}).skip(skip_records).limit(limit_records).toArray();
                while(current_quantity_question <= quantity_questions_of_part && questions.length !== 0){
                    
                    //insert the paragraph to test
                    let insert_to_part = 'questions.part_' + part+'.type_'+ type_for_part7;
                    let insert_question = {};
                    insert_question[insert_to_part] = questions[0]._id;
                    this.app.db.collection(collections.collections.test)
                                .findOneAndUpdate({_id: ObjectId(id_test)}, 
                                    {$push: insert_question})

                    //update paragraph add to id_test.
                    await this.app.db.collection(collection_get_questions)
                                .findOneAndUpdate({_id: questions[0]._id}, {
                                    $set: {test_id: id_test}
                                })
                    //update question of paragraph add to id_test.
                    await this.app.db.collection(collections.collections.reading_question)
                            .updateMany({id_paragraph: questions[0]._id}, {
                                $set: {test_id: id_test}
                            })
                    //remove question have inserted.
                    questions.shift();

                } 
                break;
            }
            default:
                break;
        }
    }

    async createNewTest(level, count_test, part_need_to_generate, type_in_part_7){
        let name_test ;
        switch(level){
            case 1:{
                name_test = "Elementary " + count_test;
                break;
            }
            case 2:{
                name_test = "Intermediate " + count_test;
                break;
            }
            case 3:{
                name_test = "Upper intermediate " + count_test;
                break;
            }
            case 4:{
                name_test = "Advanced " + count_test;
                break;
            }

            default:
                break;
        }
        let data_insert = {
            questions: {
                part_1: [],
                part_2: [],
                part_3: [],
                part_4: [],
                part_5: [],
                part_6: [],
                part_7: {
                    type_1: [],
                    type_2: []
                }
            },
            name: name_test,
            status: 'pending',
            user_complete: 0,
            level: level,
            createAt: new Date()

        }
        let id_insert = await this.app.db.collection('test').insertOne(data_insert).then(result=>{
            return result.ops[0]._id
        })
        
        if(!_.isUndefined(part_need_to_generate)){
            switch (part_need_to_generate) {
                case 1:{
                   await this.insertQuestionToTest(collections.collections.listening_question,1, level, (count_test)*6, 6, id_insert,0, 6);
                    break;
                }
                case 2:{
                    await this.insertQuestionToTest(collections.collections.listening_question,2, level, (count_test)*25, 25, id_insert, 0,25)
                    break;
                }
                case 3:{
                    await this.insertQuestionToTest(collections.collections.dialogues, 3, level, count_test*13, 13, id_insert, 0, 13);
                    break;
                }
                case 4:{
                    await this.insertQuestionToTest(collections.collections.dialogues, 4, level, count_test*10, 10, id_insert, 0, 10);
                    break;
                }
                case 5: {
                    await this.insertQuestionToTest(collections.collections.reading_question, 5, level, count_test*30, 30, id_insert, 0, 30);
                    break;
                }
                case 6: {
                    await this.insertQuestionToTest(collections.collections.paragraphs, 6, level, count_test*4, 4, id_insert, 0, 4);
                    break;
                }
                case 7: {
                    if(!_.isUndefined(type_in_part_7) && type_in_part_7 === 1){
                        //with type 1: single paragraph
                        await this.insertQuestionToTest(collections.collections.paragraphs, 7, level, count_test*10, 10, id_insert, 0, 10, 1);
                    }else{
                        //with type 2: double paragraph
                        await this.insertQuestionToTest(collections.collections.paragraphs, 7, level, count_test*5, 5, id_insert, 0, 5, 2);
                    }

                    break;
                }
                default:
                    break;
            }
        }else{
            for (let index = 1; index <= 7; index++){
                switch (index) {
                    //generate part 1
                    case 1:{
                       await this.insertQuestionToTest(collections.collections.listening_question,1, level, (count_test)*6, 6, id_insert,0, 6);
                        break;
                    }
                    case 2:{
                        await this.insertQuestionToTest(collections.collections.listening_question,2, level, (count_test)*25, 25, id_insert, 0,25)
                        break;
                    }
                    case 3:{
                        await this.insertQuestionToTest(collections.collections.dialogues, 3, level, count_test*13, 13, id_insert, 0, 13);
                        break;
                    }
                    case 4:{
                        await this.insertQuestionToTest(collections.collections.dialogues, 4, level, count_test*10, 10, id_insert, 0, 10);
                        break;
                    }
                    case 5: {
                        await this.insertQuestionToTest(collections.collections.reading_question, 5, level, count_test*30, 30, id_insert, 0, 30);
                        break;
                    }
                    case 6: {
                        await this.insertQuestionToTest(collections.collections.paragraphs, 6, level, count_test*4, 4, id_insert, 0, 4);
                        break;
                    }
                    case 7: {
                        //with type 1: single paragraph
                        await this.insertQuestionToTest(collections.collections.paragraphs, 7, level, count_test*10, 10, id_insert, 0, 10, 1);
                        
                        //with type 2: double paragraph
                        await this.insertQuestionToTest(collections.collections.paragraphs, 7, level, count_test*5, 5, id_insert, 0, 5, 2);

                        break;
                    }
                    default:
                        break;
                }
            }
        }
    }
    async generateTestToLevel(level){

        let count_test = await this.app.db.collection(collections.collections.test).find({level: level}).count();

        let test_pending = await this.app.db.collection(collections.collections.test).find({level: level, status: 'pending'}).toArray();
        if(test_pending.length > 0){
            for(let index = 0; index < test_pending.length; index++){

                if(test_pending[index].questions.part_1.length < 6){
                    // await this.app.db.collection('manage_question_quantity').updateOne({level: level}, {$set: {'quantity_question.part_1': true}})
                    await this.insertQuestionToTest(collections.collections.listening_question, 1, level, (count_test-test_pending.length + index)*6 + test_pending[index].questions.part_1.length, 6-test_pending[index].questions.part_1.length, test_pending[index]._id, test_pending[index].questions.part_1.length, 6);     
                }
                else if (index + 1 === test_pending.length) {
                    await this.updateStatusTest(level, test_pending[index]._id)
                    await this.createNewTest(level, count_test, 1);
                }
                if(test_pending[index].questions.part_2.length < 25){
                    await this.insertQuestionToTest(collections.collections.listening_question, 2, level, (count_test-test_pending.length + index)*25 + test_pending[index].questions.part_2.length, 25-test_pending[index].questions.part_2.length,test_pending[index]._id, test_pending[index].questions.part_2.length, 25);
                }
                else if(index + 1 === test_pending.length){
                    await this.updateStatusTest(level, test_pending[index]._id)
                    await this.createNewTest(level, count_test, 2);
                }
                if(test_pending[index].questions.part_3.length < 13){
                    await this.insertQuestionToTest(collections.collections.dialogues, 3, level, (count_test-test_pending.length + index)*13 + test_pending[index].questions.part_3.length, 13-test_pending[index].questions.part_3.length,test_pending[index]._id, test_pending[index].questions.part_3.length, 13);
                }
                else if(index + 1 === test_pending.length){
                    await this.updateStatusTest(level, test_pending[index]._id)
                    await this.createNewTest(level, count_test, 3);
                }
                if(test_pending[index].questions.part_4.length < 10){
                    await this.insertQuestionToTest(collections.collections.dialogues, 4, level, (count_test-test_pending.length + index)*10 + test_pending[index].questions.part_4.length, 10-test_pending[index].questions.part_4.length,test_pending[index]._id, test_pending[index].questions.part_4.length, 10);
                }
                else if(index + 1 === test_pending.length){
                    await this.updateStatusTest(level, test_pending[index]._id)
                    await this.createNewTest(level, count_test, 4);
                }
                if(test_pending[index].questions.part_5.length < 30){
                    await this.insertQuestionToTest(collections.collections.reading_question, 5, level, (count_test-test_pending.length + index)*30 + test_pending[index].questions.part_5.length, 30-test_pending[index].questions.part_5.length,test_pending[index]._id, test_pending[index].questions.part_5.length, 30);
                }
                else if(index + 1 === test_pending.length){
                    await this.updateStatusTest(level, test_pending[index]._id)
                    await this.createNewTest(level, count_test, 5);
                }
                if(test_pending[index].questions.part_6.length < 4){
                    await this.insertQuestionToTest(collections.collections.paragraphs, 6, level, (count_test-test_pending.length + index)*4 + test_pending[index].questions.part_6.length, 4-test_pending[index].questions.part_6.length,test_pending[index]._id, test_pending[index].questions.part_6.length, 4);
                }
                else if(index + 1 === test_pending.length){
                    await this.updateStatusTest(level, test_pending[index]._id)
                    await this.createNewTest(level, count_test, 6);
                }
                if(test_pending[index].questions.part_7.type_1.length < 10){
                    await this.insertQuestionToTest(collections.collections.paragraphs, 7, level, (count_test-test_pending.length + index)*10 + test_pending[index].questions.part_7.type_1.length, 10-test_pending[index].questions.part_7.type_1.length,test_pending[index]._id, test_pending[index].questions.part_7.type_1.length, 10, 1);

                }
                else if(index + 1 === test_pending.length){
                    await this.updateStatusTest(level, test_pending[index]._id)
                    await this.createNewTest(level, count_test, 2, 1);
                }
                if(test_pending[index].questions.part_7.type_2.length < 5){
                    await this.insertQuestionToTest(collections.collections.paragraphs,7, level, (count_test-test_pending.length + index)*5 + test_pending[index].questions.part_7.type_2.length, 5- test_pending[index].questions.part_7.type_2.length, test_pending[index]._id, test_pending[index].questions.part_7.type_2.length, 5, 2)
                }
                else if(index + 1 === test_pending.length){
                    await this.updateStatusTest(level, test_pending[index]._id)
                    await this.createNewTest(level, count_test, 2, 2);
                }
            }
        }
        else{
            this.createNewTest(level, count_test);
        }
    }

    async isCreateTestToLevel(level){

    }

    async getTheTestByLevelAndOrdinalTest(level, ordinalOfTest){
        let querry = {}
        // if(!_.isUndefined(id_test)){
        //     querry._id = ObjectId(id_test)
        // }
        if (!_.isUndefined(level)) {
            querry.level = level
        }
        console.log(ordinalOfTest)
        console.log(level)
        let result =  await this.app.db.collection(collections.collections.test).find(querry).skip(ordinalOfTest ? ordinalOfTest : 0).toArray();
        let questions = {
            part_1: [],
            part_2: [],
            part_3: [],
            part_4: [],
            part_5: [],
            part_6: [],
            part_7: {
                type_1: [],
                type_2: []
            }
        }
        if(result[0]){
            for (let index = 1; index <= 7; index++) {
                switch (index) {
                    case 1:{
                        for(let i = 0; i < result[0].questions.part_1.length; i++){
                        let id = result[0].questions.part_1[i];
                            let getQuestion = await this.app.db.collection(collections.collections.listening_question).findOne({_id: id})
                            questions.part_1.push(getQuestion)
                        }
                        break;
                    }

                    case 2: {
                        for(let i = 0; i < result[0].questions.part_2.length; i++){
                            let id = result[0].questions.part_2[i];
                            let getQuestion = await this.app.db.collection(collections.collections.listening_question).findOne({_id: id})
                            questions.part_2.push(getQuestion)
                        }
                        break;
                    }
                    case 3: {
                        for(let i = 0; i < result[0].questions.part_3.length; i++){
                            let id = result[0].questions.part_3[i];
                            let get_dialogue = await this.app.db.collection(collections.collections.dialogues).findOne({_id: id})
                            let questionObjects = await this.app.db.collection(collections.collections.listening_question).find({id_dialogue: new ObjectId(id)}).toArray();
                            get_dialogue.questionObjects = questionObjects;
                            questions.part_3.push(get_dialogue);
                        }
                        break;
                    }
                    case 4: {
                        for(let i = 0; i < result[0].questions.part_4.length; i++){
                            let id = result[0].questions.part_4[i];
                            let get_dialogue = await this.app.db.collection(collections.collections.dialogues).findOne({_id: id});
                            let questionObjects = await this.app.db.collection(collections.collections.listening_question).find({id_dialogue: new ObjectId(id)}).toArray();
                            get_dialogue.questionObjects = questionObjects;
                            questions.part_4.push(get_dialogue);
                        }
                        break;
                    }
                    case 5: {
                        for(let i = 0; i < result[0].questions.part_5.length; i++){
                            let id = result[0].questions.part_5[i];
                            let getQuestion = await this.app.db.collection(collections.collections.reading_question).findOne({_id: id})
                            questions.part_5.push(getQuestion)
                        }
                        break;
                    }
                    case 6: {
                        for(let i = 0; i < result[0].questions.part_6.length; i++){
                            let id = result[0].questions.part_6[i];
                            let get_paragraph = await this.app.db.collection(collections.collections.paragraphs).findOne({_id: id});
                            let questionObjects = await this.app.db.collection(collections.collections.reading_question).find({id_paragraph: new ObjectId(id)}).toArray();
                            get_paragraph.questionObjects = questionObjects;
                            questions.part_6.push(get_paragraph);
                        }
                        break;
                    }
                    case 7:{
                        for(let i = 0; i < result[0].questions.part_7.type_1.length;i++){
                            let id = result[0].questions.part_7.type_1[i];
                            let get_paragraph = await this.app.db.collection(collections.collections.paragraphs).findOne({_id: id});
                            let questionObjects = await this.app.db.collection(collections.collections.reading_question).find({id_paragraph: new ObjectId(id)}).toArray();
                            get_paragraph.questionObjects = questionObjects;
                            questions.part_7.type_1.push(get_paragraph);
                        }
                        for(let i = 0; i < result[0].questions.part_7.type_2.length;i++){
                            let id = result[0].questions.part_7.type_2[i];
                            let get_paragraph = await this.app.db.collection(collections.collections.paragraphs).findOne({_id: id});
                            let questionObjects = await this.app.db.collection(collections.collections.reading_question).find({id_paragraph: new ObjectId(id)}).toArray();
                            get_paragraph.questionObjects = questionObjects;
                            questions.part_7.type_2.push(get_paragraph);
                        }
                        break;
                    }
                    
                    default:
                        break;
                }
                
            }
            result[0].questions = questions;

            return result[0];
        }
        return {};
    }

    async getTheTestById(id_test){

        let result = await this.app.db.collection('test').find({_id: ObjectId(id_test)}).toArray();
        let questions = {
            part_1: [],
            part_2: [],
            part_3: [],
            part_4: [],
            part_5: [],
            part_6: [],
            part_7: {
                type_1: [],
                type_2: []
            }
        }
        if(result[0]){
            for (let index = 1; index <= 7; index++) {
                switch (index) {
                    case 1:{
                        for(let i = 0; i < result[0].questions.part_1.length; i++){
                        let id = result[0].questions.part_1[i];
                            let getQuestion = await this.app.db.collection(collections.collections.listening_question).findOne({_id: id})
                            questions.part_1.push(getQuestion)
                        }
                        break;
                    }

                    case 2: {
                        for(let i = 0; i < result[0].questions.part_2.length; i++){
                            let id = result[0].questions.part_2[i];
                            let getQuestion = await this.app.db.collection(collections.collections.listening_question).findOne({_id: id})
                            questions.part_2.push(getQuestion)
                        }
                        break;
                    }
                    case 3: {
                        for(let i = 0; i < result[0].questions.part_3.length; i++){
                            let id = result[0].questions.part_3[i];
                            let get_dialogue = await this.app.db.collection(collections.collections.dialogues).findOne({_id: id})
                            let questionObjects = await this.app.db.collection(collections.collections.listening_question).find({id_dialogue: new ObjectId(id)}).toArray();
                            get_dialogue.questionObjects = questionObjects;
                            questions.part_3.push(get_dialogue);
                        }
                        break;
                    }
                    case 4: {
                        for(let i = 0; i < result[0].questions.part_4.length; i++){
                            let id = result[0].questions.part_4[i];
                            let get_dialogue = await this.app.db.collection(collections.collections.dialogues).findOne({_id: id});
                            let questionObjects = await this.app.db.collection(collections.collections.listening_question).find({id_dialogue: new ObjectId(id)}).toArray();
                            get_dialogue.questionObjects = questionObjects;
                            questions.part_4.push(get_dialogue);
                        }
                        break;
                    }
                    case 5: {
                        for(let i = 0; i < result[0].questions.part_5.length; i++){
                            let id = result[0].questions.part_5[i];
                            let getQuestion = await this.app.db.collection(collections.collections.reading_question).findOne({_id: id})
                            questions.part_5.push(getQuestion)
                        }
                        break;
                    }
                    case 6: {
                        for(let i = 0; i < result[0].questions.part_6.length; i++){
                            let id = result[0].questions.part_6[i];
                            let get_paragraph = await this.app.db.collection(collections.collections.paragraphs).findOne({_id: id});
                            let questionObjects = await this.app.db.collection(collections.collections.reading_question).find({id_paragraph: new ObjectId(id)}).toArray();
                            get_paragraph.questionObjects = questionObjects;
                            questions.part_6.push(get_paragraph);
                        }
                        break;
                    }
                    case 7:{
                        for(let i = 0; i < result[0].questions.part_7.type_1.length;i++){
                            let id = result[0].questions.part_7.type_1[i];
                            let get_paragraph = await this.app.db.collection(collections.collections.paragraphs).findOne({_id: id});
                            let questionObjects = await this.app.db.collection(collections.collections.reading_question).find({id_paragraph: new ObjectId(id)}).toArray();
                            get_paragraph.questionObjects = questionObjects;
                            questions.part_7.type_1.push(get_paragraph);
                        }
                        for(let i = 0; i < result[0].questions.part_7.type_2.length;i++){
                            let id = result[0].questions.part_7.type_2[i];
                            let get_paragraph = await this.app.db.collection(collections.collections.paragraphs).findOne({_id: id});
                            let questionObjects = await this.app.db.collection(collections.collections.reading_question).find({id_paragraph: new ObjectId(id)}).toArray();
                            get_paragraph.questionObjects = questionObjects;
                            questions.part_7.type_2.push(get_paragraph);
                        }
                        break;
                    }
                    
                    default:
                        break;
                }
                
            }
            result[0].questions = questions;

            return result[0];
        }
        return {};
    }

    async generateMiniTest(){
        let count_test = await this.app.db.collection('test').find({status: 'success'}).count();
        let mini_test = await this.app.db.collection(collections.collections.mini_test).find().count();
        if(count_test < 3){
            return;
        }
        if(mini_test === 10){
            return;
        }

        let data_insert = {
            questions: {
                part_1: [],
                part_2: [],
                part_3: [],
                part_4: [],
                part_5: [],
                part_6: [],
                part_7: {
                    type_1: [],
                    type_2: []
                }
            },
            createAt: new Date()
        }
        
        //2 2 3-3 3-3 2 6-3 7.1-1 7.2-1
        
        for (let index = 1; index <= 7; index++) {
            switch (index) {
                case 1: case 2:{
                    let temp = 0;
                    while (temp < 2) {
                        let n = await this.app.db.collection(collections.collections.listening_question).find({part: index}).count();
                        let r = Math.floor(Math.random() * n);
                        let randomElement = await this.app.db.collection(collections.collections.listening_question).find({part: index}).limit(1).skip(r).toArray();
                        let part = 'part_'+index;
                        if(randomElement.length !== 0){
                            data_insert.questions[part].push(randomElement[0]._id);
                        }
                        temp++;
                    }
                    break;
                }
                case 3: case 4:{
                    let n = await this.app.db.collection(collections.collections.dialogues).find({part: index}).count();
                    let r = Math.floor(Math.random() * n);
                    let randomElement = await this.app.db.collection(collections.collections.dialogues).find({part: index}).limit(1).skip(r).toArray();
                    let part = 'part_'+index;
                    if(randomElement.length !== 0){
                        data_insert.questions[part].push(randomElement[0]._id);
                    }

                    break;
                }
                case 5:{
                    let temp = 0;
                    while (temp < 2) {
                        let n = await this.app.db.collection(collections.collections.reading_question).find({part: index}).count();
                        let r = Math.floor(Math.random() * n);
                        let randomElement = await this.app.db.collection(collections.collections.reading_question).find({part: index}).limit(1).skip(r).toArray();
                        let part = 'part_'+index;
                        if(randomElement.length !== 0){
                            data_insert.questions[part].push(randomElement[0]._id);
                        }
                        temp++;
                    }
                    break;
                }
                case 6: {
                    let n = await this.app.db.collection(collections.collections.paragraphs).find({part: index}).count();
                    let r = Math.floor(Math.random() * n);
                    let randomElement = await this.app.db.collection(collections.collections.paragraphs).find({part: index}).limit(1).skip(r).toArray();
                    let part = 'part_'+index;
                    if(randomElement.length !== 0){
                        data_insert.questions[part].push(randomElement[0]._id);
                    }
                    break;
                }
                case 7:{
                    let n = await this.app.db.collection('reading_question').aggregate( [{ $group: { '_id': { 'id_paragraph': "$id_paragraph", 'type': "$type"}, count: { $sum: 1 } } }, { $match: { count: 3, '_id.type': 1 }}]).toArray();
                    if(n.length !== 0){
                        let r = Math.floor(Math.random() * n.length);

                        let randomElement =  await this.app.db.collection('reading_question').aggregate( [{ $group: { _id: { id_paragraph: "$id_paragraph", type: "$type"}, count: { $sum: 1 } } }, { $match: { count: 3, '_id.type': 1 }}, {$skip: 1}, {$limit: 1}]).toArray()
                    
                        if(randomElement.length !== 0){
                            data_insert.questions.part_7.type_1.push(randomElement[0]._id)
                        }
                    }

                    //with type =1 ;
                    // let n = this.app.db.collection(collections.collections.paragraphs).find({part: index, type: 1}).count();
                    // let r = Math.floor(Math.random() * n);
                    // let randomElement = this.app.db.collection(collections.collections.paragraphs).find({part: index, type: 1}).limit(1).skip(r).toArray();
                    // let part = 'part_'+index+'.type_1';
                    // data_insert.questions[part].push(randomElement[0]._id);
                    //with type = 2;
                    let n_2 = await this.app.db.collection(collections.collections.paragraphs).find({part: index, type: 2}).count();
                    let r_2 = Math.floor(Math.random() * n_2);
                    let randomElement_2 = await this.app.db.collection(collections.collections.paragraphs).find({part: index, type: 2}).limit(1).skip(r_2).toArray();
                    if(randomElement_2.length !== 0){
                            data_insert.questions.part_7.type_2.push(randomElement_2[0]._id)
                       
                    }
                    break;
                }
                default:
                    break;
            }            
        }
        data_insert.createAt = new Date();
        await this.app.db.collection(collections.collections.mini_test).insertOne(data_insert);
    }

    async getMiniTest(){
        let n_test = this.app.db.collection(collections.collections.mini_test).find().count();
        let r = Math.floor(Math.random() * n_test);
        let result =  await this.app.db.collection(collections.collections.mini_test).find().skip(r).toArray();
        let questions = {
            part_1: [],
            part_2: [],
            part_3: [],
            part_4: [],
            part_5: [],
            part_6: [],
            part_7: {
                type_1: [],
                type_2: []
            }
        }
        if(result[0]){
            for (let index = 1; index <= 7; index++) {
                switch (index) {
                    case 1:{
                        for(let i = 0; i < result[0].questions.part_1.length; i++){
                        let id = result[0].questions.part_1[i];
                            let getQuestion = await this.app.db.collection(collections.collections.listening_question).findOne({_id: id})
                            questions.part_1.push(getQuestion)
                        }
                        break;
                    }

                    case 2: {
                        for(let i = 0; i < result[0].questions.part_2.length; i++){
                            let id = result[0].questions.part_2[i];
                            let getQuestion = await this.app.db.collection(collections.collections.listening_question).findOne({_id: id})
                            questions.part_2.push(getQuestion)
                        }
                        break;
                    }
                    case 3: {
                        for(let i = 0; i < result[0].questions.part_3.length; i++){
                            let id = result[0].questions.part_3[i];
                            let get_dialogue = await this.app.db.collection(collections.collections.dialogues).findOne({_id: id})
                            let questionObjects = await this.app.db.collection(collections.collections.listening_question).find({id_dialogue: new ObjectId(id)}).toArray();
                            get_dialogue.questionObjects = questionObjects;
                            questions.part_3.push(get_dialogue);
                        }
                        break;
                    }
                    case 4: {
                        for(let i = 0; i < result[0].questions.part_4.length; i++){
                            let id = result[0].questions.part_4[i];
                            let get_dialogue = await this.app.db.collection(collections.collections.dialogues).findOne({_id: id});
                            let questionObjects = await this.app.db.collection(collections.collections.listening_question).find({id_dialogue: new ObjectId(id)}).toArray();
                            get_dialogue.questionObjects = questionObjects;
                            questions.part_4.push(get_dialogue);
                        }
                        break;
                    }
                    case 5: {
                        for(let i = 0; i < result[0].questions.part_5.length; i++){
                            let id = result[0].questions.part_5[i];
                            let getQuestion = await this.app.db.collection(collections.collections.reading_question).findOne({_id: id})
                            questions.part_5.push(getQuestion)
                        }
                        break;
                    }
                    case 6: {
                        for(let i = 0; i < result[0].questions.part_6.length; i++){
                            let id = result[0].questions.part_6[i];
                            let get_paragraph = await this.app.db.collection(collections.collections.paragraphs).findOne({_id: id});
                            let questionObjects = await this.app.db.collection(collections.collections.reading_question).find({id_paragraph: new ObjectId(id)}).toArray();
                            get_paragraph.questionObjects = questionObjects;
                            questions.part_6.push(get_paragraph);
                        }
                        break;
                    }
                    case 7:{
                        for(let i = 0; i < result[0].questions.part_7.type_1.length;i++){
                            let id = result[0].questions.part_7.type_1[i];
                            let get_paragraph = await this.app.db.collection(collections.collections.paragraphs).findOne({_id: id});
                            let questionObjects = await this.app.db.collection(collections.collections.reading_question).find({id_paragraph: new ObjectId(id)}).toArray();
                            get_paragraph.questionObjects = questionObjects;
                            questions.part_7.type_1.push(get_paragraph);
                        }
                        for(let i = 0; i < result[0].questions.part_7.type_2.length;i++){
                            let id = result[0].questions.part_7.type_2[i];
                            let get_paragraph = await this.app.db.collection(collections.collections.paragraphs).findOne({_id: id});
                            let questionObjects = await this.app.db.collection(collections.collections.reading_question).find({id_paragraph: new ObjectId(id)}).toArray();
                            get_paragraph.questionObjects = questionObjects;
                            questions.part_7.type_2.push(get_paragraph);
                        }
                        break;
                    }
                    
                    default:
                        break;
                }
                
            }
            result[0].questions = questions;

            return result[0];
        }
        return {};
    }
    
    async getAll(level, page = 0, limit = 1){
        let querry = {};
        (level) ? querry['level'] = level : null;
        let result = await this.app.db.collection('test').find(querry,{projection: {questions: 0}}).toArray();
        return result;
    }

    async getAllMiniTest(page = 0, limit = 1){
        let querry = {}
        let result = await this.app.db.collection('mini_test').find(querry, {projection: {questions: 0}}).toArray();
        return result;
    }


    async getMiniTestById(id_mini_test){

        let result = await this.app.db.collection('mini_test').find({_id: ObjectId(id_mini_test)}).toArray();
        let questions = {
            part_1: [],
            part_2: [],
            part_3: [],
            part_4: [],
            part_5: [],
            part_6: [],
            part_7: {
                type_1: [],
                type_2: []
            }
        }
        if(result[0]){
            for (let index = 1; index <= 7; index++) {
                switch (index) {
                    case 1:{
                        for(let i = 0; i < result[0].questions.part_1.length; i++){
                        let id = result[0].questions.part_1[i];
                            let getQuestion = await this.app.db.collection(collections.collections.listening_question).findOne({_id: id})
                            questions.part_1.push(getQuestion)
                        }
                        break;
                    }

                    case 2: {
                        for(let i = 0; i < result[0].questions.part_2.length; i++){
                            let id = result[0].questions.part_2[i];
                            let getQuestion = await this.app.db.collection(collections.collections.listening_question).findOne({_id: id})
                            questions.part_2.push(getQuestion)
                        }
                        break;
                    }
                    case 3: {
                        for(let i = 0; i < result[0].questions.part_3.length; i++){
                            let id = result[0].questions.part_3[i];
                            let get_dialogue = await this.app.db.collection(collections.collections.dialogues).findOne({_id: id})
                            let questionObjects = await this.app.db.collection(collections.collections.listening_question).find({id_dialogue: new ObjectId(id)}).toArray();
                            get_dialogue.questionObjects = questionObjects;
                            questions.part_3.push(get_dialogue);
                        }
                        break;
                    }
                    case 4: {
                        for(let i = 0; i < result[0].questions.part_4.length; i++){
                            let id = result[0].questions.part_4[i];
                            let get_dialogue = await this.app.db.collection(collections.collections.dialogues).findOne({_id: id});
                            let questionObjects = await this.app.db.collection(collections.collections.listening_question).find({id_dialogue: new ObjectId(id)}).toArray();
                            get_dialogue.questionObjects = questionObjects;
                            questions.part_4.push(get_dialogue);
                        }
                        break;
                    }
                    case 5: {
                        for(let i = 0; i < result[0].questions.part_5.length; i++){
                            let id = result[0].questions.part_5[i];
                            let getQuestion = await this.app.db.collection(collections.collections.reading_question).findOne({_id: id})
                            questions.part_5.push(getQuestion)
                        }
                        break;
                    }
                    case 6: {
                        for(let i = 0; i < result[0].questions.part_6.length; i++){
                            let id = result[0].questions.part_6[i];
                            let get_paragraph = await this.app.db.collection(collections.collections.paragraphs).findOne({_id: id});
                            let questionObjects = await this.app.db.collection(collections.collections.reading_question).find({id_paragraph: new ObjectId(id)}).toArray();
                            get_paragraph.questionObjects = questionObjects;
                            questions.part_6.push(get_paragraph);
                        }
                        break;
                    }
                    case 7:{
                        for(let i = 0; i < result[0].questions.part_7.type_1.length;i++){
                            let id = result[0].questions.part_7.type_1[i];
                            let get_paragraph = await this.app.db.collection(collections.collections.paragraphs).findOne({_id: id});
                            let questionObjects = await this.app.db.collection(collections.collections.reading_question).find({id_paragraph: new ObjectId(id)}).toArray();
                            get_paragraph.questionObjects = questionObjects;
                            questions.part_7.type_1.push(get_paragraph);
                        }
                        for(let i = 0; i < result[0].questions.part_7.type_2.length;i++){
                            let id = result[0].questions.part_7.type_2[i];
                            let get_paragraph = await this.app.db.collection(collections.collections.paragraphs).findOne({_id: id});
                            let questionObjects = await this.app.db.collection(collections.collections.reading_question).find({id_paragraph: new ObjectId(id)}).toArray();
                            get_paragraph.questionObjects = questionObjects;
                            questions.part_7.type_2.push(get_paragraph);
                        }
                        break;
                    }
                    
                    default:
                        break;
                }
                
            }
            result[0].questions = questions;

            return result[0];
        }
        return {};
    }

    async subscribe(level, manage_test){
        let question_part1 = await this.app.db.collection(collections.collections.listening_question).find({level: level}).count()
        let question_part2 = await this.app.db.collection(collections.collections.listening_question).find({level: level}).count()
        let question_part3 = await this.app.db.collection(collections.collections.listening_question).find({level: level}).count()
        let question_part4 = await this.app.db.collection(collections.collections.listening_question).find({level: level}).count()
        let question_part5 = await this.app.db.collection(collections.collections.reading_question).find({level: level}).count()
        let question_part6 = await this.app.db.collection(collections.collections.reading_question).find({level: level}).count()
        let question_part7 = await this.app.db.collection(collections.collections.reading_question).find({level: level}).count()
        if(question_part1 > manage_test.part_1 || question_part2 > manage_test.part_2 || question_part3 > manage_test.part_3 || question_part4 > manage_test.part_4
            || question_part5 > manage_test.part_5 || question_part6 > manage_test.part_6){
                return true
        }
        return false
    }

    async generateTest(){

        let manage_test = await this.app.db.collection('manage_question_quantity').find({}).toArray();

        //generate the test
        for(let index = 1; index <=3; index++){
            console.log(this.subscribe(index, manage_test[index-1]))
            while(this.subscribe(index, manage_test[index-1])){
                this.generateTestToLevel(index);
            }
        }
    }

    async getResultTest(correct_listening, correct_reading, test_id, user_id){

        if(correct_reading > 100 || correct_listening > 100 || correct_reading < 0 || correct_listening < 0){
            return new Promise((resolve, reject)=>{
                reject({
                    err: {
                        message:"double check value of correct answer is greater than 0 and smaller than 100",
                        status: 500
                    }
                })
            })
        }

        let result = {
            listening_scores: scores_Test[correct_listening],
            reading_scores: scores_Test[correct_reading],
            total: scores_Test[correct_listening] + scores_Test[correct_reading]
        }
        let scores_test = {
            test_id: new ObjectId(test_id),
            result: result
        }
        await this.app.db.collection('test').updateMany({_id: new ObjectId(test_id)}, { $inc: { user_complete: 1 }})
        await this.app.db.collection('manage_scores_of_users').findOneAndUpdate({user_id: user_id}, {$push: {'scores_test': scores_test}}, {upsert: true})

        return new Promise((resolve, reject) =>{
            resolve({
                result: result
            })
        });
    }

    async getResultMiniTest(correct_listening, correct_reading, test_id, user_id){
        if(correct_reading > 10 || correct_listening > 10 || correct_reading < 0 || correct_listening < 0){
            return new Promise((resolve, reject)=>{
                reject({
                    err: {
                        message:"double check value of correct answer is greater than 0 and smaller than 10",
                        status: 500
                    }
                })
            })
        }

        let result = {
            listening_scores: scores_MiniTest[correct_listening],
            reading_scores: scores_MiniTest[correct_reading],
            total: scores_MiniTest[correct_listening] + scores_MiniTest[correct_reading]
        }
        let scores_test = {
            test_id: new ObjectId(test_id),
            result: result
        }
        await this.app.db.collection('mini_test').updateMany({_id: new ObjectId(test_id)}, { $inc: { user_complete: 1 }})
        await this.app.db.collection('manage_scores_of_users').findOneAndUpdate({user_id: user_id}, {$push: {'scores_mini_test': scores_test}}, {upsert: true})

        return new Promise((resolve, reject) =>{
            resolve({
                result: result
            })
        });
    }

    async updateStatusTest(level, id_test){
        // let status = await this.app.db.collection('manage_question_quantity').find({level: level}).toArray();
        // if (status[0].quantity_question.part_1 && status[0].quantity_question.part_2 && status[0].quantity_question.part_3
        // && status[0].quantity_question.part_4 && status[0].quantity_question.part_5 && status[0].quantity_question.part_6 && status[0].quantity_question.part_7_1
        // & status[0].quantity_question.part_7_2 ) {
        //    await this.app.db.collection('test').updateOne({_id: id_test},{status: "success"});
        // }

        let test = await this.app.db.collection('test').find({_id: ObjectId(id_test)}).toArray();
       

        if(test[0].questions.part_1.length === 6 &&
            test[0].questions.part_2.length === 25 &&
            test[0].questions.part_3.length === 13 &&
            test[0].questions.part_4.length === 10 &&
            test[0].questions.part_5.length === 30 &&
            test[0].questions.part_6.length === 4 &&
            test[0].questions.part_7.type_1.length === 10 &&
            test[0].questions.part_7.type_2.length === 5 ){
            await this.app.db.collection('test').updateOne({_id: id_test}, {$set: {'status': 'success'}})
        }
    }

}

// user: Adminstrator
// pass: 123456zxC*
//https://docs.mongodb.com/manual/replication/