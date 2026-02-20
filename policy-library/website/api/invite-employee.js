const allowedRoles = new Set(['privacy_officer', 'admin', 'compliance_manager'])

function readHeader(headers, key) {
  const raw = headers[key]
  return Array.isArray(raw) ? raw[0] : raw
}

function normalizeOrigin(originHeader) {
  if (!originHeader) return 'https://portal.oneguyconsulting.com'
  try {
    const url = new URL(originHeader)
    return `${url.protocol}//${url.host}`
  } catch {
    return 'https://portal.oneguyconsulting.com'
  }
}

async function sendResendEmail(params) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL
  if (!apiKey || !from) {
    throw new Error('Resend is not configured')
  }

  const subject = params.isExistingUser
    ? 'Sign in to One Guy Consulting Portal'
    : 'You are invited to the One Guy Consulting Portal'

  const intro = params.isExistingUser
    ? 'A Privacy Officer sent you a secure sign-in link.'
    : 'A Privacy Officer invited you to join the employee portal.'

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
      <h2 style="margin-bottom: 8px;">One Guy Consulting</h2>
      <p>Hello ${params.fullName || 'there'},</p>
      <p>${intro}</p>
      <p style="margin: 20px 0;">
        <a href="${params.actionLink}" style="background: #b45309; color: #fff; text-decoration: none; padding: 10px 16px; border-radius: 6px; display: inline-block;">
          Open Secure Link
        </a>
      </p>
      <p>If the button does not work, copy and paste this link:</p>
      <p><a href="${params.actionLink}">${params.actionLink}</a></p>
    </div>
  `

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject,
      html,
    }),
  })

  if (!resp.ok) {
    const details = await resp.text()
    throw new Error(`Resend send failed: ${details}`)
  }
}

async function jsonOrText(resp) {
  const text = await resp.text()
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    res.status(500).json({ error: 'Server invite configuration is missing.' })
    return
  }

  const authHeader = readHeader(req.headers, 'authorization')
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) {
    res.status(401).json({ error: 'Missing auth token.' })
    return
  }

  const parsedBody =
    typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
  const email = (parsedBody.email || '').trim().toLowerCase()
  const fullName = (parsedBody.full_name || '').trim()

  if (!email || !fullName) {
    res.status(400).json({ error: 'Full name and email are required.' })
    return
  }

  const userResp = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
    },
  })
  if (!userResp.ok) {
    res.status(401).json({ error: 'Invalid session. Please sign in again.' })
    return
  }
  const authUser = await jsonOrText(userResp)
  const userId = authUser && authUser.id
  if (!userId) {
    res.status(401).json({ error: 'Invalid session. Please sign in again.' })
    return
  }

  const profileResp = await fetch(
    `${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=role`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    }
  )
  if (!profileResp.ok) {
    res.status(403).json({ error: 'You do not have permission to invite users.' })
    return
  }
  const profiles = await jsonOrText(profileResp)
  const role = Array.isArray(profiles) ? profiles[0] && profiles[0].role : null
  if (!role || !allowedRoles.has(role)) {
    res.status(403).json({ error: 'You do not have permission to invite users.' })
    return
  }

  const origin = readHeader(req.headers, 'origin')
  const redirectTo = `${normalizeOrigin(origin)}/login/`
  const resendConfigured = !!process.env.RESEND_API_KEY && !!process.env.RESEND_FROM_EMAIL

  const inviteResp = await fetch(`${supabaseUrl}/auth/v1/invite`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      data: {
        full_name: fullName,
        role: 'employee',
      },
      redirect_to: redirectTo,
    }),
  })

  if (inviteResp.ok) {
    if (resendConfigured) {
      const linkResp = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
        method: 'POST',
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'invite',
          email,
          redirect_to: redirectTo,
          data: {
            full_name: fullName,
            role: 'employee',
          },
        }),
      })
      if (linkResp.ok) {
        const linkJson = await jsonOrText(linkResp)
        if (linkJson && linkJson.action_link) {
          await sendResendEmail({
            to: email,
            fullName,
            actionLink: linkJson.action_link,
            isExistingUser: false,
          })
        }
      }
    }

    res.status(200).json({ ok: true, mode: 'invite' })
    return
  }

  const inviteError = await jsonOrText(inviteResp)
  if (inviteError && inviteError.error_code === 'email_exists') {
    if (resendConfigured) {
      const linkResp = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
        method: 'POST',
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'magiclink',
          email,
          redirect_to: redirectTo,
        }),
      })

      if (!linkResp.ok) {
        const details = await jsonOrText(linkResp)
        res.status(500).json({ error: (details && details.msg) || 'Failed to generate sign-in link.' })
        return
      }

      const linkJson = await jsonOrText(linkResp)
      if (!linkJson || !linkJson.action_link) {
        res.status(500).json({ error: 'Failed to generate sign-in link.' })
        return
      }

      await sendResendEmail({
        to: email,
        fullName,
        actionLink: linkJson.action_link,
        isExistingUser: true,
      })

      res.status(200).json({ ok: true, mode: 'resend' })
      return
    }

    const otpResp = await fetch(`${supabaseUrl}/auth/v1/otp`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        create_user: false,
        email_redirect_to: redirectTo,
      }),
    })

    if (!otpResp.ok) {
      const details = await jsonOrText(otpResp)
      res.status(500).json({ error: (details && details.msg) || 'Failed to resend sign-in link.' })
      return
    }

    res.status(200).json({ ok: true, mode: 'resend' })
    return
  }

  res.status(500).json({
    error:
      (inviteError && (inviteError.msg || inviteError.message)) || 'Failed to send invitation email.',
  })
}
