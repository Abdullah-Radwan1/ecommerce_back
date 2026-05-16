const mongoose = require('mongoose');

async function main() {
  await mongoose.connect('mongodb+srv://beedo:gpjHmCISncCE6yDX@cluster0.fbktsp7.mongodb.net/ecommerce?appName=Cluster0');
  
  const User = mongoose.connection.collection('users');
  const users = await User.find({}).toArray();
  
  console.log("Users in DB:");
  users.forEach(u => {
    console.log(`- ${u.email}: role=${u.role}`);
  });
  
  process.exit(0);
}

main().catch(console.error);
