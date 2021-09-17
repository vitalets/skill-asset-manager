require('dotenv/config');

const { ALICE_OAUTH_TOKEN, ALICE_SKILL_ID, MARUSYA_SKILL_TOKEN } = process.env;

module.exports = {
  images: {
    pattern: 'test/data/*.png',
  },
  sounds: {
    pattern: 'test/data/*.mp3',
  },
  targets: [
    {
      platform: 'alice',
      name: 'alice',
      dbFile: 'temp/alice.json',
      token: ALICE_OAUTH_TOKEN,
      skillId: ALICE_SKILL_ID,
    },
    {
      platform: 'marusya',
      name: 'marusya',
      dbFile: 'temp/marusya.json',
      token: MARUSYA_SKILL_TOKEN,
      soundsOwnerId: -2000512016,
    }
  ]
};
