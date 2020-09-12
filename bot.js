const Discord = require('discord.js');
const client = new Discord.Client();
const ayarlar = require('./ayarlar.json');
const chalk = require('chalk');
const moment = require('moment');
var Jimp = require('jimp');
const { Client, Util } = require('discord.js');
const weather = require('weather-js')
const fs = require('fs');
const db = require('quick.db');
const http = require('http');
const express = require('express');
require('./util/eventLoader.js')(client);
const path = require('path');
const request = require('request');
const snekfetch = require('snekfetch');
const queue = new Map();
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core');


const app = express();
app.get("/", (request, response) => {
  console.log(Date.now() + "");
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

var prefix = ayarlar.prefix;

const log = message => {
    console.log(`${message}`);
};

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir('./komutlar/', (err, files) => {
    if (err) console.error(err);
    log(`${files.length} komut yüklenecek.`);
    files.forEach(f => {
        let props = require(`./komutlar/${f}`);
        log(`Yüklenen komut: ${props.help.name}.`);
        client.commands.set(props.help.name, props);
        props.conf.aliases.forEach(alias => {
            client.aliases.set(alias, props.help.name);
        });
    });
});




client.reload = command => {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`./komutlar/${command}`)];
            let cmd = require(`./komutlar/${command}`);
            client.commands.delete(command);
            client.aliases.forEach((cmd, alias) => {
                if (cmd === command) client.aliases.delete(alias);
            });
            client.commands.set(command, cmd);
            cmd.conf.aliases.forEach(alias => {
                client.aliases.set(alias, cmd.help.name);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

client.load = command => {
    return new Promise((resolve, reject) => {
        try {
            let cmd = require(`./komutlar/${command}`);
            client.commands.set(command, cmd);
            cmd.conf.aliases.forEach(alias => {
                client.aliases.set(alias, cmd.help.name);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};




client.unload = command => {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`./komutlar/${command}`)];
            let cmd = require(`./komutlar/${command}`);
            client.commands.delete(command);
            client.aliases.forEach((cmd, alias) => {
                if (cmd === command) client.aliases.delete(alias);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

client.elevation = message => {
    if (!message.guild) {
        return;
    }
    let permlvl = 0;
    if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
    if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
    if (message.author.id === ayarlar.sahip) permlvl = 4;
    return permlvl;
};

var regToken = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g;
// client.on('debug', e => {
//   console.log(chalk.bgBlue.green(e.replace(regToken, 'that was redacted')));
// });

client.on('warn', e => {
    console.log(chalk.bgYellow(e.replace(regToken, 'that was redacted')));
});

client.on('error', e => {
    console.log(chalk.bgRed(e.replace(regToken, 'that was redacted')));
});





client.on("guildMemberAdd", member => {
  let guvenlik = db.fetch(`bottemizle_${member.guild.id}`);
  if (!guvenlik) return;
  if (member.user.bot !== true) {
  } else {
    member.kick(member);
  }
});





client.on("message", async message => {
  let ever = await db.fetch(`ever_${message.guild.id}`);
  let sayı = await db.fetch(`sayi_${message.author.id}`);
  if (ever === "acik") {
    const a = message.content;
    if (a === "@everyone" || a === "@here") {
      if (message.member.hasPermission("BAN_MEMBERS")) return;
      db.add(`sayi_${message.author.id}`, 1);
      if (sayı == null) {
        const embed = new Discord.RichEmbed()
          .setColor("BLACK")
          .setDescription(
            "Bu 1. uyarın! Lütfen tekrarlama! Aksi taktirde atılacaksın!\n(1/3)"
          )
          .setFooter(client.user.username, client.user.avatarURL);
        message.channel.send(embed);
        message.delete();
        return;
      }
      if (sayı === 1) {
        const embed = new Discord.RichEmbed()
          .setColor("BLACK")
          .setDescription(
            "Bu 2. uyarın! Lütfen tekrarlama! Aksi taktirde atılacaksın!\n(2/3)"
          )
          .setFooter(client.user.username, client.user.avatarURL);
        message.channel.send(embed);
        message.delete();
        return;
      }
      if (sayı > 2) {
        message.delete();
        const embed = new Discord.RichEmbed()
          .setColor("BLACK")
          .setDescription("Sunucudan atılıyorsun!")
          .setFooter(client.user.username, client.user.avatarURL);
        message.channel.send(embed);
        db.delete(`sayi_${message.author.id}`);
        message.member.kick();
        return;
      }
    }
  } else {
    return;
  }
});

///////
/////////

client.on("ready", () => {
  client.channels.get("749270190763802714").join();
   ///// Bot sesli odada.
})

//////////////////////// Guardian /////////////////////////////////////

client.on('channelDelete', async(channel) => {
    const logChannel = channel.guild.channels.find('name', 'kanal-koruma');//LOG KANAL İSMİ
    if (!logChannel) return console.log('Log kanalı bulunamadı.');
    const entry = await channel.guild.fetchAuditLogs({type: 'CHANNEL_DELETE'}).then(audit => audit.entries.first());
  const yapanad = entry.executor;
  const id = entry.executor.id;
if (id === "732295412534476880") return;//KANALSİLDİĞİNDE ENGELLEMİYECEK KİŞİ İD
if (id === "") return;//KANALSİLDİĞİNDE ENGELLEMİYECEK KİŞİ İD

if (id === "") return;//KANALSİLDİĞİNDE ENGELLEMİYECEK KİŞİ İD
if (id === "") return;//KANALSİLDİĞİNDE ENGELLEMİYECEK KİŞİ İD
    const yetkili = entry.executor

    



  if (yetkili.id === "749067577245958245") return;//ÇEKİLECEK YETKİLİ ROL İD
 if (yetkili.id === "749067578269368411") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749612629286191145") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749067578756038717") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749067579183857746") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749067580211200071") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749234985034186773") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749294830919745584") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749234509332873277") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749234554983678033") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749234406044205148") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749234452684734585") return;//ÇEKİLECEK YETKİLİ ROL İD
  

    channel.clone(channel.name, true, true, "Silinen kanal bot tarafından geri açıldı.")
    .then( async clone => {
        clone.setParent(channel.parent);
        clone.setPosition(channel.position);
        clone.replacePermissionOverwrites(channel.overwrites);
        const embed = new Discord.RichEmbed()
        .setColor('RED')
        .setTitle('• Oda Koruması')
        .setDescription(`**${yetkili}**(${yetkili.id}) **${channel.name}** odasını silmeye çalıştı.  Yetkisini alıp silinen kanalı açtım.`);
        logChannel.send(embed);

  yetkili.send(`**${channel.name}** odasını silmeye çalıştınız.\n Yetkinizi Aldım Ve Sunucuyu Güvene Aldım.`);

    })    

});
////////////////////////////////////
   client.on("channelDelete", async channel => {
  const entry = await channel.guild
    .fetchAuditLogs({ type: "CHANNEL_DELETE" })
    .then(audit => audit.entries.first());
  const yapanad = entry.executor;
  const id = entry.executor.id;
if (id === "732295412534476880") return;//KANALSİLDİĞİNDE ENGELLEMİYECEK KİŞİ İD
if (id === "") return;//KANALSİLDİĞİNDE ENGELLEMİYECEK KİŞİ İD

if (id === "") return;//KANALSİLDİĞİNDE ENGELLEMİYECEK KİŞİ İD
if (id === "") return;//KANALSİLDİĞİNDE ENGELLEMİYECEK KİŞİ İD

  const yetkili = await channel.guild.members.get(entry.executor.id);
  if (yetkili.id === "749067577245958245") return;//ÇEKİLECEK YETKİLİ ROL İD
 if (yetkili.id === "749067578269368411") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749612629286191145") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749067578756038717") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749067579183857746") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749067580211200071") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749234985034186773") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749294830919745584") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749234509332873277") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749234554983678033") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749234406044205148") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749234452684734585") return;//ÇEKİLECEK YETKİLİ ROL İD
  

   
const sChannel = channel.guild.channels.find(c=> c.id ==="749643960732876940")//LOGKANALİD
  let embed = new Discord.RichEmbed()
    .setColor("BLACK")
    .setDescription(
      `<@${yetkili.id}>(${yetkili.id}) isimli yetkili ${channel.name} adlı kanalı sildi ve sahip olduğu tüm rolleri alarak, Sunucuyu Güvene Aldım.`
    )
    .setTimestamp();
sChannel.send(embed)

  yetkili.send(`**${channel.name}** odasını silmeye çalıştınız\n Yetkinizi Aldım Ve Sunucuyu Güvene Aldım.`);

  let roles = channel.guild.members.get(yetkili.id).roles.array();
  try {
    channel.guild.members.get(yetkili.id).removeRoles(roles);
  } catch (err) {
    console.log(err);
  }
  setTimeout(function() {
    
yetkili.ban();
  }, 1500);
});      
///////////////////////////////////////////////////////////
//SAĞ TK KICK ATINCA YETKİLERİ ÇEKME

