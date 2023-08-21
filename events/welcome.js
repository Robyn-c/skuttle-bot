const { Events, AttachmentBuilder } = require('discord.js');
const { createCanvas, Image } = require('@napi-rs/canvas');
const { readFile } = require('fs/promises');
const { request } = require('undici');

const applyText = (canvas, text) => {
	const context = canvas.getContext('2d');
	// Declare a base size of the font
	let fontSize = 70;
	do {
		// Assign the font to the context and decrement it so it can be measured again
		context.font = `${fontSize -= 10}px Calibri`;
		// Compare pixel width of the text to the canvas minus the approximate avatar size
	} while (context.measureText(text).width > canvas.width - 300);
	// Return the result to use in the actual canvas
	return context.font;
};

module.exports = {
	name: Events.GuildMemberAdd,
	async execute(member) {
    console.log([member.id, member.displayName])
/*
     */
    
    const canvas = createCanvas(700, 250);
		const context = canvas.getContext('2d');

		const background = await readFile('./Welcome_banner.jpg');
		const backgroundImage = new Image();
		backgroundImage.src = background;
		context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    context.lineWidth = 5;

    // Border 
    context.strokeStyle = 'rgba(0, 8, 125, 1)';
    context.strokeRect(0, 0, canvas.width, canvas.height);

    // Welcome
    context.font = 'italic 54px Gabriola';
    context.strokeStyle = 'rgba(0, 0, 0, 0.5)'
    context.strokeText('Welcome!', canvas.width / 2, canvas.height / 3);
	  context.fillStyle = '#ffffff';
	  context.fillText('Welcome!', canvas.width / 2, canvas.height / 3);
    

    // Display Name
    context.strokeStyle = 'rgba(0, 0, 0, 0.5)'
    context.font = applyText(canvas, member.displayName);
    context.strokeText(member.displayName, canvas.width / 2.5, canvas.height / 1.8);
    context.fillStyle = '#ffffff';
    context.fillText(member.displayName, canvas.width / 2.5, canvas.height / 1.8);

    // Avatar Img
		context.beginPath();
		context.arc(125, 125, 100, 0, Math.PI * 2, true);
		context.closePath();
    context.stroke()
		context.clip();
    
		const { body } = await request(member.displayAvatarURL({ format: 'jpg' }));
		const avatar = new Image();
		avatar.src = Buffer.from(await body.arrayBuffer());
		context.drawImage(avatar, 25, 25, 200, 200);

		const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'profile-image.png' });
    const welcomeChannel = member.guild.channels.cache.get('1136445147547185252');
    welcomeChannel.send({files: [attachment]})

    const { user, guild } = member;
    
/* 
    const welcomeEmbed = new EmbedBuilder()
    .setTitle("**New Member!**")
    .setDescription(welcomeMessage)
    .setImage('https://i.kym-cdn.com/entries/icons/mobile/000/026/489/crying.jpg')
    .setFields({name: 'fuck', value: 'awsedfrjniklop[ghsrtopdfihjsdrftyiklop;h'})
    .setColor(0x037821)
    .setTimestamp(); */
  },
};
