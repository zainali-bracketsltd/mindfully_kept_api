const express = require('express')
const { jwt, twiml } = require('twilio')

const Communication = require('./communication')

const TWILIO_STATUS_CALLBACK_URL = 'https://c5b7-124-29-215-62.ngrok.io'

const connectedCallClients = require('./connectedClients')

const createRouter = io => {
  const router = express.Router()

  router.get('/token/:userId', (req, res) => {
    try {
      const { userId } = req.params

      const accessToken = new jwt.AccessToken(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_API_KEY_SID,
        process.env.TWILIO_API_KEY_SECRET,
        {
          identity: userId,
          ttl: 36000
        }
      )

      const grant = new jwt.AccessToken.VoiceGrant({
        outgoingApplicationSid: process.env.TWIML_APP_SID,
        incomingAllow: true,
        pushCredentialSid: process.env.TWILIO_PUSH_CREDENTIAL_SID
      })

      accessToken.addGrant(grant)

      if (!connectedCallClients.includes(userId))
        connectedCallClients.push(userId)

      console.log({ connectedCallClients })

      res.status(200).json({ token: accessToken.toJwt() })
    } catch (error) {
      console.error(error)

      res.status(500).json({ message: 'Internal Server Error' })
    }
  })

  router.post('/connect', (req, res) => {
    try {
      const { To: phoneNumber, _direction } = req.body

      const twimlRes = new twiml.VoiceResponse()

      // The only number that can be used to queue successful calls with your Test Credentials is +15005550006.
      // var dial = twimlRes.dial({ callerId: '+15005550006' });

      console.log('*** dialing ***', { phoneNumber, _direction })

      if (_direction === 'OUTBOUND') {
        const dial = twimlRes.dial({ callerId: '+12342723072' })

        dial.number(
          {
            statusCallbackEvent: [
              'initiated',
              'ringing',
              'answered',
              'completed'
            ],
            statusCallback: `${TWILIO_STATUS_CALLBACK_URL}/twilio/callback`,
            statusCallbackMethod: `POST`
          },
          phoneNumber
        )
      } else {
        const dial = twimlRes.dial()

        console.log({ connectedCallClients })

        for (const client of connectedCallClients) {
          console.log({ client })

          dial
            .client(
              {
                statusCallbackEvent: [
                  'initiated',
                  'ringing',
                  'answered',
                  'completed'
                ],
                statusCallback: `${TWILIO_STATUS_CALLBACK_URL}/twilio/callback`,
                statusCallbackMethod: `POST`
              },
              // this must match the identity you provide while generating the token
              client
            )
            .parameter({
              name: 'test',
              value: '*** test ***'
            })
        }
      }

      res.status(200).send(twimlRes.toString())
    } catch (error) {
      console.error(error)

      res.status(500).json({ message: 'Internal Server Error' })
    }
  })

  router.post('/callback', (req, res) => {
    res.status(200).send()

    console.log('*** callback ***', req.body)
  })

  router.post('/incoming_sms', async (req, res) => {
    res.status(200).send()

    try {
      const sms = req.body

      console.log('*** sms received ***', sms)

      let newSMS = {
        _sender: sms.From,
        _receiver: sms.To,
        _messageSid: sms.MessageSid,
        status: sms.status
      }

      newSMS = await Communication.findOneAndUpdate(
        { _messageSid: newSMS._messageSid },
        newSMS,
        { upsert: true, new: true }
      ).lean()

      io.to('mindfully_kept').emit('INCOMING_SMS', newSMS)
    } catch (error) {
      console.error(error)

      res.status(500).json({ message: 'Internal Server Error' })
    }
  })

  router.post('/incoming_sms_fallback', (req, res) => {
    res.status(200).send()

    try {
      const sms = req.body

      console.log('*** sms fallback ***', sms)
    } catch (error) {
      console.error(error)

      res.status(500).json({ message: 'Internal Server Error' })
    }
  })

  router.post('/sms_callback', (req, res) => {
    res.status(200).send()

    try {
      const sms = req.body

      console.log('*** sms callback ***', sms)
    } catch (error) {
      console.error(error)

      res.status(500).json({ message: 'Internal Server Error' })
    }
  })

  return router
}

module.exports = createRouter