client.on("guildMemberRemove", async member => {
  var guild = member.guild;
  const logChannel = guild.channels.find("name", "kick-koruma");//LOGKANALTAMADI
  const logChannel2 = client.channels.get(`749644150709813269`);//LOGKANALİD
  if (!logChannel) console.log("Log kanalı bulunamadı. - 3");
  if (!logChannel2) console.log("Log kanalı 2 bulunamadı.");
  const entry = await guild
    .fetchAuditLogs({ type: "MEMBER_KICK" })
    .then(audit => audit.entries.first());
  const yapanad = entry.executor;
  const id = entry.executor.id;
if (id === "732295412534476880") return;//KİCK ATINCA  ENGELLEMİYECEK KİŞİ İD
if (id === "") return;//KİCK ATINCA  ENGELLEMİYECEK KİŞİ İD
if (id === "") return;//KİCK ATINCA  ENGELLEMİYECEK KİŞİ İD
if (id === "") return;//KİCK ATINCA ENGELLEMİYECEK KİŞİ İD
  
  const yetkili = entry.executor;
  const yetkili2 = guild.members.get(`${yetkili.id}`);

  if (member.id !== entry.target.id) return;

  
  if (yetkili.id === "749067577245958245") return;//ÇEKİLECEK YETKİLİ ROL İD
 if (yetkili.id === "749067578269368411") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749612629286191145") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749067578756038717") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749067579183857746") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749067580211200071") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749234985034186773") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749294830919745584") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749234509332873277") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749234554983678033") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749234406044205148") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749234452684734585") return;//ÇEKİLECEK YETKİLİ ROL İD
  
  logChannel.send(
    `**${yetkili.tag}**(${yetkili.id}) isimli yetkili **${member.user.tag}**  isimli üyeye kick attı. (${yetkili})`
  );
  logChannel2.send(
    `**${yetkili.tag}**(${yetkili.id}) isimli yetkili **${member.user.tag}** isimli üyeye kick attı. (${yetkili})`
  );
  yetkili2.send(`**${member.user.tag}** isimli üyeye kick attınız.\n Yetkinizi Aldım Ve Sunucuyu Güvene Aldım.`);

  if (yetkili.id === "749067577245958245") return;//ÇEKİLECEK YETKİLİ ROL İD
 if (yetkili.id === "749067578269368411") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749612629286191145") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749067578756038717") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749067579183857746") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749067580211200071") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749234985034186773") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749294830919745584") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749234509332873277") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749234554983678033") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749234406044205148") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749234452684734585") return;//ÇEKİLECEK YETKİLİ ROL İD

  yetkili2.removeRoles(yetkili2.roles);
  

  guild.roles.forEach(sa => {
    if (sa.hasPermission("KICK_MEMBERS")) {
      if (!sa.editable) return;
      sa.setPermissions(0);
      logChannel.send(
        `**${sa.name}**(${sa.id}) rolünden bütün yetkiler alındı. `
      );
      logChannel2.send(
        `**${sa.name}** (${sa.id}) rolünden bütün yetkiler alındı.`
      );
      console.log(
        `**${sa.name}**(${sa.id}) rolünden bütün yetkiler alındı. `
      );
    }
  });
});
//////////////////////////////////////////////////////////
client.on("roleUpdate", async (oldRole, newRole, guild) => {
  const logChannel = oldRole.guild.channels.find("name", "rol-koruma");//LOGKANALINTAMADI
  if (!logChannel) console.log("Log kanalı bulunamadı.");
  const logChannel2 = client.channels.get("749644354968223804");//LOGKANALİD
  if (!logChannel2) console.log("Log kanalı bulunamadı.");
  const entry = await newRole.guild
    .fetchAuditLogs({ type: "ROLE_UPDATE" })
    .then(audit => audit.entries.first());
  const yapanad = entry.executor;
  const id = entry.executor.id;
if (id === "") return;//ENGELLENMİYECEK KİŞİ İD
if (id === "") return;//ENGELLENMİYECEK KİŞİ İD
if (id === "") return;//ENGELLENMİYECEK KİŞİ İD
  const yetkili = entry.executor;
  const yetkili2 = oldRole.guild.members.get(`${yetkili.id}`);
  
  if (yetkili.id === "749067577245958245") return;//ÇEKİLECEK YETKİLİ ROL İD
 if (yetkili.id === "749067578269368411") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749612629286191145") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749067578756038717") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749067579183857746") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749067580211200071") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749234985034186773") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749294830919745584") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749234509332873277") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749234554983678033") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749234406044205148") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749234452684734585") return;//ÇEKİLECEK YETKİLİ ROL İD

  if (newRole.hasPermission("MANAGE_ROLES")) {
    if (oldRole.hasPermission("MANAGE_ROLES")) return;
    newRole.setPermissions(oldRole.permissions);
    yetkili2.removeRoles(yetkili2.roles);
    
    logChannel.send(
      `**${yetkili.tag}** isimli yetkili **${newRole.name}(${oldRole.name})** rolüne ***Rolleri Yönet*** yetkisi vermeye çalıştı ve yetkileri alındı.(${yetkili}(${yetkili.id}))`
    );
    logChannel2.send(
      `**${yetkili.tag}** isimli yetkili **${newRole.name}(${oldRole.name})** rolüne ***Rolleri Yönet*** yetkisi vermeye çalıştı ve yetkileri alındı.(${yetkili}(${yetkili.id}))`
    );
  yetkili2.send(`**${newRole.name}(${oldRole.name})** Rolüne Yetki Verdiniz.\n Yetkinizi Aldım Ve Sunucuyu Güvene Aldım.`);

  }


