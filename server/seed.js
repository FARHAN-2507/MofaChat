import User from './models/User.js';

const ADMIN_EMAIL = 'farhanakthar99@gmail.com';
const ADMIN_PASSWORD = 'Farhan@123';

export default async function seedAdmin() {
  try {
    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log(`Admin user already seeded (${ADMIN_EMAIL})`);
      return;
    }

    await User.create({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      name: 'Farhan Akthar',
      isAdmin: true,
    });

    console.log(`Admin user created: ${ADMIN_EMAIL}`);
  } catch (err) {
    console.error('Failed to seed admin user:', err.message);
  }
}
