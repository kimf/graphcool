/* eslint-env node */
/* eslint-disable object-shorthand */
/* eslint-disable no-console */
/* eslint-disable func-names */

// subscription {
//   Event(filter: {
//     mutation_in: [CREATED]
//   }) {
//     node {
//       id
//       startsAt
//       course {
//         id
//         club
//         name
//       }
//       scoringType
//       teamEvent
//     }
//   }
// }

const APP_ID = '92ef9314-1d1d-4c51-99c7-f265769161da'
const REST_KEY = 'ZjdiODc4YjktMTg5MC00YmE3LWIxNTAtMzViNGI4ZTU2Y2Rj'

const sendNotification = function (data) {
  const options = {
    host: 'onesignal.com',
    port: 443,
    path: '/api/v1/notifications',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${REST_KEY}`
    }
  }

  const https = require('https')
  const req = https.request(options, (res) => {
    res.on('data', (response) => {
      console.log('Response:')
      console.log(JSON.parse(response))
    })
  })

  req.on('error', (e) => {
    console.log('ERROR:')
    console.log(e)
  })

  req.write(JSON.stringify(data))
  req.end()
}

module.exports = function (event) {
  const createdEvent = event.data.Event.node
  const id = createdEvent.id
  const startsAt = createdEvent.startsAt
  const course = createdEvent.course
  const scoringType = createdEvent.scoringType
  const teamEvent = createdEvent.teamEvent
  const message = {
    app_id: APP_ID,
    contents: {
      en: `${startsAt}. ${course.club}: ${course.name} ${teamEvent ? 'Team' : 'Individual'}, ${scoringType}`,
      sv: `${startsAt}. ${course.club}: ${course.name} ${teamEvent ? 'Lag' : 'Individuell'}, ${scoringType === 'strokes' ? 'Slag' : 'Poäng'}`
    },
    headings: {
      en: 'New round added',
      sv: 'Ny runda tillagd'
    },
    subtitle: {
      en: 'Check it out',
      sv: 'Titta till den nu vetja'
    },

    data: {
      route: '/events',
      eventId: id
    },
    content_available: false,
    mutable_content: false,
    buttons: [
      { id: 'id1', text: 'Gå till runda', icon: 'ic_menu_share' }
    ],
    ios_badgeType: 'Increase',
    ios_badgeCount: 1,
    ios_sound: 'glf_swng.caf',
    collapse_id: 'new_round_1',
    android_group: 'Tisdagsgolfen',
    included_segments: 'All'
  }
  sendNotification(message)
}
