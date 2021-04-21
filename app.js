const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.set('view engine', 'pug');
app.set('views', 'views');
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/mongo-1', { useNewUrlParser: true, useUnifiedTopology: true });
//mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/test', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on("error", function (e) { console.error(e); });

var schema = mongoose.Schema({
    name: { type: String, default: "Anónimo" },
    count: { type: Number, default: 1 }
});


var Visitor = mongoose.model("Visitor", schema);

app.get('/', async (req, res) => {
    const visitorName = req.query.name;
    const existVisitor = await Visitor.findOne({ name: visitorName }).catch((error) => console.error(error));
    if (existVisitor && visitorName) {
        await countVisits(visitorName).catch((error) => console.error(error));;
    } else {
        await Visitor.create({ name: visitorName, count: 1 }).catch((error) => console.error(error));
        console.log("creando anonimo");
    }

    await Visitor.find(function (err, visitors) {
        if (err) return console.error(err, visitors);
        console.log("pintando " + visitors);
        res.render('index', { visitors: visitors });
    })
});

function countVisits(visitorName) {
    return Visitor.findOne({ name: visitorName }, function (err, visitor) {
        if (err) return console.error(err);
        visitor.count += 1;
        visitor.save(function (err) {
            if (err) return console.log(err);
        });
        return visitor;
    });
}


app.listen(3000, () => console.log('Listen on port 3000!'));