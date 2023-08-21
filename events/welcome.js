const { Events, AttachmentBuilder } = require('discord.js');
const { createCanvas, Image } = require('@napi-rs/canvas');
const { readFile } = require('fs/promises');
const { request } = require('undici');
const { EmbedBuilder } = require('discord.js')

const applyText = (canvas, text) => {
	const context = canvas.getContext('2d');
	// Declare a base size of the font
	let fontSize = 60;
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
 
const canvas = createCanvas(700, 250);
const context = canvas.getContext('2d');

const background = await readFile('./Dusk_Blvd.png');
const backgroundImage = new Image();
backgroundImage.src = background;
context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
context.lineWidth = 5;

// Border 
context.strokeStyle = 'rgba(0, 8, 125, 1)';
context.strokeRect(0, 0, canvas.width, canvas.height);

/* // Opacity
context.fillStyle = 'rgba(0, 0, 0, 0.5)';
context.fillRect(250, 25, canvas.width / 1.8, canvas.height - 50)
 */
// Welcome
context.font = 'italic 60px Gabriola';
context.strokeStyle = 'rgba(0, 0, 0, 0.5)'
context.strokeText('Welcome!', canvas.width / 2.5, canvas.height / 2.5);
context.fillStyle = '#ffffff';
context.fillText('Welcome!', canvas.width / 2.5, canvas.height / 2.5);


// Display Name
context.strokeStyle = 'rgba(0, 0, 0, 0.5)'
context.font = applyText(canvas, member.displayName);
context.strokeText(member.displayName, canvas.width / 2.5, canvas.height / 1.6);
context.fillStyle = '#ffffff';
context.fillText(member.displayName, canvas.width / 2.5, canvas.height / 1.6);

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
		// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild
    const welcomeEmbed = new EmbedBuilder()
    .setColor(0x8d00ce)
    .setTitle(`Welcome to ${member.guild.name}`)
    .setAuthor({ name: `${member.user.displayName} (${member.user.id})`, iconURL: `${member.user.displayAvatarURL()}`})
    .setDescription(
      `We ask that you please:\n\n\u2022 Read and react to the <#1136445872201269409>\n\u2022 Grab an **AGE** role from <#1136445756732100738> \n\u2022Tell us a little about yourself in <#1136445710619914372>\n\nIf you need assistance please ping <@&1136443489199067319>.`
      )
    .setThumbnail(member.user.displayAvatarURL())
    .setImage('attachment://profile-image.png')
    .setTimestamp()
    .setFooter({ text: `${member.guild.name}`, iconURL: `${member.guild.iconURL()}` });

    const welcomeChannel = member.guild.channels.cache.get('1136445147547185252');
    await welcomeChannel.send({embeds: [welcomeEmbed], files: [attachment]});
    
    const logChannel = member.guild.channels.cache.get('1136485668902682706');
    await logChannel.send({embeds: [welcomeEmbed], files: [attachment]});
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
