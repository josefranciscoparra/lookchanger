import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

// Validation schema
const contactSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  subject: z.string().min(3, 'El asunto debe tener al menos 3 caracteres'),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = contactSchema.parse(body)

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE

    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase not configured, skipping database storage')
    } else {
      // Save to Supabase
      const supabase = createClient(supabaseUrl, supabaseKey)

      const { error: dbError } = await supabase
        .from('contact_messages')
        .insert([
          {
            name: validatedData.name,
            email: validatedData.email,
            subject: validatedData.subject,
            message: validatedData.message,
          },
        ])

      if (dbError) {
        console.error('Error saving to database:', dbError)
        // Continue anyway to send email
      }
    }

    // Send email with Resend
    const resendApiKey = process.env.RESEND_API_KEY
    const contactEmail = process.env.CONTACT_EMAIL

    console.log('🔍 Resend Debug:')
    console.log('  - API Key exists:', !!resendApiKey)
    console.log('  - Contact Email:', contactEmail)

    if (!resendApiKey || !contactEmail) {
      console.warn('⚠️ Resend not configured, skipping email notification')
      return NextResponse.json({
        success: true,
        message: 'Mensaje guardado correctamente',
      })
    }

    const resend = new Resend(resendApiKey)

    try {
      console.log('📧 Attempting to send email...')
      const result = await resend.emails.send({
        from: 'Lookah Contact <onboarding@resend.dev>', // Resend's test email
        to: contactEmail,
        subject: `[Lookah] ${validatedData.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Nuevo mensaje de contacto</h2>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Nombre:</strong> ${validatedData.name}</p>
              <p><strong>Email:</strong> ${validatedData.email}</p>
              <p><strong>Asunto:</strong> ${validatedData.subject}</p>
            </div>
            <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
              <h3 style="color: #555;">Mensaje:</h3>
              <p style="white-space: pre-wrap;">${validatedData.message}</p>
            </div>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #888; font-size: 12px;">
              Este mensaje fue enviado desde el formulario de contacto de Lookah
            </p>
          </div>
        `,
        replyTo: validatedData.email,
      })
      console.log('✅ Email sent successfully:', result)
    } catch (emailError) {
      console.error('❌ Error sending email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Mensaje enviado correctamente',
    })
  } catch (error) {
    console.error('Contact form error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Datos inválidos',
          errors: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Error al enviar el mensaje',
      },
      { status: 500 }
    )
  }
}