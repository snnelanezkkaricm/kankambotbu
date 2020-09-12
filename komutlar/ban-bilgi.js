const Discord = require('discord.js');
const ayarlar = require('../ayarlar.json');

exports.run = async (client, message, args) => {
  if(!message.member.hasPermission('BAN_MEMBERS')) return message.reply('Bu komutu kullanabilmek için `Üyeleri Yasakla` iznine sahip olmalısın!');
  let yashinu = await require('quick.db').fetch(`prefix_${message.guild.id}`) || ayarlar.prefix
  if(!args[0] || isNaN(args[0])) return message.reply(`Geçerli bir ban yemiş kullanıcı ID'si belirtmelisin! => \`${yashinu}ban bilgi id\``)
  try {
    message.guild.fetchBan(args.slice(0).join(' '))
    .then(({ user, reason }) => message.channel.send(new Discord.RichEmbed().setAuthor(user.tag, user.avatarURL).setColor('RANDOM').addField('Banlanan Kullanıcı', `${user.tag} \`(${user.id})\``).setDescription(`**Ban Sebebi:** ${reason}`)))
  } catch(err) { message.reply('**Belirtilen ID numarasına sahip banlanmış kullanıcı bulamadım veya bir sorun oluştu!**') }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ['banbilgi', 'baninfo'],
  permLevel: 0
};

exports.help = {
  name: 'ban-bilgi',
  description: "IDsi girilen kullanıcının ban bilgilerini gösterir.",
  usage: 'ban-bilgi <id>',
  kategori: 'yetkili'
};