if (newRole.hasPermission("BAN_MEMBERS")) {
    if (oldRole.hasPermission("BAN_MEMBERS")) return;
    newRole.setPermissions(oldRole.permissions);
    yetkili2.removeRoles(yetkili2.roles);
    
    logChannel.send(
      `**${yetkili.tag}** isimli yetkili **${newRole.name}(${oldRole.name})** rolüne ***Üyeleri Yasakla*** yetkisi vermeye çalıştı ve yetkileri alındı.(${yetkili}(${yetkili.id}))`
    );
    logChannel2.send(
      `**${yetkili.tag}** isimli yetkili **${newRole.name}(${oldRole.name})** rolüne ***Üyeleri Yasakla*** yetkisi vermeye çalıştı ve yetkileri alındı.(${yetkili}(${yetkili.id}))`
    );
  yetkili2.send(`**${newRole.name}(${oldRole.name})** Rolüne Yetki Verdiniz.\n Yetkinizi Aldım Ve Sunucuyu Güvene Aldım.`);

  }



  if (newRole.hasPermission("MANAGE_CHANNELS")) {
    if (oldRole.hasPermission("MANAGE_CHANNELS")) return;
    newRole.setPermissions(oldRole.permissions);
    yetkili2.removeRoles(yetkili2.roles);
    
    logChannel.send(
      `**${yetkili.tag}** isimli yetkili **${newRole.name}(${oldRole.name})** rolüne ***Kanalları Yönet*** yetkisi vermeye çalıştı ve yetkileri alındı.(${yetkili}(${yetkili.id}))`
    );
    logChannel2.send(
      `**${yetkili.tag}** isimli yetkili **${newRole.name}(${oldRole.name})** rolüne ***Kanalları Yönet*** yetkisi vermeye çalıştı ve yetkileri alındı.(${yetkili}(${yetkili.id}))`
    );
  yetkili2.send(`**${newRole.name}(${oldRole.name})** Rolüne Yetki Verdiniz.\n Yetkinizi Aldım Ve Sunucuyu Güvene Aldım.`);

  }

  if (newRole.hasPermission("MANAGE_GUILD")) {
    if (oldRole.hasPermission("MANAGE_GUILD")) return;
    newRole.setPermissions(oldRole.permissions);
    yetkili2.removeRoles(yetkili2.roles);
    
    logChannel.send(
      `**${yetkili.tag}** isimli yetkili **${newRole.name}(${oldRole.name})** rolüne ***Sunucuyu Yönet*** yetkisi vermeye çalıştı ve yetkileri alındı.(${yetkili}(${yetkili.id}))`
    );
    logChannel2.send(
      `**${yetkili.tag}** isimli yetkili **${newRole.name}(${oldRole.name})** rolüne ***Sunucuyu Yönet*** yetkisi vermeye çalıştı ve yetkileri alındı.(${yetkili}(${yetkili.id}))`
    );
  yetkili2.send(`**${newRole.name}(${oldRole.name})** Rolüne Yetki Verdiniz.\n Yetkinizi Aldım Ve Sunucuyu Güvene Aldım.`);

  }
