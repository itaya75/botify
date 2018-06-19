const config = require('../config');
const {discoverArtists} = require('./songsApi');
const constants = require('./constants');
let utilities = require('../utils/utilities.js');

function spotifyConnectionRoute(app) {
    app.post('/search-artist', function (req, res) {
        console.log('[POST] /search-artist');
        const artists = req.body.artists;
        var numOfTracksFromEachArtist =  req.body.numoftracks / 10;
        var accessToken = req.headers.accesstoken;
        var userId = req.headers.userid;
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

module.exports = spotifyConnectionRoute;
