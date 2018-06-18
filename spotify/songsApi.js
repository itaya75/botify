const axios = require('axios');
const config = require('../config');
var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi({});
var async = require('async');
var topTracks;

function setAccessToken(accessToken) {
    spotifyApi.setAccessToken(accessToken);
}

function discoverArtists(accessToken, userId, artists) {
    setAccessToken(accessToken);
    return _artistApiCall(artists, userId).then(response => {
        if (response && response.body && response.body.external_urls) {
            return apiResultToCarousselle(response.body.external_urls.spotify);
        } else {
            return undefined;
        }
    });
}

function _getArtistTopTracks(artistId) {
    return spotifyApi.getArtistTopTracks(artistId, 'US')
        .then(function (artistTopTracks) {
            if (artistTopTracks && artistTopTracks.body && artistTopTracks.body.tracks){
                topTracks = topTracks.concat(artistTopTracks.body.tracks);
            }
        });
}

function _getRelatedArtist(artistId) {
    return spotifyApi.getArtistRelatedArtists(artistId)
        .then(function (relatedArtistsData) {
            // console.log(relatedArtistsData.body);
            const randomRelatedArtists = _getRandomElementsFromArray(relatedArtistsData.body.artists, 4);
            const randomRelatedArtistsIds = randomRelatedArtists.map(artist => (artist.id));
            randomRelatedArtistsIds.push(artistId);
            return randomRelatedArtistsIds;
        }, function (err) {
            done(err);
        });
}

function _getArtistsTopTracks(relatedArtists) {
    topTracks = [];
    async.each(relatedArtists, _getArtistTopTracks, function (err) {
        // if any of artists produced an error, err would equal that error
        if (err) {
            // One of the iterations produced an error. All processing will now stop.
            console.log('Could not get artist top tracks ' + err);
            return undefined;
        } else {
            console.log('top tracks found successfully');
            return topTracks;
        }
    });
}

function _getRandomElementsFromArray(array, numOfElements) {
    const shuffled = array.sort(() => .5 - Math.random());// shuffle
    return shuffled.slice(0, numOfElements);
}

function _artistApiCall(artists, userId) {
    //TODO: loop over all artists
    var artist = artists[0];
    // Search artists by name
    return spotifyApi.searchArtists(artist)
        .then(function (artistsData) {
            // Get top tracks
            const firstArtistId = artistsData.body.artists.items[0].id;
            return _getRelatedArtist(firstArtistId)
                .then(function (relatedArtists) {
                    // console.log(relatedArtists.body);
                    return spotifyApi.createPlaylist(userId, 'My Cool Playlist', {'public': true})
                        .then(function (playlistData) {
                            console.log('Created playlist!');
                            var playlistId = playlistData.body.id;
                            return _getArtistsTopTracks(relatedArtists).then(function (topTracks) {
                                var tracksIds = topTracks.map(track => ("spotify:track:" + track.id));
                                return spotifyApi.addTracksToPlaylist(userId, playlistId, tracksIds)
                                    .then(function (playlistStatus) {
                                        // that.
                                        console.log('Added tracks to playlist!');
                                        return playlistData;
                                    }, function (err) {
                                        console.log('Something went wrong!', err);
                                        return undefined;
                                    });
                            });

                        }, function (err) {
                            console.log('Something went wrong!', err);
                            return undefined;
                        });
                }, function (err) {
                    console.log('Something went wrong!', err);
                    return undefined;
                });
        }, function (err) {
            console.error(err);
            return undefined;
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
