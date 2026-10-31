import bcrypt from 'bcryptjs'
import { getAdminEmail } from './auth'
import { UserModel } from './models/User'

// .env is the source of truth: the admin account is created on the first start
// and its password is reset whenever ADMIN_PASSWORD changes.
export const ensureAdminUser = async () => {
  const email = getAdminEmail()
  const password = process.env.ADMIN_PASSWORD ?? ''

  if (!email || password.length < 8 || password.length > 72) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD (8-72 characters) must be set in .env')
  }

  const existing = await UserModel.findOne({ email })
  if (!existing) {
    const passwordHash = await bcrypt.hash(password, 10)
    await UserModel.create({ name: 'Адміністратор', email, passwordHash })
    console.log(`Admin user created: ${email}`)
    return
  }

  if (!(await bcrypt.compare(password, existing.passwordHash))) {
    existing.passwordHash = await bcrypt.hash(password, 10)
    await existing.save()
    console.log(`Admin password updated: ${email}`)
  }
}
