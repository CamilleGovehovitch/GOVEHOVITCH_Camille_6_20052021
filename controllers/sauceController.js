const SauceModel = require('../models/sauce.js');
const UserModel = require('../models/User');
const jwt = require('jsonwebtoken');

const fs = require('fs');

exports.getSauce = (req, res, next) => {
    SauceModel.findOne({
        _id: req.params.id
    }).then((sauce) => {
        console.log('[GET] One Sauce on api');
        res.status(200).json(sauce)
    }).catch((error) => {
        console.log('[ERROR]', error)
        res.status(404).json({error})
    });
}

exports.createSauce = (req, res, next) => {
    console.log('[POST] Sauce');
    const body = JSON.parse(req.body.sauce);
    delete body._id;

    const Sauce = new SauceModel({
        ...body,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    Sauce.save().then(() => {
        res.status(201).json({
            message: 'Post saved successfully!'
        });
    }).catch(
        (error) => {
            console.log('[ERROR]', error);
            res.status(400).json({
                error: error
            });
        }
    );
}

// password validator -> mdp
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
      {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      } : { ...req.body };
    SauceModel.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Objet modifié !'}))
      .catch(error => res.status(400).json({ error }));
  };

exports.deleteSauce = (req, res, next) => {
    SauceModel.findOne({ _id: req.params.id })
      .then(sauce => {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          SauceModel.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
            .catch(error => res.status(400).json({ error }));
        });
      })
      .catch(error => res.status(500).json({ error }));
  };

exports.getSauces = (req, res, next) => {
    console.log('[GET] all Sauces on api/sauces')
    SauceModel.find().then(
        (sauces) => {
            res.status(200).json(sauces);
        }
    ).catch(
        (error) => {
            console.log('[ERROR]', error );
            res.status(400).json({
                error: error
            });
        }
    );
};

exports.likeOrDislikeSauce = (req, res, next) => {
    console.log('[POST] Like Sauce');
    // récupération du userId à l'aide du token
    const auth = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(auth, 'RANDOM_TOKEN_SECRET');
    const likeType = req.body.like;

    // trouver la sauce que l'on souhaite like 
    // bind permet de dire quand jappelle la fct je lie les propriétes, null sera 
    // la valeur de la promesse et je passe likeType et le decoded token ds un autre parametre
    SauceModel.findOne({_id: req.params.id}).then(dealWithLikes.bind(null, likeType, decodedToken))
        .then( (sauce) => {
                res.status(200).json(sauce);
        })
        .catch( (error) => {
            res.status(400).json(error);
        })
}
// la fct gère les cas like, unlike, dislike, undislike. 
// prend trois params, le type de like(1, -1, 0), le token décodé pour récuperer le user id
// et la sauce à like
const dealWithLikes = (likeType, decodedToken, sauce) => {
    let included;
    switch(likeType) {
                // Like
        case 1:
            included = sauce.usersLiked.includes(decodedToken.userId);
            if(!included) {
                sauce.likes += 1 ;
                sauce.usersLiked.push(decodedToken.userId);
                return sauce.save()
            } else {
                // nouvelle promesse qui retourne une erreur
                return new Promise((resolve, reject) => {
                    return reject({error: 'not liked'});
                });
            }
            break;
            // dislike
        case -1:
            included = sauce.usersDisliked.includes(decodedToken.userId);
            if(!included) {
                sauce.dislikes -= 1;
                sauce.usersDisliked.push(decodedToken.userId);
                return sauce.save()
            } else {
                return new Promise((resolve, reject) => {
                    return reject({error: 'not disliked'});
                });
            }
            break;
        default:
            // unlike, undislike
            let kind = '';
            if(sauce.usersLiked.includes(decodedToken.userId)) {
                kind = 'like';
            }
            if(sauce.usersDisliked.includes(decodedToken.userId)) {
                kind = 'dislike';
            }
            if(kind === 'like') {
                sauce.likes -= 1;
                sauce.usersLiked.splice(decodedToken.userId, 1);
                return sauce.save();
            } else if(kind === 'dislike') {
                sauce.dislikes -= 1;
                sauce.usersDisliked.splice(decodedToken.userId, 1);
                return sauce.save()
            } else {
                return new Promise((resolve,reject) => {
                    return reject({error: 'can not unlike or undislike'});
                }) ;               
            }
            break;
    }
}
 