if (newRole.hasPermission("ADMINISTRATOR")) {
    if (oldRole.hasPermission("ADMINISTRATOR")) return;
    newRole.setPermissions(oldRole.permissions);
    yetkili2.removeRoles(yetkili2.roles);
    
    logChannel.send(
      `**${yetkili.tag}** isimli yetkili **${newRole.name}(${oldRole.name})** rolüne ***Yönetici*** yetkisi vermeye çalıştı ve yetkileri alındı.(${yetkili}(${yetkili.id}))`
    );
    logChannel2.send(
      `**${yetkili.tag}** isimli yetkili **${newRole.name}(${oldRole.name})** rolüne ***Yönetici*** yetkisi vermeye çalıştı ve yetkileri alındı.(${yetkili}(${yetkili.id}))`
    );
  yetkili2.send(`**${newRole.name}(${oldRole.name})** Rolüne Yetki Verdiniz.\n Yetkinizi Aldım Ve Sunucuyu Güvene Aldım.`);

  }
});

///////////////////////////////////////////////////////
client.on(
  "roleDelete",
  (module.exports = async role => {
    const kanal = role.guild.channels.get("749644354968223804").id; //mod log kanal ıd
    if (!kanal) return;
    const guild = role.guild;
    const audit = await guild.fetchAuditLogs({ limit: 1 });
    const entry = await audit.entries.first();
  const yapanad = audit.executor;
  const id = audit.executor.id;
if (id === "") return;//YETKİSİ GİTMİYECEK ÜYE ROL İD
if (id === "") return;//YETKİSİ GİTMİYECEK ÜYE ROL İD
if (id === "") return;//YETKİSİ GİTMİYECEK ÜYE ROL İD
if (id === "") return;//YETKİSİ GİTMİYECEK ÜYE ROL İD    
    let bot = "[Bot]";
    if (!entry.executor.bot) bot = "";
    console.log("Roller Alındı Ve Sunucu Güvene Alındı");
    let log = role.guild.channels.find(
      channel => channel.name === "rol-koruma"//LOGKANALTAMADI
    );
    log.send(
      ">>> <@" +
        entry.executor.id +
        "> isimli kullanici bir rolü sildi ve yetkilerini hemen aldım.\n "
    );
   entry.executor.id.send(`** ${entry.executor.id} ** Rolünü Sildiniz.\n Yetkinizi Aldım Ve Sunucuyu Güvene ALdım.`);

    role.guild.members.get(entry.executor.id).roles.forEach(r => {
      role.guild.members.get(entry.executor.id).removeRole(r);
      console.log("rolleralindi");
    });
  })
);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
client.on("roleUpdate", async(oldRole, newRole) => {
    
  let alvin = db.fetch(`rolyetkikoruma_${oldRole.guild.id}`)
  if(alvin) {
    const entry = await oldRole.guild.fetchAuditLogs({type: 'ROLE_UPDATE'}).then(audit => audit.entries.first())
if((entry.executor.id === client.user.id)) return;
  const yapanad = entry.executor;
  const id = entry.executor.id;
if (id === "") return;//YETKİSİ GİTMİYECEK ÜYE ROL İD
if (id === "") return;//YETKİSİ GİTMİYECEK ÜYE ROL İD
if (id === "") return;//YETKİSİ GİTMİYECEK ÜYE ROL İD
if (id === "") return;//YETKİSİ GİTMİYECEK ÜYE ROL İD 
    let kisi = oldRole.guild.member(entry.executor);
kisi.roles.filter(a => a.hasPermission('ADMINISTRATOR')).forEach(x => kisi.removeRole(x.id))
kisi.roles.filter(a => a.hasPermission('MANAGE_CHANNELS')).forEach(x => kisi.removeRole(x.id))
kisi.roles.filter(a => a.hasPermission('MANAGE_ROLES')).forEach(x => kisi.removeRole(x.id))

client.channels.get(`749644354968223804`)

    newRole.edit({
      name: oldRole.name,
      color: oldRole.color,
      position: oldRole.position,
      permissions: oldRole.permissions,
      hoist: oldRole.hoist,
      mentionable: oldRole.mentionable,
      position: oldRole.position
    });
   kisi.send(`**${newRole.name}(${oldRole.name})** Rolünün Yetkisini Güncellediniz.\n Yetkinizi Aldım Ve Sunucuyu Güvene ALdım.`);

  }
});
 
