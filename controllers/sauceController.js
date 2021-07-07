const SauceModel = require('../models/sauce');

exports.getOneSauce = (req, res, next) => {
    SauceModel.findOne({
        _id: req.params.id
    }).then((sauce) => {
        console.log('[GET] One Sauce on api');
        res.status(200).json(sauce)
    }).catch((error) => {
        console.log('[ERROR][DB]', error)
        res.status(404).json({error})
    });
}

exports.createSauce = (req, res, next) => {
    console.log('[POST] Sauce');
    const body = req.body;
    const Sauce = new SauceModel({
        id: body.id,
        userId: body.userId,
        name: body.name,
        manufacturer: body.manufacturer,
        description: body.description,
        mainPepper: body.mainPepper,
        imageUrl: body.imageUrl,
        heat: body.heat,
        likes: body.likes,
        dislikes: body.dislikes,
        usersLiked: body.usersLiked,
        usersDisliked: body.usersDisliked
    });
    Sauce.save().then(() => {
        res.status(201).json({
            message: 'Post saved successfully!'
        });
    }).catch(
        (error) => {
            console.log('[ERROR][DB]', error);
            res.status(400).json({
                error: error
            });
        }
    );
}

exports.modifyOneSauce = (req, res, next) => {
    const params = req.params;
    const Sauce = new SauceModel({
        _id: params.id,
        userId: params.userId,
        name: params.name,
        manufacturer: params.manufacturer,
        description: params.description,
        mainPepper: params.mainPepper,
        imageUrl: params.imageUrl,
        heat: params.heat,
        likes: params.likes,
        dislikes: params.dislikes,
        usersLiked: params.usersLiked,
        usersDisliked: params.usersDisliked
    });
    SauceModel.updateOne({_id: req.params.id}, Sauce)
        .then( () => {
            console.log('[PUT] Sauce Modified');
            res.status(201).json({message: 'Sauce modify succefully'});
    }).catch(
        (error) => {
            console.log('[ERROR]', error);
            res.status(400).json({error});
        })
}

exports.deleteOneSauce = (req, res, next) => {
    console.log('[DELETE] One Sauce');
    SauceModel.deleteOne({_id: req.params.id})
        .then( () => {
            console.log('[DELETE]Sauce deleted');
            res.status(200).json({message: 'Sauce deleted succefully'})
    }).catch(
        (error) => {
            console.log('[ERROR], error');
            res.status(400).json({error});
        }
    )
}

exports.getAllSauce = (req, res, next) => {
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
    const decodedToken = jwt.verify(auth, process.env.DB_SECRET_KEY);
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
                sauce.dislikes += 1;
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