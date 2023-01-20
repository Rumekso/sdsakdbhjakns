const express = require("express");
const body_parser = require("body-parser");
const axios = require("axios");

require('dotenv').config();

const app = express().use(body_parser.json());

const token = process.env.TOKEN;
const mytoken = process.env.MYTOKEN;//prasath_token

app.listen(process.env.PORT, () => {
  console.log("webhook is listening");
});
const fetch = require('node-fetch')
let { isIgPostUrl, shortcodeFormatter } = require('insta-fetcher');

//to verify the callback url from dashboard side - cloud api side
app.get("/webhook", (req, res) => {
  let mode = req.query["hub.mode"];
  let challange = req.query["hub.challenge"];
  let token = req.query["hub.verify_token"];


  if (mode && token) {

    if (mode === "subscribe" && token === mytoken) {
      res.status(200).send(challange);
    } else {
      res.status(403);
    }

  }

});


app.post("/webhook", async (req, res) => { //i want some
  let body_param = req.body;

  console.log(JSON.stringify(body_param, null, 2));

  if (body_param.object) {
    // console.log("inside body param");
    if (body_param.entry &&
      body_param.entry[0].changes &&
      body_param.entry[0].changes[0].value.messages &&
      body_param.entry[0].changes[0].value.messages[0]
    ) {
      let phon_no_id = body_param.entry[0].changes[0].value.metadata.phone_number_id;
      let from = body_param.entry[0].changes[0].value.messages[0].from;
      let msg_body = body_param.entry[0].changes[0].value.messages[0].text.body;

      const body = msg_body
      global.prefix = /^[./~!#%^&+=\-,;:()]/.test(body) ? body.match(/^[./~!#%^&+=\-,;:()]/gi) : '#'
      const arg = body.substring(body.indexOf(' ') + 1)
      const args = body.trim().split(/ +/).slice(1);
      let flags = [];
      const isCmd = body.startsWith(global.prefix);
      const cmd = isCmd ? body.slice(1).trim().split(/ +/).shift().toLocaleLowerCase() : null
      const reactId = body_param.entry[0].changes[0].value.messages[0].id
      const pushname = body_param.entry[0].changes[0].value.contacts[0].profile.name
      

      // console.log("phone number " + phon_no_id);
      // console.log("from " + from);
      // console.log("boady param " + msg_body);
      function gambar(from, url) {
        axios({
          method: "POST",
          url: "https://graph.facebook.com/v15.0/" + phon_no_id + "/messages?access_token=" + token,
          data: {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: from,
            type: 'image',
            image: {
              link: url,
            }
          },
          headers: {
            "Content-Type": "application/json"
          }

        });
      }
      function text(from, text) {        // console.log(reactId)
        axios({
          method: "POST",
          url: "https://graph.facebook.com/v15.0/" + phon_no_id + "/messages?access_token=" + token,
          data: {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            context: {
              message_id: reactId
            },
            to: from,
            type: 'text',
            text: {
              preview_url: true,
              body: text
            }
          },
          headers: {
            "Content-Type": "application/json"
          }
        });
      }
      function video(from, url, caption) {
        axios({
          method: "POST",
          url: "https://graph.facebook.com/v15.0/" + phon_no_id + "/messages?access_token=" + token,
          data: {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: from,
            type: "video",
            video: {
              link: url,
              caption: caption
            },
            headers: {
              "Content-Type": "application/json"
            }
          }
        });
      }

      if (/https:\/\/.+\.tiktok.+/g.test(body)) {
        await text(from, 'Wait...')
        try {
          url = body.match(/https:\/\/.+\.tiktok.+/g)[0]
          const fet = await fetch('https://saipulanuar.ga/api/download/tiktok2?url=' + url)
          const res = await fet.json()
          console.log(res)
          // return await text(from, res.result.video.link1)
          await video(from, res.result.video.link2, res.result.judul)
        } catch (e) {
          console.log(e)
        }
      }

      if (isIgPostUrl(body)) {
        await text(from, 'Coming soon...')
      }

      if (body == 'ping') {
        await text(from, `Hai ${pushname}`)
      }

      if (/https?:\/\/(web\.|www\.|m\.)?(facebook|fb)\.(com|watch)\S+/g.test(body)) {
        await text(from, 'Wait...')
        url = body.match(/https?:\/\/(web\.|www\.|m\.)?(facebook|fb)\.(com|watch)\S+/g)[0];
        const datt = await fetch('https://saipulanuar.ga/api/download/fb?url=' + url)
        const data = await datt.json()
        await video(from, data.result.sd, data.result.title)
      }

      if (cmd == 'menu') {
        const caption = `SIMPLE DOWNLOADER\n\n- Tiktok\n- Facebook`
        await text(from, caption)
      }

      if (msg_body == 'halo') {
        await gambar(from, 'https://github.com/voiceflow/example-integration-whatsapp/blob/master/doc/add-number.png?raw=true')
      }

      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }

  }

});

app.get("/", (req, res) => {
  res.status(200).send("hello this is webhook setup");
});