///////////////////////////////////////////////////////
client.on("guildMemberUpdate", async (oldUser, newUser) => {
  const audit = await oldUser.guild
    .fetchAuditLogs({ type: "MEMBER_ROLE_UPDATE" })
    .then(audit => audit.entries.first());
  const yapanad = audit.executor;
  const id = audit.executor.id;
  if (id === client.user.id || id === oldUser.guild.ownerID) return;
if (id === "") return;//YETKİSİ GİTMİYECEK ÜYE ROL İD
if (id === "") return;//YETKİSİ GİTMİYECEK ÜYE ROL İD
if (id === "") return;//YETKİSİ GİTMİYECEK ÜYE ROL İD
if (id === "") return;//YETKİSİ GİTMİYECEK ÜYE ROL İD 
  
  if (yapanad.id === "749067577245958245") return;//ÇEKİLECEK YETKİLİ ROL İD
 if (yapanad.id === "749067578269368411") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yapanad.id === "749612629286191145") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yapanad.id === "749067578756038717") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yapanad.id === "749067579183857746") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yapanad.id === "749067580211200071") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yapanad.id === "749234985034186773") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yapanad.id === "749294830919745584") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yapanad.id === "749234509332873277") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yapanad.id === "749234554983678033") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yapanad.id === "749234406044205148") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yapanad.id === "749234452684734585") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (audit.executor.bot) return;
  //if ("662371003409760298") return;

  let role_name = "";
  let pasif = "";
  const db = require("quick.db");
  if (oldUser.roles.size < newUser.roles.size) {
    oldUser.roles.forEach(r => {
      db.set(`${r.id}`, "X");
    });
    newUser.roles.forEach(async r => {
      let check = await db.fetch(`${r.id}`);
      if (!check) {
        if (
          r.hasPermission("ADMINISTRATOR") ||
          r.hasPermission("MANAGE_CHANNELS") ||
          r.hasPermission("MANAGE_ROLES") ||
          r.hasPermission("BAN_MEMBERS") ||
          r.hasPermission("MANAGE_WEBHOOKS") ||
          r.hasPermission("MANAGE_GUILD") ||
          r.hasPermission("KICK_MEMBERS")
        ) {
          newUser.removeRole(r.id);
          role_name = r.name;
          const kanal = client.channels.get("749644354968223804");//LOGKANALİD
          kanal.send(
            `(**<@${audit.executor.id}>** (${audit.executor.id})) İsimli Yetkili , Bir Üyeye Rol Vermeye Çalıştığı İçin Rol Alındı.\n Rolü Vermeye Çalıştığı Kişi: (<@${newUser.id}> (${newUser.id}))\nVermeye Çalıştığı Rol İse: (**${role_name}** (${r.id}))  `
          );
   audit.executor.send(`**(<@${newUser.id}> (${newUser.id}))** Adlı Kullanıcıya (**${role_name}** (${r.id})) Rolunu Verdiniz \n Lakin Ben Koruma Sayesinde Kullanıcıdan O Rolu Çektim. \n Herhangi Bİ Hata Olduğunu Düşünüyorsanız Sunucu Saihib İLe Görüşünüz.`);

        } else {
          pasif = "x";
        }
      }
    });
    newUser.roles.forEach(r => {
      db.delete(`${r.id}`);
    });
  }
});
///////////////////////////////////////////////////////
client.on("roleUpdate", async function(oldRole, newRole) {
  const bilgilendir = await newRole.guild
    .fetchAuditLogs({ type: "ROLE_UPLATE" })
    .then(hatırla => hatırla.entries.first());
  let yapanad = bilgilendir.executor;
  let idler = bilgilendir.executor.id;
if (idler === "") return;// yapan kişinin id si bu ise bir şey yapma
if (idler === "") return;// yapan kişinin id si bu ise bir şey yapma
if (idler === "") return;// yapan kişinin id si bu ise bir şey yapma
if (idler === "") return;// yapan
  if (oldRole.hasPermission("ADMINISTRATOR")) return;

  setTimeout(() => {
    if (newRole.hasPermission("ADMINISTRATOR")) {
      newRole.setPermissions(newRole.permissions - 8);
    }

    if (newRole.hasPermission("ADMINISTRATOR")) {
      if (
        !client.guilds.get(newRole.guild.id).channels.has("749644354968223804")//LOG KANAL İD
      )
        return newRole.guild.owner.send(
          `Rol Koruma Nedeniyle ${yapanad}(${yapanad.id}) Kullanıcısı Bir Role Yönetici Verdiği İçin Rolün **Yöneticisi** Alındı. \Rol: **${newRole.name}**`
        ); //bu id ye sahip kanal yoksa sunucu sahibine yaz

      client.channels
        .get("749644354968223804")
        .send(
          `Rol Koruma Nedeniyle ${yapanad}(${yapanad.id}) Kullanıcısı Bir Role Yönetici Verdiği İçin Rolün **Yöneticisi Alındı**. \Rol: **${newRole.name}**`
        ); // belirtilen id ye sahip kanala yaz
   yapanad.send(`**Siz** Herhangi Bir Role Yetrki Veridğiniz İçin Rolden Yönetici Alındı.`);

    }
  }, 1000);
});
///////////////////////////////////////////////////////

