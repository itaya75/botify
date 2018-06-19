const axios = require('axios');
const config = require('../config');
var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi({});
var async = require('async');
var numOfTracksFromEachArtist;

function setAccessToken(accessToken) {
    spotifyApi.setAccessToken(accessToken);
}

function discoverArtists(accessToken, userId, artists, numOfTracksFromEachArtist) {
    setAccessToken(accessToken);
    return _artistApiCall(artists, userId, numOfTracksFromEachArtist).then(response => {
        if (response && response.body && response.body.external_urls) {
            return apiResultToCarousselle(response.body.external_urls.spotify, _getPlaylistName(artists[0]));
        } else {
            return undefined;
        }
    });
}

function _getArtistTopTracks(artistId, numOfTracksFromEachArtist) {
    return spotifyApi.getArtistTopTracks(artistId, 'US')
        .then(function (artistTopTracks) {
            if (artistTopTracks && artistTopTracks.body && artistTopTracks.body.tracks) {
                return _getRandomElementsFromArray(artistTopTracks.body.tracks, numOfTracksFromEachArtist);
            }
            return [];
        }, function (err) {
            console.log('_getArtistTopTracks: ', err);
            return undefined;
        });
}

function _getRelatedArtist(artistId) {
    return spotifyApi.getArtistRelatedArtists(artistId)
        .then(function (relatedArtistsData) {
            // console.log(relatedArtistsData.body);
            const randomRelatedArtists = _getRandomElementsFromArray(relatedArtistsData.body.artists, 9);
            const randomRelatedArtistsIds = randomRelatedArtists.map(artist => (artist.id));
            randomRelatedArtistsIds.push(artistId);
            return randomRelatedArtistsIds;
        }, function (err) {
            done(err);
        });
}

function _getArtistsTopTracks(relatedArtists, numOfTracksFromEachArtist) {
    var promises = [];
    for (var i in relatedArtists) {
        promises.push(_getArtistTopTracks(relatedArtists[i], numOfTracksFromEachArtist, this));
    }
    // return Promise.all(promises);
    return Promise.all(promises).then(function (values) {
        var allTop = values.reduce((a, b) => a.concat(b), []);
        return allTop;

    }, function () {
        console.log('_getArtistsTopTracks ' + err);
        return undefined;
    });
}

function _getRandomElementsFromArray(array, numOfElements) {
    const shuffled = array.sort(() => .5 - Math.random());// shuffle
    return shuffled.slice(0, numOfElements);
}


function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}
function _getPlaylistName(artist) {
    return toTitleCase(artist) + '\'s Playlist';
}

function _artistApiCall(artists, userId, numOfTracksFromEachArtist) {
    var artist = artists[0];
    let playlistName = _getPlaylistName(artist);
    // Search artists by name
    return spotifyApi.searchArtists(artist)
        .then(function (artistsData) {
            // Get top tracks
            if (artistsData.body.artists.items.length < 1) {
                console.log('no artists found for ', artist);
                return undefined;
            }
            const firstArtistId = artistsData.body.artists.items[0].id;
            return _getRelatedArtist(firstArtistId)
                .then(function (relatedArtists) {
                    // console.log(relatedArtists.body);
                    return spotifyApi.createPlaylist(userId, playlistName, {'public': true})
                        .then(function (playlistData) {
                            console.log('Created playlist!');
                            var playlistId = playlistData.body.id;
                            return _getArtistsTopTracks(relatedArtists, numOfTracksFromEachArtist).then(function (topTracks) {
                                if (topTracks.length < 1) {
                                    console.log('No tracks found');
                                    return undefined;
                                }
                                var tracksIds = topTracks.map(track => ("spotify:track:" + track.id)).sort(() => .5 - Math.random());
                                return spotifyApi.addTracksToPlaylist(userId, playlistId, tracksIds)
                                    .then(function (playlistStatus) {
                                        console.log('Added tracks to playlist!');
                                        return playlistData;
                                    }, function (err) {
                                        console.log('addTracksToPlaylist failed', err);
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
}

function apiResultToCarousselle(playlistUrl, playlistName) {
    console.log("playlist created: " + playlistUrl);
    var card = {
        type: 'card',
        content: {
            title: playlistName,
            subtitle: 'Powered by Botify',
            imageUrl: 'http://www.dailyrindblog.com/wp-content/uploads/2016/03/playlist2.png',
            buttons: [
                {
                    title: 'Go to playlist',
                    type: 'web_url',
                    value: playlistUrl
                }
            ]
        }
    };
    return card;
}

module.exports = {
    discoverArtists,
};
