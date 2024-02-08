export const getGCPCredentials = () => {
    // for Vercel, use environment variables
    return process.env.GOOGLE_PRIVATE_KEY
        ? {
            credentials: {
                client_email: process.env.GCLOUD_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY,
            },
            projectId: process.env.GCP_PROJECT_ID,
        }
        // for local development, use gcloud CLI
        : { 
            keyFilename: process.env.KEY_FILENAME,
            projectId: process.env.PROJECT_ID,
            scopes: [
                'https://www.googleapis.com/auth/drive.readonly'
            ] 
        }
}