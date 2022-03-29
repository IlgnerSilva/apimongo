const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://root:root@cluster0.hl7su.mongodb.net/myFirstDatabase?retryWrites=true&w=majority').then(()=>{
    console.log('Conectado ao mongo');
});

module.exports = mongoose;
