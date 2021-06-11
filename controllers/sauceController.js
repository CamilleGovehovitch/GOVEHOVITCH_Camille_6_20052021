const SauceModel = require('../models/sauce.js');

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
    const body = JSON.parse(req.body.sauce);
    delete body._id;

    console.log(body, 'body');
    const Sauce = new SauceModel({
        // userId: body.userId,
        // name: body.name,
        // manufacturer: body.manufacturer,
        // description: body.description,
        // mainPepper: body.mainPepper,
        // imageUrl: body.imageUrl,
        // heat: body.heat,
        // likes: body.likes,
        // dislikes: body.dislikes,
        // usersLiked: body.usersLiked,
        // usersDisliked: body.usersDisliked
        ...body,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`    
    });
    console.log(Sauce, 'sauce');
    console.log(Sauce.imageUrl);
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

exports.likeOneSauce = (req, res, next) => {
    console.log('[POST] Like one Sauce');
    const body = req.body;
    const params = req.params;
    const Sauce = new SauceModel({
        _id: body.id,
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
    console.log(Sauce, 'SAUCE');
    Sauce.save()
        .then( () => {
            res.status(201).json({message: 'Sauce liked'})
    })  .catch(
        (error) => {
            console.log('[ERROR]', error);
            res.status(400).json({error})
        })
}