///////////////////////////////////////////////////////
client.on("roleCreate", async function(role) {


if(role.guild.id !== "749064369643585567") return;//SUNUCUİD
    let logs = await role.guild.fetchAuditLogs({type: 'ROLE_CREATE'});
    if(logs.entries.first().executor.bot) return;
    role.guild.member(logs.entries.first().executor).roles.filter(role => role.name !== "@everyone").array().forEach(role => {
 if((role.executor.id === client.user.id)) return;
  const yapanad = role.executor;
  const id = role.executor.id;
if (id === "") return;// yapan kişinin id si bu ise bir şey yapma// yapan kişinin id si bu ise bir şey yapma// yapan kişinin id si bu ise bir şey yapma
if (id === "") return;// yapan kişinin id si bu ise bir şey yapma// yapan kişinin id si bu ise bir şey yapma
if (id === "") return;// yapan kişinin id si bu ise bir şey yapma// yapan kişinin id si bu ise bir şey yapma
if (id === "") return;// yapan kişinin id si bu ise bir şey yapma
              role.guild.member(logs.entries.first().executor).removeRole(role.guild.roles.get("749067577245958245"))//ÇEKİLECEK ROL İD
   role.guild.member(logs.entries.first().executor).removeRole(role.guild.roles.get("749067578269368411"))//ÇEKİLECEK ROL İD
role.guild.member(logs.entries.first().executor).removeRole(role.guild.roles.get("749612629286191145"))//ÇEKİLECEK ROL İD
role.guild.member(logs.entries.first().executor).removeRole(role.guild.roles.get("749067578756038717"))//ÇEKİLECEK ROL İD
      role.guild.member(logs.entries.first().executor).removeRole(role.guild.roles.get("749067579183857746"))//ÇEKİLECEK ROL İD
   role.guild.member(logs.entries.first().executor).removeRole(role.guild.roles.get("749067580211200071"))//ÇEKİLECEK ROL İD
      role.guild.member(logs.entries.first().executor).removeRole(role.guild.roles.get("749234985034186773"))//ÇEKİLECEK ROL İD
      role.guild.member(logs.entries.first().executor).removeRole(role.guild.roles.get("749294830919745584"))//ÇEKİLECEK ROL İD
  role.guild.member(logs.entries.first().executor).removeRole(role.guild.roles.get("749234509332873277"))//ÇEKİLECEK ROL İD
role.guild.member(logs.entries.first().executor).removeRole(role.guild.roles.get("749234554983678033"))//ÇEKİLECEK ROL İD
role.guild.member(logs.entries.first().executor).removeRole(role.guild.roles.get("749234406044205148"))//ÇEKİLECEK ROL İD
      role.guild.member(logs.entries.first().executor).removeRole(role.guild.roles.get("749234452684734585"))//ÇEKİLECEK ROL İ
    })

const sChannel = role.guild.channels.find(c=> c.id ==="749644354968223804")//LOGKANALİD
  let modlog = new Discord.RichEmbed() 
  .setColor('RANDOM')
  .setDescription(` ${role.name} adlı rol açıldı açan kişinin yetkileri alındı. \n Sunucu Güvende. `)
  .setTimestamp()

   sChannel.send(modlog)

}) 
///////////////////////////////////////////////////////

