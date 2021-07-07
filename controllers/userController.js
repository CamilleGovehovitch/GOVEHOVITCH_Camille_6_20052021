const UserModel = require('../models/User');
const bCrypt = require('bCrypt');
const jwt = require('jsonwebtoken');

exports.signup = (req, res, next) => {
  console.log('[POST] Create User');
  bCrypt.hash(req.body.password, 10)
    .then( hash => {
      console.log(req.body);
      const user = new UserModel({
        email: req.body.email,
        password: hash
      });
      console.log(user);
      user.save()
        .then( () => res.status(201).json({message: 'Utilisateur crée avec succèes'}))
        .catch(error => {
          console.log('[400]', error);
          res.status(400).json({error});
        });
    })
    .catch( error => {
      console.log('[500]', error);
      res.status(500).json({error})
    });

};

exports.login = (req, res, next) => {
  console.log('[POST]Login user');
  UserModel.findOne({email: req.body.email})
    .then( user => {
      if(!user) {
         return res.status(401).json({error: 'Utilisateur non trouvé'})
      } 
      console.log('User founded');
      bCrypt.compare(req.body.password, user.password)
        .then( (valid) => {
            if (!valid) {
              return res.status(401).json({error: 'Mot de passe incorrect'});
            }
            console.log('User connected');
            res.status(200).json({
              userId: user._id,
              token: jwt.sign(

                { userId: user._id },
                process.env.DB_SECRET_KEY,
                { expiresIn: '24h' }
              ),
            });
        })
        .catch(error => {
          console.log(['[500]', error]);
          res.status(500).json({error});
        })
    })
    .catch(error => {
      console.log('[500]', error);
      res.status(500).json({error});
    });
};
