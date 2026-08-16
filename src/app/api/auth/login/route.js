import { NextResponse } from 'next/server'

const VALID_EMAIL = 'sagarnn84@gmail.com'
const VALID_PASSWORD = 'Sagar123@'

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      return NextResponse.json({
        success: true,
        user: {
          email: email,
          name: 'Sagar Nalwade',
          role: 'admin'
        }
      })
    }

    return NextResponse.json(
      { success: false, message: 'Invalid email or password' },
      { status: 401 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}