const express = require('express');
const saucesRoutes = require('./routes/sauceRoutes');
const userRoutes = require('./routes/userRoutes');
const path = require('path');

const helmet = require("helmet");

const mongoose = require('mongoose');

const app = express();
// définit l’en-tête Content-Security-Policy 
// pour la protection contre les attaques de type cross-site scripting et autres injections intersites
app.use(helmet.contentSecurityPolicy());
app.use(helmet.dnsPrefetchControl());
app.use(helmet.expectCt());
// 
app.use(helmet.frameguard());

// supprime l’en-tête X-Powered-By.
app.use(helmet.hidePoweredBy());

// définit l’en-tête Strict-Transport-Security qui impose des connexions (HTTP sur SSL/TLS) sécurisées au serveur.
app.use(helmet.hsts());
// définit X-Download-Options pour IE8+.
app.use(helmet.ieNoOpen());
// définit X-Content-Type-Options pour protéger les navigateurs 
// du reniflage du code MIME d’une réponse à partir du type de contenu déclaré.
app.use(helmet.noSniff());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());

// securisation avec les autorisation d'en tete
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

mongoose.connect('mongodb+srv://camilleG:%23B%40con93100@databasecluster.g1ov1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
    { useNewUrlParser: true,
        useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/sauces', saucesRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;

// helmet permet dattenuer les attaques, dns, ssl, 
// deux type d'admin peuvent effectuer des actions ds la db
// cree un admin sur mongo db read write any database
