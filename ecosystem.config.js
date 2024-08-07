module.exports = {
    apps: [
      {
        name: 'server',
        script: 'ts-node',
        args: './src/server.ts',
        env: {
          NODE_ENV: 'development',
          PORT: 5000,
          MONGO_URI: 'mongodb+srv://shareef:shareef123@cluster0.2wuvnsx.mongodb.net/BROSTEL', 
          JWT_SECRET: 'your_jwt_secret',
          JWT_REFRESH_SECRET: 'your_refresh_secret',
          EMAIL: 'muhammedshereefshaz@gmail.com',
          PASSWORD: 'sdlg tvos vrsf gmto',
          RAZORPAY_KEY_ID: 'rzp_test_Vz3Fdh1bVQWYj8',
          RAZORPAY_KEY_SECRET: 'iqh0x4CGZ2mHJ7CTgrgfvgCo',
        },
        env_production: {
          NODE_ENV: 'production',
          PORT: process.env.PORT,
          MONGO_URI: process.env.MONGO_URI,
          JWT_SECRET: process.env.JWT_SECRET,
          JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
          EMAIL: process.env.EMAIL,
          PASSWORD: process.env.PASSWORD,
          RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
          RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
        },
      },
    ],
  };
  