const Discord = require('discord.js');
exports.run = (client, message, args) => {
 
    if (!message.guild) {
        const ozelmesajuyari = new Discord.RichEmbed()
            .setColor(0xFF0000)
            .setTimestamp()
            .setAuthor(message.author.username, message.author.avatarURL)
            .addField(':warning: **Uyarı** :warning:', '`rol-al` **adlı komutu özel mesajlarda kullanamazsın.**')
        return message.author.sendEmbed(ozelmesajuyari);
    }
    let guild = message.guild
    let rol = message.mentions.roles.first()
    let user = message.mentions.members.first()
 
    if (!user) return message.reply('**Kimden rol alacağımı yazmadın!**').catch(console.error);
    if (rol.length < 1) return message.reply('**Rolü belirtmedin**');
    user.removeRole(rol);
const NewEmbed = new Discord.RichEmbed().addField(
    `Rol Al Sistemi`,
   `${user} Adlı Kullanıcıdan ${rol} rolü alındı.`
  );
  client.channels.get("726075945596747918").send(NewEmbed);
};
 
exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ['rolal'],
    permLevel: 3
};
 
exports.help = {
    name: 'rol-al',
    description: 'İstediğiniz kişiden istediğiniz rolü alır.',
    usage: 'rol-al [kullanıcı] [@rol]'
};