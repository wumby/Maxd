import 'dotenv/config'

export default {
  expo: {
    scheme: 'maxd',
    name: 'maxd',
    slug: 'maxd',
    version: '1.0.0',
    extra: {
      API_URL: process.env.API_URL,
    },
  },
}
