import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const assignmentId = id;

    // Fetch the completed assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('employee_policy_assignments')
      .select(`
        id,
        status,
        completed_at,
        notes,
        policy_bundles (
          name,
          description
        )
      `)
      .eq('id', assignmentId)
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .single() as any as any;

    if (assignmentError || !assignment) {
      return NextResponse.json(
        { error: 'Certificate not available' },
        { status: 404 }
      );
    }

    // Get user profile for certificate
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single() as any as any;

    const userName = profile?.full_name || profile?.email || 'Employee';
    const completedDate = new Date((assignment.completed_at as string)).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const bundleName = (assignment as any).policy_bundles?.name || 'Policy Bundle';

    // Generate simple PDF certificate
    // In production, use a proper PDF library like pdfkit or puppeteer
    // For now, returning a simple HTML version that can be printed/saved as PDF
    const certificateHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Certificate of Completion - ${bundleName}</title>
  <style>
    @page {
      size: letter landscape;
      margin: 0;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: 'Georgia', serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .certificate {
      width: 10in;
      height: 7.5in;
      background: white;
      padding: 60px 80px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      border: 20px solid white;
      box-sizing: border-box;
      position: relative;
    }
    .certificate::before {
      content: '';
      position: absolute;
      top: 30px;
      left: 30px;
      right: 30px;
      bottom: 30px;
      border: 3px solid #667eea;
      pointer-events: none;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .title {
      font-size: 48px;
      color: #667eea;
      font-weight: bold;
      margin: 0 0 10px 0;
      letter-spacing: 2px;
    }
    .subtitle {
      font-size: 20px;
      color: #666;
      margin: 0;
      font-style: italic;
    }
    .body {
      text-align: center;
      margin: 60px 0;
    }
    .awarded-to {
      font-size: 16px;
      color: #666;
      margin-bottom: 15px;
      text-transform: uppercase;
      letter-spacing: 3px;
    }
    .recipient-name {
      font-size: 42px;
      color: #333;
      font-weight: bold;
      margin: 0 0 30px 0;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
      display: inline-block;
    }
    .description {
      font-size: 18px;
      color: #555;
      line-height: 1.8;
      max-width: 700px;
      margin: 0 auto 40px;
    }
    .policy-name {
      font-size: 22px;
      color: #667eea;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      margin-top: 60px;
      padding-top: 30px;
      border-top: 2px solid #eee;
    }
    .signature-block {
      text-align: center;
      flex: 1;
    }
    .signature-line {
      border-top: 2px solid #333;
      margin-bottom: 8px;
      padding-top: 5px;
    }
    .signature-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .date {
      font-size: 14px;
      color: #333;
      font-weight: bold;
    }
    .seal {
      position: absolute;
      bottom: 60px;
      right: 80px;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 12px;
      font-weight: bold;
      text-align: center;
      line-height: 1.2;
      padding: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    @media print {
      body {
        background: white;
      }
      .certificate {
        box-shadow: none;
        page-break-after: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="header">
      <h1 class="title">CERTIFICATE</h1>
      <p class="subtitle">of Policy Acknowledgment</p>
    </div>

    <div class="body">
      <p class="awarded-to">This certifies that</p>
      <h2 class="recipient-name">${userName}</h2>
      <p class="description">
        has successfully reviewed, understood, and acknowledged compliance with the requirements of:
      </p>
      <div class="policy-name">${bundleName}</div>
    </div>

    <div class="footer">
      <div class="signature-block">
        <div class="signature-line">
          <div class="date">${completedDate}</div>
        </div>
        <div class="signature-label">Date of Completion</div>
      </div>

      <div class="signature-block">
        <div class="signature-line">
          <div class="date">ID: ${assignmentId.substring(0, 8).toUpperCase()}</div>
        </div>
        <div class="signature-label">Certificate ID</div>
      </div>
    </div>

    <div class="seal">
      HIPAA<br>COMPLIANT
    </div>
  </div>
</body>
</html>
    `;

    // Return HTML that can be printed/saved as PDF
    // In production, use a PDF generation library
    return new NextResponse(certificateHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="certificate_${assignmentId}.html"`,
      },
    });
  } catch (error) {
    console.error('Unexpected error in certificate API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
