const config = require('../config');
const {discoverArtists} = require('./songsApi');
const constants = require('./constants');
let utilities = require('../utils/utilities.js');
let accessToken;
let userId;

function spotifyConnectionRoute(app) {
    app.post('/login', function (req, res) {
        accessToken = req.headers.accesstoken;
        userId = req.headers.userid;
        return utilities.setResponse(res, 'OK', "user logged in", 200, {});
    });

    app.post('/search-artist', _isLoggedIn, function (req, res) {
        console.log('[POST] /search-artist');
        // get artist
        const artists = [];
        if (!req.body.conversation || !req.body.conversation.memory || !req.body.conversation.memory.artist|| !req.body.conversation.memory.artist.value) {
            return utilities.setErrorResponse(res, 'ERROR', "wrong input", 400);
        }
        artists.push(req.body.conversation.memory.artist.value);

        // get num tracks
        if (!req.body.conversation || !req.body.conversation.memory || !req.body.conversation.memory.number || !req.body.conversation.memory.number.scalar) {
            return utilities.setErrorResponse(res, 'ERROR', "wrong number input", 400);
        }
        var num = req.body.conversation.memory.number.scalar;
        var numOfTracksFromEachArtist = num / 10;
        // var numOfTracksFromEachArtist = req.body.numoftracks / 10;
        // var accessToken = req.headers.accesstoken;
        // var userId = req.headers.userid;
        return discoverArtists(accessToken, userId, artists, numOfTracksFromEachArtist)
            .then(function (carouselle) {
                if (carouselle) {
                    res.json({
                        replies: carouselle,
                    });
                } else {
                    return utilities.setErrorResponse(res, 'ERROR', "No artists found", 400);
                }
            })
            .catch(function (err) {
                console.error('songsApi::discoverArtists error: ', err);
            });
    });
}

function _isLoggedIn(req, res, next) {
    if (!accessToken || !userId) {
        console.log("No Spotify user found");
        return utilities.setErrorResponse(res, 'ERROR', "No Spotify user found", 401);
    }
    return next();
}

module.exports = spotifyConnectionRoute;
