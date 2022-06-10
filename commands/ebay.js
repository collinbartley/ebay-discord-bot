const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ebay')
		.setDescription('Finds a product on ebay!')
		.addIntegerOption(option =>
			option.setName('amount')
				.setDescription('Search for listings near this amount of money.')
				.setRequired(false)),
	async execute(interaction) {
		await interaction.deferReply();
		const amount = interaction.options.getInteger('amount');
		const url = await getEbayUrl(amount);
		const listing = await getListingFromUrl(url);
		await interaction.editReply(listing);
	},
};

async function getEbayUrl(amount) {
	let min;
	let max;

	if (amount) {
		min = amount * 0.6;
		max = amount * 1.25;
	}
	else {
		min = 1;
		max = 100000;
	}

	console.log(min, max);


	return axios.get('https://random-word-api.herokuapp.com/word?number=1')
		.then(res => {
			console.log(res.data[0]);
			const term = res.data[0];
			const url = `https://www.ebay.com/sch/i.html?_from=R40&_nkw=${term}&_sacat=0&LH_FS=1&LH_BIN=1&rt=nc&_udlo=${min}&_udhi=${max}`;
			return url;
		});
}

function getListingFromUrl(url) {
	return axios.get(url)
		.then(res => {
			const $ = cheerio.load(res.data);
			const link = $('.srp-results .s-item__link').attr('href');

			if (link) {
				return link;
			}
			else {
				return 'No listing found...try again?';
			}
		})
		.catch(error => {
			console.log(error);
			return 'Whoops, try again!';
		});
}