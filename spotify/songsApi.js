const axios = require('axios');
const config = require('../config');
var SpotifyWebApi = require('spotify-web-api-node');
// credentials are optional
var spotifyApi = new SpotifyWebApi({
    // clientId: 'fcecfc72172e4cd267473117a17cbd4d',
    // clientSecret: 'a6338157c9bb5ac9c71924cb2940e1a7',
    // redirectUri: 'http://www.example.com/callback'
});

function setAccessToken(accessToken) {
    spotifyApi.setAccessToken(accessToken);
}
function discoverArtists(accessToken, artists) {
    setAccessToken(accessToken);
    return artistApiCall(artists).then(response =>
        apiResultToCarousselle(response.data.results)
    );
}

function artistApiCall(artists) {
    //TODO: loop over all artists
    var artist = artists[0];
    // Search artists by name
    spotifyApi.searchArtists(artist)
        .then(function(data) {
            console.log('Search artists by "Love"', data.body);
            // Get top tracks
            


        }, function(err) {
            console.error(err);
        });

    /*spotifyApi.getArtistAlbums('43ZHCT0cAZBISjO8DG9PnE').then(
        function (data) {
            console.log('Artist albums', data.body);
        },
        function (err) {
            console.error(err);
        }
    );*/
}

function apiResultToCarousselle(results) {
    if (results.length === 0) {
        return [
            {
                type: 'quickReplies',
                content: {
                    title: 'Sorry, but I could not find any results for your request :(',
                    buttons: [{title: 'Start over', value: 'Start over'}],
                },
            },
        ];
    }

    const cards = results.slice(0, 10).map(e => ({
        title: e.title || e.name,
        subtitle: e.overview,
        imageUrl: `https://image.tmdb.org/t/p/w640${e.poster_path}`,
        buttons: [
            {
                type: 'web_url',
                value: `https://www.themoviedb.org/movie/${e.id}`,
                title: 'View More',
            },
        ],
    })
)
    ;

    return [
        {
            type: 'text',
            content: "Here's what I found for you!",
        },
        {type: 'carousel', content: cards},
    ];
}

module.exports = {
    discoverArtists,
};
