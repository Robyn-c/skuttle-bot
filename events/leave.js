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
  name: Events.GuildMemberRemove,
  async execute(member) {
    const canvas = createCanvas(700, 250);
    const context = canvas.getContext('2d');

    const background = await readFile('./Leave_banner.jpg');
    const backgroundImage = new Image();
    backgroundImage.src = background;
    context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    context.lineWidth = 5;

    // Border 
    context.strokeStyle = 'rgba(0, 8, 125, 1)';
    context.strokeRect(0, 0, canvas.width, canvas.height);

    // Goodbye
    context.font = 'italic 60px Gabriola';
    context.strokeStyle = 'rgba(0, 0, 0, 0.5)'
    context.strokeText('Goodbye,', canvas.width / 2.5, canvas.height / 2.5);
    context.fillStyle = '#ffffff';
    context.fillText('Goodbye,', canvas.width / 2.5, canvas.height / 2.5);


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

    const attachment = new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'leave-banner.png' });
    const leaveEmbed = new EmbedBuilder()
    .setColor(0x8D00CE)
    .setTitle(`We're sad to see you leave...`)
    .setAuthor({ name: `${member.user.displayName} (${member.user.id})`, iconURL: `${member.user.displayAvatarURL()}`})
    .setDescription(`Please take care.`)
    .setTimestamp()
    .setImage('attachment://leave-banner.png')
    .setFooter({ text: `${member.guild.name} | Member since ${(member.guild.joinedAt).toDateString()}`, iconURL: `${member.guild.iconURL()}` });
    const leaveChannel = member.guild.channels.cache.get('1136445147547185252');
    const logChannel = member.guild.channels.cache.get('1136485668902682706');
    await leaveChannel.send({embeds: [leaveEmbed] , files: [attachment]});
    await logChannel.send({embeds: [leaveEmbed], files: [attachment]});
  },
};