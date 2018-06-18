const config = require('../config');
const {discoverArtists} = require('./songsApi');
const constants = require('./constants');

function spotifyConnectionRoute(app) {

    app.post('/search-artist', function (req, res) {
        console.log('[POST] /search-artist');
        const artists = req.body.artists;
        var accessToken = req.headers.accesstoken;
        var userId = req.headers.userid;
        // const movie = req.body.conversation.memory['movie'];
        // const tv = req.body.conversation.memory['tv'];
        //
        // const kind = movie ? 'movie' : 'tv';
        //
        // const genre = req.body.conversation.memory['genre'];
        // const genreId = constants.getGenreId(genre.value);
        //
        // const language = req.body.conversation.memory['language'];
        // const nationality = req.body.conversation.memory['nationality'];
        //
        // const isoCode = language
        //   ? language.short.toLowerCase()
        //   : nationality.short.toLowerCase();

        return discoverArtists(accessToken, userId, artists)
            .then(function (carouselle) {
                res.json({
                    replies: carouselle,
                });
            })
            .catch(function (err) {
                console.error('songsApi::discoverArtists error: ', err);
            });
    });
}

module.exports = spotifyConnectionRoute;
