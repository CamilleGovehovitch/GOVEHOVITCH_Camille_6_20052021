const UserModel = require('../models/User');
const bCrypt = require('bCrypt');
const jwt = require('jsonwebtoken');
// we use maskdata package to mask private data
const MaskData = require('maskdata');

const roles  = require('../role/role');
 
exports.grantAccess = function(action, resource) {
 return async (req, res, next) => {
  try {
   const permission = roles.can(req.user.role)[action](resource);
   if (!permission.granted) {
    return res.status(401).json({
     error: "You don't have enough permission to perform this action"
    });
   }
   next()
  } catch (error) {
   next(error)
  }
 }
}



exports.signup = (req, res, next) => {
  console.log('[POST] Create User');
  // MASK email before DB
  const maskEmailOptions = {
    maskWith: "())==D", 
    unmaskedStartCharactersBeforeAt: 0,
    unmaskedEndCharactersAfterAt: 0,
    maskAtTheRate: false
  };
  const maskedEmail =  MaskData.maskEmail2(req.body.email, maskEmailOptions);

  bCrypt.hash(req.body.password, 10)
    .then( hash => {
      const user = new UserModel({
        userId: req.body.id,
        email: req.body.email,
        password: hash,
        role: 'basic'
      });
      user.save()
        .then( () => res.status(201).json({message: 'Utilisateur crée avec succèes'}))
        .catch(error => {
          console.log('[ERROR]', error);
          res.status(400).json({error});
        });
    })
    .catch( error => {
      console.log('[ERROR]', error);
      res.status(500).json({error})
    });

};

exports.login = (req, res, next) => {
  console.log('[POST]Login user');

  UserModel.findOne({email: req.body.email})
    .then( user => {
      if(!user) {
         return res.status(401).json({error: 'Utilisateur non trouvé'});
      } 
      console.log('User founded');
      bCrypt.compare(req.body.password, user.password)
        .then( (valid) => {
            if (!valid) {
              return res.status(401).json({error: 'Mot de passe incorrect'});
            }
            console.log('User connected');

            const maskPasswordOptions = {
              maskWith: "X",
              unmaskedStartCharacters: 0,
              unmaskedEndCharacters: 0 
            };
            const maskEmailOptions = {
              maskWith: "*", 
              unmaskedStartCharactersBeforeAt: 0,
              unmaskedEndCharactersAfterAt: 0,
              maskAtTheRate: false
          };
            const userId = req.body.id;
            const password = req.body.password;
            const email =  req.body.email;
            const maskedPassword = MaskData.maskPassword(password, maskPasswordOptions);
            const maskedEmail =  MaskData.maskEmail2(email, maskEmailOptions);
            const maskedUserId = MaskData.maskPassword(userId, maskPasswordOptions);
            console.log(user._id);
            res.status(200).json({
              userId: user._id,
              token: jwt.sign(
                { userId: user._id },
                'RANDOM_TOKEN_SECRET',
                { expiresIn: '24h' }
              ),
              // role: user.role
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