///////////////////////////////////////////////////////
//roledelete
client.on("roleDelete" ,module.exports = async role => {
  const kanal = role.guild.channels.get("v").id;//LOGKANALİD
  if (!kanal) return;
  const guild = role.guild;
  const audit = await guild.fetchAuditLogs({ limit: 1 }); //değiştirebilirsiniz
    const entry = await audit.entries.first();
if((entry.executor.id === client.user.id)) return;
  const yapanad = entry.executor;
  const id = entry.executor.id;
if (id === "") return;// yapan kişinin id si bu ise bir şey yapma
if (id === "") return;// yapan kişinin id si bu ise bir şey yapma
if (id === "") return;// yapan kişinin id si bu ise bir şey yapma
if (id === "") return;// yapan kişinin id si bu ise bir şey yapma
let bot = '[Bot]';
    if (!entry.executor.bot) bot = '';
  console.log("Roller Alındı Ve Sunucu Güvene Alındı") 
  const embed = await new Discord.RichEmbed()
        .setTitle('**Role Deleted**')
        .addField('Role', `@${role.name}\n\`${role.id}\``, true)
        .addField('Deleted by', `\`\`${entry.executor.tag} ${bot}\`\`\n\`${entry.executor.id}\``, true)
        .setFooter('Novamente Guard')
        .setTimestamp(Date.now())
        .setColor("RANDOM");
 let log = role.guild.channels.find( channel => channel.name === "749644354968223804");//LOGKANALİD
 log.send(">>> <@"+entry.executor.id+"> isimli kullanici bir rolü sildi ve yetkilerini hemen aldım. ")
role.guild.members.get(entry.executor.id).roles.forEach(r => {
role.guild.members.get(entry.executor.id).removeRole(r)
console.log("rolleralindi")

})
})
////////////////////////////////////////////
client.on("roleDelete", async role => {
  const entry = await role.guild
    .fetchAuditLogs({ type: "ROLE_DELETE" })
    .then(audit => audit.entries.first());
 const yapanad = entry.executor;
  const id = entry.executor.id;
if (id === "") return;// yapan kişinin id si bu ise bir şey yapma
if (id === "") return;// y// yapan kişinin id si bu ise bir şey yapma
if (id === "") return;
if (id === "") return;
  const yetkili = await role.guild.members.get(entry.executor.id);
  const eskihali = role.permissions;
  console.log(eskihali);
  if (yetkili.id === "749067577245958245") return;//ÇEKİLECEK YETKİLİ ROL İD
 if (yetkili.id === "749067578269368411") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749612629286191145") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749067578756038717") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749067579183857746") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749067580211200071") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749234985034186773") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749294830919745584") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749234509332873277") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749234554983678033") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749234406044205148") return;//ÇEKİLECEK YETKİLİ ROL İD
  if (yetkili.id === "749234452684734585") return;//ÇEKİLECEK YETKİLİ ROL İD
  const sChannel = role.guild.channels.find(c=> c.id ==="749644354968223804")//LOGKANALİD
  let embed = new Discord.RichEmbed()
    .setColor("RED")
    .setDescription(
      `<@${yetkili.id}>(${yetkili.id}) isimli kişi ${role.name} isimli rolü sildi yetkileri alındı, Sunucu Güvene Aldındı.`
    )
    .setTimestamp();
