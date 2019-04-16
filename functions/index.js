const functions = require('firebase-functions');
var admin = require("firebase-admin");
const express = require('express');
// const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const vue = require("vue");

// var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://rhinocupchampionsleaguemz.firebaseio.com"
});

// function getEquipes() {
//     const ref = firebaseApp.collections('equipes');
//     return ref.once( eventType, function(dataSnapshot) { dataSnapshot. });
// }

const db = admin.firestore();

const app = express();
app.engine('.hbs', exphbs({defaultLayout: 'front', extname: '.hbs'}));
app.set('views', __dirname + '/views');
app.set('view engine', 'hbs');
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

var equipes = [];

app.get('/', (request, response) => {
    response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    // var equipes = [];
    if(equipes.length > 0) {
        response.render('index', { equipes });
    } else {
        equipes = [];
        db.collection("equipes").orderBy("classificacao", "desc").get().then(snapshot => {
            snapshot.forEach(doc => {
                // console.log(doc.emblema);
                equipes.push({
                    id: doc.id,
                    emblema: doc.data().emblema,
                    nome_curto: doc.data().nome_curto
                })
            });
            // response.send(equipes);
            response.render('index', { equipes });
        });
    }
    
    
});
app.get('/about', (request, response) => {
    response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    response.render()
    
});

app.get('/team/:id', (request, response) => {
    response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    // var equipe = [];
    if(equipes.length > 0) {
        db.collection('equipes').doc(request.params.id).get().then(doc => {
            if(doc.exists) {
                response.render('team/index', { equipes, equipe:doc.data() });
            }
        });
    } else {
        equipes = [];
        db.collection('equipes').doc(request.params.id).get().then(doc => {
            if(doc.exists) {
                db.collection("equipes").orderBy("classificacao", "desc").get().then(snapshot => {
                    snapshot.forEach(doc => {
                        equipes.push({
                            id: doc.id,
                            emblema: doc.data().emblema,
                            nome_curto: doc.data().nome_curto
                        })
                    });
                    response.render('team/index', { equipes, equipe:doc.data() });
                });
            }
        });
    }
    
    
});

app.get('/team', (request, response) => {
    response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    response.render('tema.index');
});

app.get('/admin', (request, response) => {
    response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    response.render('admin/index', { layout: 'admin' });
});

app.get('/enter_scores', (request, response) => {
    db.collection("rounds").doc("1").get().then(doc => {
        rounds = {
            id: doc.id,
            games: doc.data()
        }
        response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
        response.render('admin/enterScor', { layout: 'admin', rounds });
    });
    // response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    // response.render('admin/enterScor', { layout: 'admin', rounds });
});

app.get('/enter_scores/:id', (request, response) => {
    round = {};
    db.collection("rounds").doc("1").get().then(doc => {
        // snapshot.forEach(doc => {
            // console.log(doc.emblema);
            rounds = {
                id: doc.id,
                games: doc.data()
            }
        // });
        // response.send(equipes);
        response.send(rounds);
    }); 
});

app.post('/enter_scores', (request, response) => {
    var stringHome = "home."+request.body.home;
    var casaRef = db.collection("rounds").where("round","==",1).where("games", "array-contains", stringHome);
    
    // casaRef.update(
    //     {"games":
    //         home.name.arrayUnion("sim")
    // });

    db.collection("rounds").doc("1")
        .set(
        { games: [ { home : { casa : 0} } ] },
        { merge: false }
    )

    response.send("successfully");
});

exports.app = functions.https.onRequest(app);
