import { API, Upload, Updates } from "vk-io";
import fs from "fs"

const api = new API({
	token: process.env.TOKEN
});

const upload = new Upload({
	api
});

const updates = new Updates({
    api,
    upload
})

const updateDB = () => {
    fs.writeFileSync("./data.json", JSON.stringify(MEMBERS))    
}

const achievements = [
    {msgCount: 100, text: "написал(а) первые 100 сообщений!"},
    {msgCount: 500, text: "написал(а) первые 500 сообщений!!"},
    {msgCount: 1000, text: "написал(а) 1000 сообщений!!!"},
    {msgCount: 2500, text: "написал(а) 2500 сообщений🎖"},
    {msgCount: 5000, text: "написал(а) 5000 сообщений🎖🎖"},
    {msgCount: 10000, text: "написал(а) 10000 сообщений!🎖🎖🎖"},
    {msgCount: 15000, text: "написал(а) 15000 сообщений!🏅"},
    {msgCount: 20000, text: "написал(а) 20000 сообщений!🏅🏅"},
    {msgCount: 25000, text: "написал(а) 25000 сообщений!🏅🏅🏅"},
    {msgCount: 30000, text: "написал(а) 30000 сообщений!🏆"},
    {msgCount: 35000, text: "написал(а) 35000 сообщений!🏆🏆"},
    {msgCount: 40000, text: "написал(а) 40000 сообщений!🏆🏆🏆"},
    {msgCount: 45000, text: "написал(а) 45000 сообщений!🔥"},
    {msgCount: 50000, text: "написал(а) 50000 сообщений!🔥🔥"},
    {msgCount: 60000, text: "написал(а) 60000 сообщений!🔥🔥🔥"},
    {msgCount: 70000, text: "написал(а) 70000 сообщений!💥"},
    {msgCount: 80000, text: "написал(а) 80000 сообщений!💥💥"},
    {msgCount: 90000, text: "написал(а) 90000 сообщений!💥💥💥"},
    {msgCount: 100000, text: "написал(а) 100000 сообщений!💯"},
] 


const MEMBERS = JSON.parse(
  fs.readFileSync(
    new URL('./data.json', import.meta.url)
  )
);

const beautify = (n) => {
    const beautyn = (""+n).split("").reverse().map((char, index) => {
        if (index%3 === 0) return char + " "
        return char
    }).reverse().join("")
    return beautyn
}

const generateStatMessage = (lim) => {
    let msg = ""
    let total = 0
    const sortedMembers = MEMBERS.sort((a, b) => b.msgCount - a.msgCount)
    sortedMembers.forEach((member, index) => {
        const smile = index === 0 ? "👑" : index > 0 && index <= 3 ? "⭐" : index > 3 && index <= 9 ? "💫" : "⬜"
        if (!lim || index < lim) {
            total+=member.msgCount
            msg+=`${smile} ${index+1}. ${member.name} -- ${beautify(member.msgCount)}\n`
        }
    })
    msg+="\nЛивнувшие -- 22 628"
    msg+=`\nВсего сообщений: ${beautify(total+22628)}`
    return msg
}

updates.on("message_new", (ctx) => {
    if ([2000000002].includes(ctx.peerId)) {
        const sortedMembers = MEMBERS.sort((a, b) => b.msgCount - a.msgCount)
        const user = sortedMembers.find((member) => member.ids.includes(ctx.senderId))
        const userIndex = sortedMembers.findIndex((member) => member.ids.includes(ctx.senderId))
        if (user) user.msgCount++
        
        const userAbove = sortedMembers[userIndex-1]

        if (ctx.message.text.toLowerCase().startsWith("дем ")) {
            const msg = ctx.message.text.slice(4)
            if (msg.startsWith("стат") || msg.startsWith("стата") || msg.startsWith("статистика")) {
                const lim = msg.replace("статистика", "").replace("стата", "").replace("стат", "").slice(1)
                let statMsg = ""
                if (lim == +lim) {
                    statMsg = generateStatMessage(lim)
                } else {
                    statMsg = generateStatMessage()
                }
                api.messages.send({
                    peer_id: ctx.peerId,
                    message: "Статистика \n\n" + statMsg,
                    random_id: Math.random()
                })
            }

            if (["я", "обо мне"].includes(msg) ?? user) {
                api.messages.send({
                    peer_id: ctx.peerId,
                    message: `[id${user.ids[0]}|${user.name}] -- ${beautify(user.msgCount)} сообщений`,
                    random_id: Math.random()
                })
            }
            
            if (["ник"].includes(msg.slice(0, 3)) && user) {
                const oldNickname = user.name
                const newNickname = msg.slice(4)
                user.name = newNickname
                
                api.messages.send({
                    peer_id: ctx.peerId,
                    message: `[id${user.ids[0]}|${oldNickname}], теперь ты ${newNickname}`,
                    random_id: Math.random()
                })
            }
        } 
      
        if (achievements.some(ach => ach.msgCount === user.msgCount)) {
            const achievement = achievements.find(ach => ach.msgCount === user.msgCount)
            api.messages.send({
                peer_id: ctx.peerId,
                message: `[id${user.ids[0]}|${user.name}] ${achievement.text}`,
                random_id: Math.random()
            })
        }

        if (userAbove && user.msgCount > userAbove.msgCount) {
            api.messages.send({
                peer_id: ctx.peerId,
                message: `Пользователь [id${user.ids[0]}|${user.name}] обогнал пользователя [id${userAbove.ids[0]}|${userAbove.name}] заняв ${userIndex} место!`,
                random_id: Math.random()
            })
        }
      
        updateDB()
    } 
})

updates.start();