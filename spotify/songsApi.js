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

function discoverArtists(accessToken, userId, artists) {
    setAccessToken(accessToken);
    return artistApiCall(artists, userId).then(response =>
        apiResultToCarousselle(response.body.external_urls.spotify)
    );
}

function _getArtistTopTracks(artistId) {
    return spotifyApi.getArtistTopTracks(artistId, 'US');
}

function _getRelatedArtist(artistId) {
    return spotifyApi.getArtistRelatedArtists(artistId)
        .then(function(data) {
            console.log(data.body);
            const randomRelatedArtists = _getRandomElementsFromArray(data.body.artists, 4);
            const randomRelatedArtistsIds = randomRelatedArtists.map(artist => (artist.id));
            return randomRelatedArtistsIds.push(artistId);
        }, function(err) {
            done(err);
        });
}

function _getRandomElementsFromArray(array, numOfElements) {
    const shuffled = array.sort(() => .5 - Math.random());// shuffle
    return shuffled.slice(0,numOfElements) ;
}

function artistApiCall(artists, userId) {
    //TODO: loop over all artists
    var artist = artists[0];
    let that = this;
    // Search artists by name
    return spotifyApi.searchArtists(artist)
        .then(function (artistsData) {
            // Get top tracks
            const firstArtistId = artistsData.body.artists.items[0].id;
            return _getRelatedArtist(firstArtistId)
                .then(function (relatedArtists) {
                    console.log(relatedArtists.body);
                    return spotifyApi.createPlaylist(userId, 'My Cool Playlist', {'public': true})
                        .then(function (playlistData) {
                            console.log('Created playlist!');
                            var playlistId = playlistData.body.id;
                            var tracks = artistTopTracks.body.tracks;
                            var tracksIds = tracks.map(track => ("spotify:track:" + track.id));
                            return spotifyApi.addTracksToPlaylist(userId, playlistId, tracksIds)
                                .then(function (playlistStatus) {
                                    // that.
                                    console.log('Added tracks to playlist!');
                                    return playlistData;
                                }, function (err) {
                                    console.log('Something went wrong!', err);
                                });
                        }, function (err) {
                            console.log('Something went wrong!', err);
                        });
                }, function (err) {
                    console.log('Something went wrong!', err);
                });
        }, function (err) {
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

function apiResultToCarousselle(playlistUrl) {
    /*if (results.length === 0) {
        return [
            {
                type: 'quickReplies',
                content: {
                    title: 'Sorry, but I could not find any results for your request :(',
                    buttons: [{title: 'Start over', value: 'Start over'}],
                },
            },
        ];
    }*/

    const card = {
        title: "title",
        subtitle: "subtitle",
        imageUrl: ``,
        buttons: [
            {
                type: 'web_url',
                value: playlistUrl,
                title: 'Playlist',
            },
        ],
    };

    /*const cards = results.slice(0, 10).map(e => ({
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
    );*/

    return [
        {
            type: 'text',
            content: "Here is your new playlist",
        },
        {type: 'carousel', content: card},
    ];
}

module.exports = {
    discoverArtists,
};
