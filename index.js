const express = require('express');
const {RtcTokenBuilder, RtcRole} = require('agora-access-token');
const http = require('http');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT;
const APP_ID = process.env.APP_ID;
const APP_CERTIFICATE = process.env.APP_CERTIFICATE;

// set response header
const nocache = (req, resp, next) => {
  resp.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  resp.header('Expires', '-1');
  resp.header('Pragma', 'no-cache');
  next();
}

//?sectionName=&uid=&role=&expireTime=
const generateAccessToken = (req, resp) => {

  
  // get channel name
  const channelName = req.query.sectionName;;
  if (!channelName) {
    return resp.status(500).json({ 'error': 'channel is required' });
  }
  // get uid 
  let uid = req.query.uid;
  if(!uid || uid == '') {
    uid = 0;
  }
  // get role
  let role = RtcRole.SUBSCRIBER;
  if (req.query.role == 'publisher') {
    role = RtcRole.PUBLISHER;
  }
  // get the expire time
  let expireTime = req.query.expireTime;
  if (!expireTime || expireTime == '') {
    expireTime = process.env.TOKEN_EXPIRE_TIME.parseInt;
  } else {
    expireTime = parseInt(expireTime, 10);
  }
  // calculate privilege expire time
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;
  // build the token
  const token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, uid, role, privilegeExpireTime);
  // return the token
  return resp.json({'success': true, 'token': token });
}

app.get('/access_token', nocache, generateAccessToken);


app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});