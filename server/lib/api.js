const { createConnection } = require('mysql')
const { promisify } = require('util')

const connection = createConnection({
  host: 'localhost',
  user: 'pos_android_events_user',
  password: ',*t{fk$JQ{]caJ37',
  database: 'pos_android_events'
})

const query = promisify(connection.query).bind(connection)

exports.findAllUsers = () => query('select u_id, u_username from u_users')

exports.findUserByUsername = (username) => query(`select u_id, u_username,
  u_password, u_token, u_logged_in, u_registered from u_users
  where u_username = ?`, [username])

exports.findUserByToken = (token) => query(`select u_id, u_username,
  u_password, u_token, u_logged_in, u_registered from u_users
  where u_token = ?`, [token])

exports.updateAuthToken = (username, token) => query(`update u_users
  set u_token = ?, u_logged_in = ? where u_username = ?`,
  [token, new Date(), username])

exports.createUser = (username, password, token) => query(`insert into
  u_users (u_username, u_password, u_token) values (?, ?, ?)`,
  [username, password, token])

exports.updatePassword = (username, password) => query(`update u_users
  set u_password = ? where u_username = ?`, [password, username])

exports.findAllEvents = () => query(`select e_id, e_title, e_description,
  e_start_date, e_end_date, e_all_day, e_u_organizer, u_username,
  e_v_venue, v_name, v_address from e_events
  left join u_users on e_u_organizer = u_id
  left join v_venues on e_v_venue = v_id`)

exports.findEvent = ({ id }) =>
  query(`select e_id, e_title, e_description, e_start_date, e_end_date,
    e_all_day, e_u_organizer, u_username, e_v_venue from e_events
    left join u_users on e_u_organizer = u_id
    where e_id = ?`, [id])

exports.createEvent = ({
  title, description, start_date, end_date, all_day, organizer, venue
}) =>
  query(`insert into e_events (e_title, e_description, e_start_date,
    e_end_date, e_all_day, e_u_organizer, e_v_venue) values
    (?, ?, ?, ?, ?, ?, ?)`,
    [ title, description, start_date, end_date, all_day, organizer, venue ])

const isSet = something => something !== undefined

exports.updateEvent = ({
  id, title, description, start_date, end_date, all_day, organizer, venue
}) => {
  const gen = set => `update e_events set ${set} where e_id = ?`
  return Promise.all([
    isSet(title) && query(gen('e_title = ?'), [title, id]),
    isSet(description) && query(gen('e_description = ?'), [description, id]),
    isSet(start_date) && query(gen('e_start_date = ?'), [start_date, id]),
    isSet(end_date) && query(gen('e_end_date = ?'), [end_date, id]),
    isSet(all_day) && query(gen('e_all_day = ?'), [all_day, id]),
    isSet(organizer) && query(gen('e_u_organizer = ?'), [organizer, id]),
    isSet(venue) && query(gen('e_v_venue = ?'), [venue, id])
  ])
}

exports.findUserEvents = ({ username }) =>
  query(`select e_id, ue_status, e_title, e_description, e_start_date,
    e_end_date, e_all_day, e_u_organizer, e_v_venue, v_name
    from ue_users_events
    left join u_users on ue_u_user = u_id
    inner join e_events on ue_e_event = e_id
    left join v_venues on e_v_venue = v_id
    where u_username = ?`, [username])

exports.findUserOrganizedEvents = ({ username }) =>
  query(`select e_id, e_title, e_description, e_start_date, e_end_date, e_all_day,
    e_u_organizer, u_username, e_v_venue, v_name
    from e_events
    left join u_users on e_u_organizer = u_id
    left join v_venues on e_v_venue = v_id
    where u_username = ?`, [username])

exports.findUserEvent = (userId, event) =>
  query(`select ue_e_event, ue_status from ue_users_events
    where ue_u_user = ?`, [userId])

exports.deleteEvent = ({ id }) =>
  query(`delete from e_events where e_id = ?`, [id])

exports.updateStatus = (userId, status, event) =>
  query(`update ue_users_events set ue_status = ?
    where ue_e_event = ? and ue_u_user = ?`,
    [status, event, userId])

exports.insertStatus = (userId, status, event) =>
  query(`insert into ue_users_events (ue_status, ue_e_event, ue_u_user)
    values (?, ?, ?)`,
    [status, event, userId])

exports.deleteStatus = (userId, event) =>
  query(`delete from ue_users_events where ue_u_user = ? and ue_e_event = ?`,
    [userId, event])

exports.findEventUsers = ({ event }) =>
  query(`select u_username, ue_status from ue_users_events
    inner join e_events on ue_e_event = e_id
    inner join u_users on ue_u_user = u_id
    where ue_e_event = ?`, [event])

exports.findVenue = ({ id }) =>
  query('select v_id, v_name, v_address from v_venues where v_id = ?', [id])

exports.findAllVenues = () =>
  query('select v_id, v_name, v_address from v_venues')

exports.createVenue = (name, address) =>
  query('insert into v_venues (v_name, v_address) values (?, ?)',
  [name, address])

exports.findVenueEvents = ({ venue }) =>
  query(`select e_id, e_title, e_description, e_start_date,
    e_end_date, e_all_day, e_u_organizer, u_username
    from e_events
    left join u_users on e_u_organizer = u_id
    where e_v_venue = ?`, [venue])
