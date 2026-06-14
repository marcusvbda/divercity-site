/* eslint-disable @typescript-eslint/no-require-imports */

const SCOPES = ['signature', 'impersonation']

// CJS require at call time — prevents static import analysis from pulling
// docusign-esign into the client bundle.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ds(): any {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('docusign-esign')
}

export async function getDocuSignClient() {
  const { ApiClient } = ds()
  const client = new ApiClient()
  client.setBasePath(process.env.DOCUSIGN_BASE_PATH!)
  client.setOAuthBasePath(process.env.DOCUSIGN_OAUTH_BASE_PATH!)

  const raw = process.env.DOCUSIGN_PRIVATE_KEY_BASE64!
  const privateKey = raw.trimStart().startsWith('-----')
    ? Buffer.from(raw)
    : Buffer.from(raw, 'base64')

  const result = await client.requestJWTUserToken(
    process.env.DOCUSIGN_INTEGRATION_KEY!,
    process.env.DOCUSIGN_USER_ID!,
    SCOPES,
    privateKey,
    3600,
  )

  client.addDefaultHeader('Authorization', `Bearer ${result.body.access_token}`)
  return client
}

export async function createSigningSession({
  signerName,
  signerEmail,
  clientUserId,
  contractHtml,
  contractTitle,
  returnUrl,
}: {
  signerName: string
  signerEmail: string
  clientUserId: string
  contractHtml: string
  contractTitle: string
  returnUrl: string
}): Promise<{ envelopeId: string; signingUrl: string }> {
  const { EnvelopesApi } = ds()
  const client = await getDocuSignClient()
  const envelopesApi = new EnvelopesApi(client)
  const accountId = process.env.DOCUSIGN_ACCOUNT_ID!

  const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
  body { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.5; margin: 40px; color: #111; }
  h1 { font-size: 18pt; font-weight: bold; margin: 12px 0; }
  h2 { font-size: 15pt; font-weight: bold; margin: 10px 0; }
  h3 { font-size: 13pt; font-weight: bold; margin: 8px 0; }
  p  { margin: 6px 0; }
  ul { margin: 6px 0; padding-left: 20px; list-style: disc; }
  ol { margin: 6px 0; padding-left: 20px; list-style: decimal; }
  strong { font-weight: bold; }
  em { font-style: italic; }
  u { text-decoration: underline; }
</style>
</head><body>${contractHtml}</body></html>`

  const envelopeResult = await envelopesApi.createEnvelope(accountId, {
    envelopeDefinition: {
      emailSubject: `Contrato para assinatura — ${contractTitle}`,
      documents: [{
        documentBase64: Buffer.from(fullHtml).toString('base64'),
        name: contractTitle,
        fileExtension: 'html',
        documentId: '1',
      }],
      recipients: {
        signers: [{
          email: signerEmail,
          name: signerName,
          clientUserId,
          recipientId: '1',
          routingOrder: '1',
          tabs: {
            signHereTabs: [{
              documentId: '1',
              pageNumber: '1',
              recipientId: '1',
              tabLabel: 'Assinatura',
              xPosition: '100',
              yPosition: '680',
            }],
          },
        }],
      },
      status: 'sent',
    },
  })

  const envelopeId = envelopeResult.envelopeId!

  const viewResult = await envelopesApi.createRecipientView(accountId, envelopeId, {
    recipientViewRequest: {
      authenticationMethod: 'none',
      clientUserId,
      recipientId: '1',
      returnUrl,
      userName: signerName,
      email: signerEmail,
    },
  })

  return { envelopeId, signingUrl: viewResult.url! }
}

export async function getEnvelopeStatus(envelopeId: string): Promise<string> {
  const { EnvelopesApi } = ds()
  const client = await getDocuSignClient()
  const envelopesApi = new EnvelopesApi(client)
  const envelope = await envelopesApi.getEnvelope(process.env.DOCUSIGN_ACCOUNT_ID!, envelopeId)
  return envelope.status ?? 'unknown'
}
