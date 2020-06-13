#!/usr/bin/env node
const REQUEST_URL = "https://www.imdb.com/title/";
const BASE_URL = "https://www.imdb.com"
const axios = require('axios');
const cheerio = require('cheerio');
const args = process.argv.slice(2);
function getMovie(ID) {
    axios.get(REQUEST_URL + ID).then(async function (response) {
        const $ = cheerio.load(response.data);
        let categories = []
        $('#title-overview-widget > div.vital > div.title_block > div > div.titleBar > div.title_wrapper > div > a').each(function (i, ct) {
            let category = $(ct).text();
            if (!category.includes('TV')) {
                categories.push(category)
            }
            return categories;
        })
        let trailer = await $('#title-overview-widget > div.vital > div.slate_wrapper > div.videoPreview.videoPreview--autoPlaybackOnce > div.slate > a').attr('href') || $('#titleVideoStrip > div.mediastrip_big > span:nth-child(1) > a').attr('href');
        if (trailer === undefined) {
            trailer = null;
        } else {
            trailer = BASE_URL + trailer;
        }
        let stars = []
        $('div.plot_summary > div:nth-child(4)').find('a').each((i, str) => {
            let star = $(str).text().trim();

            if (!star.split('|')[0].includes('See full cast & crew')) {
                stars.push(star)
            }
        })
        const name = $('#title-overview-widget > div.vital > div.title_block > div > div.titleBar > div.title_wrapper > h1').text().trim();
        const charOne = name.indexOf('(') + 1;
        const charTwo = name.indexOf(')');
        const year = name.slice(charOne, charTwo);
        const movie = {
            id: ID,
            name: name,
            year: year,
            rating: $('span[itemProp="ratingValue"]').text(),
            director: $('#title-overview-widget > div.minPosterWithPlotSummaryHeight > div:nth-child(3) > div.plot_summary > div:nth-child(2) > a').text().trim() || $('#title-overview-widget > div.minPosterWithPlotSummaryHeight > div:nth-child(2) > div.plot_summary > div:nth-child(2) > a').text().trim() || $('#title-overview-widget > div.plot_summary_wrapper > div.plot_summary > div:nth-child(2) > a').text().trim(),
            stars: stars,
            categories: categories,
            description: $('div.summary_text').text().trim(),
            poster: $('div.poster a img').attr('src'),
            trailer: trailer
        }
        console.clear();
        console.log("\x1b[36mName:", movie.name)
        console.log("Year:", movie.year)
        console.log("Rating:", movie.rating)
        console.log("Director:", movie.director)
        console.log("Stars:", movie.stars.join(' - '))
        console.log("Genres:", movie.categories.join(' - '))
        console.log("Description:", movie.description)
        console.log("Poster:", movie.poster)
        if (movie.trailer){
            console.log("Trailer:", movie.trailer)
        }
    }).catch(err => {
        console.log(err)
    })
}

if (args.length > 0){
    getMovie(args[0])
}else {
    console.warn('You need specify some movie ID')
}
