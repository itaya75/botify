const axios = require('axios');
const config = require('../config');
var SpotifyWebApi = require('spotify-web-api-node');
// credentials are optional
var spotifyApi = new SpotifyWebApi({
    // clientId: 'fcecfc72172e4cd267473117a17cbd4d',
    // clientSecret: 'a6338157c9bb5ac9c71924cb2940e1a7',
    // redirectUri: 'http://www.example.com/callback'
});
var token = require('../private/token.json');
var accessToken = token.accessToken;
//TODO: get user's real access token

spotifyApi.setAccessToken(accessToken);

function discoverArtists(kind, genreId, language) {
  return artistApiCall(kind, genreId, language).then(response =>
    apiResultToCarousselle(response.data.results)
  );
}

function artistApiCall(kind, genreId, language) {
    spotifyApi.getArtistAlbums('43ZHCT0cAZBISjO8DG9PnE').then(
        function(data) {
            console.log('Artist albums', data.body);
        },
        function(err) {
            console.error(err);
        }
    );



  return axios.get(`https://api.themoviedb.org/3/discover/${kind}`, {
    params: {
      api_key: config.MOVIEDB_TOKEN,
      sort_by: 'popularity.desc',
      include_adult: false,
      with_genres: genreId,
      with_original_language: language,
    },
  });
}

function apiResultToCarousselle(results) {
  if (results.length === 0) {
    return [
      {
        type: 'quickReplies',
        content: {
          title: 'Sorry, but I could not find any results for your request :(',
          buttons: [{ title: 'Start over', value: 'Start over' }],
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
  }));

  return [
    {
      type: 'text',
      content: "Here's what I found for you!",
    },
    { type: 'carousel', content: cards },
  ];
}

module.exports = {
  discoverArtists,
};
