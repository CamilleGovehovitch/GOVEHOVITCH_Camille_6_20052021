const UserModel = require('../models/User');
const bCrypt = require('bCrypt');
const jwt = require('jsonwebtoken');
// we use maskdata to mask private data
const MaskData = require('maskdata');
 // MASK options 
 const maskEmailOptions = {
  maskWith: "X", 
  unmaskedStartCharactersBeforeAt: 0,
  unmaskedEndCharactersAfterAt: 10,
  maskAtTheRate: false
};

exports.signup = (req, res, next) => {
  console.log('[POST] Create User');
  // on mask une partie de l'email en db
  const maskedEmail =  MaskData.maskEmail2(req.body.email, maskEmailOptions);

  bCrypt.hash(req.body.password, 10)
    .then( hash => {
      const user = new UserModel({
        email: maskedEmail,
        password: hash
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
// decoder l'email afinde se connecter avec mskdata
// 
exports.login = (req, res, next) => {
  console.log('[POST]Login user');
  // on utilise le même mask pour retrouver l'email en db et se connecter
  UserModel.findOne({email: MaskData.maskEmail2(req.body.email, maskEmailOptions)})
    .then( user => {
      if(!user) {
         return res.status(401).json({error: 'Utilisateur non trouvé'});
      } 
      bCrypt.compare(req.body.password, user.password)
        .then( (valid) => {
            if (!valid) {
              return res.status(401).json({error: 'Mot de passe incorrect'});
            }
            res.status(200).json({
              userId: user._id,
              token: jwt.sign(
                { userId: user._id },
                'RANDOM_TOKEN_SECRET',
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



// proteger contre injection sql avec mongoose et helmet (protege contre certaine vunlerabilite) - fait
// securiser l'auth broken authentification - 
// cryptage ssl, certificat
// maskdata pense a decoder ce qui est maské - fait
// pas de role

// const mask = MaskD