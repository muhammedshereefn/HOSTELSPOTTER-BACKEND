module.exports = {
    apps: [
      {
        name: 'server',
        script: 'ts-node',
        args: './src/server.ts',
        env: {
          PORT: 5000,
          MONGO_URI: "mongodb+srv://shareef:shareef123@cluster0.2wuvnsx.mongodb.net/BROSTEL",
          JWT_SECRET: process.env.JWT_SECRET,
          JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
          EMAIL: process.env.EMAIL,
          PASSWORD: process.env.PASSWORD,
          RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
          RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
        },
        env_production: {
          NODE_ENV: 'production',
        },
      },
    ],
  };
  