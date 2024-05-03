const baileys = require("@whiskeysockets/baileys")
const { makeWASocket, useMultiFileAuthState } = baileys
const { readFileSync } = require("fs")

const ID_POSTFIX = "@s.whatsapp.net"
const config = JSON.parse(readFileSync("config.json"))
const MACK_ID = config.mackPhoneNumber + ID_POSTFIX
const YOUR_ID = config.myPhoneNumber + ID_POSTFIX

const main = async () => {
  const { state, saveCreds } = await useMultiFileAuthState(
    "whatsapp_authentication_state"
  )
  const sock = makeWASocket({
    // can provide additional config here
    printQRInTerminal: true,
    auth: state,
  })

  /**
   * @param {string} message
   * @returns
   */
  const sendWarning = (message) => sock.sendMessage(YOUR_ID, { text: message })

  sock.ev.on("creds.update", saveCreds)
  sock.ev.on("messages.upsert", async (m) => {
    for (const message of m.messages) {
      if (message.key.fromMe && message.key.remoteJid === MACK_ID) {
        if (message?.message?.stickerMessage) {
          sendWarning("צעיר! אסור לשלוח סטיקרים!")
          sock.sendMessage(MACK_ID, {
            delete: message.key,
          })
        }

        if (message?.message?.reactionMessage?.text) {
          sendWarning("צעיר! אסור לשלוח תגובות באימוג׳ים!")
          sock.sendMessage(MACK_ID, {
            react: {
              text: "",
              key: message.message.reactionMessage.key,
            },
          })
        }

        if (message?.message?.conversation) {
          let text = message.message.conversation
          let isValid = true
          if (!text.startsWith("המפקד")) {
            sendWarning("צעיר! התייחס למפקד שלך כ׳המפקד׳")
            isValid = false
            text = "המפקד, " + text
          }

          if (text.includes("סבבה")) {
            sendWarning("צעיר! אסור לכתוב סבבה!")
            isValid = false
            text = text.replaceAll("סבבה", "טוב")
          }

          let textWithoutEmojis = text.replace(
            /\p{Extended_Pictographic}/gu,
            ""
          )
          if (text != textWithoutEmojis) {
            sendWarning("צעיר! אסור להשתמש באימוג׳ים!")
            isValid = false
            text = textWithoutEmojis
          }

          if (!isValid) {
            sock.sendMessage(MACK_ID, {
              text: text,
              edit: message.key,
            })
          }
        }
      }
    }
  })
}

main()
