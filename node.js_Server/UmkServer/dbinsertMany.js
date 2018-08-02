
exports.insertmongo=function(par1){
    var Client = require('mongodb').MongoClient;

    Client.connect('mongodb://localhost:27017/mongodb_tut', function(error, db){
        if(error) {
            console.log(error);
        } else {
            // 1. 입력할 documents 를 미리 생성
            //var jordan = {name:'Jordan', age:16, gender:'M'};
            //var amanda = {name:'Amanda', age:17, gender:'F'};
            //var jessica = {name:'Jessica', age:15, gender:'F'};
           // var james = {name:'James', age:19, gender:'M'};
           // var catherine = {name:'Catherine', age:18, gender:'F'}

        var newlogin={name: par1}
            // 2. insertMany( ) 함수에 배열 형태로 입력
            const db1 = db.db('mongodb_tut');
            db1.collection('example').insert(newlogin);
            db.close();
        }
    });
}

