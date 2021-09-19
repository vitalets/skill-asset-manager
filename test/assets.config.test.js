require('dotenv/config');

const { ALICE_OAUTH_TOKEN, ALICE_SKILL_ID, MARUSYA_SKILL_TOKEN } = process.env;

module.exports = {
  images: {
    pattern: target => target.platform === 'alice'
      ? 'test/data/*.png'
      : 'test/data/*x600.png',
  },
  sounds: {
    pattern: 'test/data/*.mp3',
  },
  targets: [
    {
      name: 'alice',
      platform: 'alice',
      imagesDbFile: 'temp/alice.images.json',
      soundsDbFile: 'temp/alice.sounds.json',
      token: ALICE_OAUTH_TOKEN,
      skillId: ALICE_SKILL_ID,
    },
    {
      name: 'marusya',
      platform: 'marusya',
      imagesDbFile: 'temp/marusya.images.json',
      soundsDbFile: 'temp/marusya.sounds.json',
      token: MARUSYA_SKILL_TOKEN,
      soundsOwnerId: -2000512016,
    }
  ]
};