sChannel.send(embed)
  let roles = role.guild.members.get(yetkili.id).roles.array();
  try {
    role.guild.members.get(yetkili.id).removeRoles(roles);
  } catch (err) {
    console.log(err);
  }
  setTimeout(function() {
    

  }, 1500);
 let rolss = role.guild.roles.find(rol => rol.id === `${role.id}`);


  role.guild.createRole({
        name: role.name,
        color: role.color,
        permissions: eskihali
      })

rolss.guild.members.forEach(u => {
u.addRole(rolss)
})

});
/////////////////////////////////////////////////////////////////////////////
client.on("guildBanAdd", async function(guild, user) {
    let logs = await guild.fetchAuditLogs({type: 'MEMBER_BAN_ADD'});
    if(logs.entries.first().executor.bot) return;
if((logs.executor.id === client.user.id)) return;
  const yapanad = logs.executor;
  const id = logs.executor.id;
if (id === "") return;// yapan kişinin id si bu ise bir şey yapma
if (id === "") return;// yapan kişinin id si bu ise bir şey yapma
if (id === "") return;// yapan kişinin id si bu ise bir şey yapma
if (id === "") return;// yapan kişinin id si bu ise bir şey yapma
    guild.member(logs.entries.first().executor).roles.filter(role => role.name !== "@everyone").array().forEach(role => {
          guild.member(logs.entries.first().executor).removeRole(guild.roles.get("749067577245958245"))//ÇEKİLECEK ROL İD
 guild.member(logs.entries.first().executor).removeRole(guild.roles.get("749067578269368411"))//ÇEKİLECEK ROL İD
guild.member(logs.entries.first().executor).removeRole(guild.roles.get("749612629286191145"))//ÇEKİLECEK ROL İD
 guild.member(logs.entries.first().executor).removeRole(guild.roles.get("749067578756038717"))//ÇEKİLECEK ROL İD
      guild.member(logs.entries.first().executor).removeRole(guild.roles.get("749067579183857746"))//ÇEKİLECEK ROL İD
guild.member(logs.entries.first().executor).removeRole(guild.roles.get("749067580211200071"))//ÇEKİLECEK ROL İD
 guild.member(logs.entries.first().executor).removeRole(guild.roles.get("749234985034186773"))//ÇEKİLECEK ROL İD
      guild.member(logs.entries.first().executor).removeRole(guild.roles.get("749294830919745584"))//ÇEKİLECEK ROL İD
guild.member(logs.entries.first().executor).removeRole(guild.roles.get("749234509332873277"))//ÇEKİLECEK ROL İD
 guild.member(logs.entries.first().executor).removeRole(guild.roles.get("749234554983678033"))//ÇEKİLECEK ROL İD
      guild.member(logs.entries.first().executor).removeRole(guild.roles.get("749234406044205148"))//ÇEKİLECEK ROL İD
guild.member(logs.entries.first().executor).removeRole(guild.roles.get("749234452684734585"))//ÇEKİLECEK ROL İD
    }) 

const sChannel = guild.channels.find(c=> c.id ==="736977469449568267")//LOGKANALİD
  let modlog = new Discord.RichEmbed() 
  .setColor('RANDOM')
  .setDescription(`${user}(${user.id}) adlı kişiye sağ tık ban atıldı atan kişinin yetkileri alındı `)
  .setTimestamp()

   sChannel.send(modlog)
}) 
//////////////// Guardian Son //////////////////

client.login(ayarlar.token);